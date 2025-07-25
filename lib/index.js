const axios = require('axios');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const FormData = require('form-data');
const { buildUploadUrl, buildCreateUrl, buildListUrl } = require('./helpers/utils');
const getDownloadLink = require('./helpers/download/download');
const { deleteFile } = require('./helpers/fileDelete');
const { moveFile } = require('./helpers/fileMove');
const getShortUrl = require('./helpers/getShortUrl');

/**
 * Class to handle Terabox file operations
 */
class TeraboxUploader {
  constructor(credentials) {
    // Now require jsToken and browserId for deletion functionality
    if (
      !credentials ||
      !credentials.ndus ||
      !credentials.appId ||
      !credentials.uploadId ||
      !credentials.jsToken ||
      !credentials.browserId
    ) {
      throw new Error("Credentials are required (ndus, appId, uploadId, jsToken, browserId).");
    }

    this.credentials = {
      ndus: credentials.ndus,
      cookies: `browserid=3BeB9xGWg2yuzOuPRnKtO0ZQx990OtItXpdwkRVAIKYiLxBkT8yVYM3TnVr=; lang=en; ndus=${credentials.ndus};`,
      appId: credentials.appId,
      uploadId: credentials.uploadId,
      jsToken: credentials.jsToken,
      browserId: credentials.browserId,
    };
  }

  /**
   * Uploads a file to Terabox
   * @param {string} filePath - Path to the file to be uploaded
   * @param {function} progressCallback - Optional callback to track upload progress
   * @param {string} [directory='/'] - Optional directory where the file will be saved on Terabox
   * @returns {Promise<{success: boolean, message: string, fileDetails?: object}>} - A promise that resolves to an object indicating the result of the upload:
   *   - `success` (boolean): `true` if the upload was successful, `false` otherwise.
   *   - `message` (string): A message with the upload status (success or error).
   *   - `fileDetails` (optional object): The details of the file uploaded, returned only if the upload was successful.
   */


async uploadFile(fileOrUrl, progressCallback, directory = '/') {
  try {
    let fileName, fileSize, stream;

    // Detect if fileOrUrl is a URL or local path
    try {
      const parsed = new URL(fileOrUrl);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        fileName = path.basename(parsed.pathname);
        // Create HTTP stream
        stream = await new Promise((resolve, reject) => {
          const get = parsed.protocol === 'https:' ? https.get : http.get;
          const req = get(fileOrUrl, (res) => {
            if (res.statusCode !== 200) {
              reject(new Error(`Failed to get '${fileOrUrl}': ${res.statusCode}`));
              return;
            }
            // Get content-length from headers if present
            fileSize = parseInt(res.headers['content-length'], 10) || null;
            resolve(res);
          });
          req.on('error', reject);
        });
      }
    } catch {
      // Not a valid URL, treat as local path
      fileName = path.basename(fileOrUrl);
      fileSize = fs.statSync(fileOrUrl).size;
      stream = fs.createReadStream(fileOrUrl);
    }

    if (!fileName) throw new Error('Invalid file path or URL.');

    const uploadUrl = buildUploadUrl(fileName, this.credentials.uploadId, this.credentials.appId);

    // Preflight request (OPTIONS)
    await axios.options(uploadUrl, { headers: { Origin: 'https://www.1024terabox.com' } });

    // Build form data and append the stream
    const formData = new FormData();
    formData.append('file', stream, { filename: fileName, knownLength: fileSize });

    // Axios config with proper headers
    const headers = {
      ...formData.getHeaders(),
      Origin: 'https://www.1024terabox.com',
      Cookie: this.credentials.cookies,
    };

    // Important: if knownLength (fileSize) is null, you might need to handle it here
    if (fileSize) {
      headers['Content-Length'] = formData.getLengthSync();
    }

    const postResponse = await axios.post(uploadUrl, formData, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      onUploadProgress: (progressEvent) => {
        if (progressCallback) {
          progressCallback(progressEvent.loaded, progressEvent.total);
        }
      },
    });

