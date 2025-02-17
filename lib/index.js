const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const { buildUploadUrl, buildCreateUrl, buildListUrl} = require('./helpers/utils');
const getDownloadLink = require('./helpers/download/download')

/**
 * Class to handle Terabox file operations
 */
class TeraboxUploader {
  constructor(credentials) {
    if (!credentials || !credentials.ndus || !credentials.appId || !credentials.uploadId) {
      throw new Error("Credentials are required (ndus, appId, uploadId).");
    }

    this.credentials = {
      ndus: credentials.ndus,
      cookies: `browserid=3BeB9xGWg2yuzOuPRnKtO0ZQx990OtItXpdwkRVAIKYiLxBkT8yVYM3TnVr=; lang=en; ndus=${credentials.ndus};`,
      appId: credentials.appId,
      uploadId: credentials.uploadId,
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
  async uploadFile(filePath, progressCallback, directory = '/') {
    try {
      const fileName = path.basename(filePath);
      const fileSize = fs.statSync(filePath).size;
      const uploadUrl = buildUploadUrl(fileName, this.credentials.uploadId, this.credentials.appId);

      // Preflight request (OPTIONS)
      await axios.options(uploadUrl, { headers: { Origin: 'https://www.1024terabox.com' } });

      // Upload the file as form data (POST)
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const postResponse = await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          Origin: 'https://www.1024terabox.com',
          Cookie: this.credentials.cookies,
        },
        onUploadProgress: (progressEvent) => {
          if (progressCallback) {
            progressCallback(progressEvent.loaded, progressEvent.total);
          }
        },
      });

      // Finalize the upload (Create call)
      const createUrl = buildCreateUrl();
      const createResponse = await axios.post(createUrl, new URLSearchParams({
        path: `${directory}/${fileName}`,
        size: fileSize,
        uploadid: this.credentials.uploadId,
        target_path: directory,
        block_list: JSON.stringify([postResponse.headers['content-md5']]),
        local_mtime: Math.floor(Date.now() / 1000),
      }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: this.credentials.cookies,
        },
      });

      // Return success message
      return {
        success: true,
        message: 'File uploaded successfully.',
        fileDetails: createResponse.data,
      };
    } catch (error) {
      console.error('Error during upload process:', error.response?.data || error.message || error);

      // Return failure message
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
      const finalDataArray = response.data.list;
      for (const file of finalDataArray) {
        const fid = file.fs_id;
        file.downloadLink = await getDownloadLink(this.credentials.ndus, fid);
      }
      
      return { success: true, message: 'File list retrieved successfully.', data: finalDataArray };
    } catch (error) {
      console.error('Error fetching file list:', error);
      return {
        success: false,
        message: error.response?.data?.error || error.message || 'Failed to fetch file list.',
      };
    }
  }
}

module.exports = TeraboxUploader;
