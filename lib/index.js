const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const { buildUploadUrl, buildCreateUrl } = require('./utils');

/**
 * Class to handle Terabox file upload
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

      console.log('File chunk upload response:', postResponse.data);

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

      console.log('Create response:', createResponse.data);
    } catch (error) {
      console.error('Error during upload process:', error.response?.data || error.message);
    }
  }
}

module.exports = TeraboxUploader;