    // Finalize the upload (Create call)
    const createUrl = buildCreateUrl();
    const createResponse = await axios.post(
      createUrl,
      new URLSearchParams({
        path: `${directory}/${fileName}`,
        size: fileSize || 0, // if unknown, might cause issues, test this
        uploadid: this.credentials.uploadId,
        target_path: directory,
        block_list: JSON.stringify([postResponse.headers['content-md5']]),
        local_mtime: Math.floor(Date.now() / 1000),
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: this.credentials.cookies,
        },
      }
    );

    return {
      success: true,
      message: 'File uploaded successfully.',
      fileDetails: createResponse.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data || error.message,
    };
  }
}
  /**
   * Fetches the file list from Terabox
   * @param {string} directory - Directory to fetch the file list from (e.g., "/")
   * @returns {Promise<object>} - JSON response with file details along with download link
   */
  async fetchFileList(directory = '/') {
    try {
      const listUrl = buildListUrl(this.credentials.appId, directory);

      const response = await axios.get(listUrl, {
        headers: {
          Cookie: this.credentials.cookies,
        },
      });

      return { success: true, message: 'File list retrieved successfully.', data: response.data };
    } catch (error) {
      console.error('Error fetching file list:', error);
      return {
        success: false,
        message: error.response?.data?.error || error.message || 'Failed to fetch file list.',
      };
    }
  }

  /**
 * Uploads a file to Terabox
 * @param {int} fileId - fs_id in file details
 * @returns {Promise<{success: boolean, message: string, fileDetails?: object}>} - A promise that resolves to an object with download link.
 */
  async downloadFile(fileId) {
    try {
      const ndus = this.credentials.ndus;
      const fid = fileId;
      const response = await getDownloadLink(ndus, fid);
      return response
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || error.message || 'Failed to fetch file list.',
      };
    }
  }

  /**
   * Deletes files from Terabox using the deletion API.
   * @param {Array} fileList - List of file paths to be deleted on Terabox
   * @returns {Promise<any>} - A promise that resolves to the deletion result.
   */
  async deleteFiles(fileList) {
    try {
      const config = {
        ndus: this.credentials.ndus,
        appId: this.credentials.appId,
        jsToken: this.credentials.jsToken,
        browserId: this.credentials.browserId,
      };
      const result = await deleteFile(fileList, config);
      return { success: true, message: 'Files deleted successfully.', result };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || error.message || 'Failed to delete files.',
      };
    }
  }

  /**
   * Moves files on Terabox using the move API.
   * Moves a file from one location to another with a new name.
   * @param {string} sourcePath - The current path of the file.
   * @param {string} destinationPath - The destination directory where the file will be moved.
   * @param {string} newName - The new name for the file.
   * @returns {Promise<any>} - A promise that resolves to the move result.
   */
  async moveFiles(sourcePath, destinationPath, newName) {
    try {
      const config = {
        ndus: this.credentials.ndus,
        appId: this.credentials.appId,
        jsToken: this.credentials.jsToken,
        browserId: this.credentials.browserId,
      };
      // Create file list for move operation as per API: [{"path":"/b","dest":"/a","newname":"c"}]
      const fileList = [{
        path: sourcePath,
        dest: destinationPath,
        newname: newName
      }];
      const result = await moveFile(fileList, config);
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates a short URL for a file on Terabox
   * @param {string} filePath - The file path on Terabox
   * @param {string} fileId - The file ID on Terabox
   * @returns {Promise<object>} - The API response containing the short URL
   */
  async generateShortUrl(filePath, fileId) {
    try {
      const shortUrlResponse = await getShortUrl(this.credentials.ndus, filePath, fileId);
      if (shortUrlResponse && shortUrlResponse.errno === 0) {
        return {
          success: true,
          message: 'Short URL generated successfully.',
          shortUrl: shortUrlResponse.shorturl,
        };
      } else {
        return {
          success: false,
          message: shortUrlResponse?.errmsg || 'Failed to generate short URL.',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while generating the short URL.',
      };
    }
  }
}

module.exports = TeraboxUploader;
