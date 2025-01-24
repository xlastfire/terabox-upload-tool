/**
 * Builds the URL for uploading a file chunk.
 * @param {string} fileName - The name of the file being uploaded
 * @param {string} uploadId - The unique ID for the upload session (optional)
 * @param {string} appId - The application ID (required)
 * @returns {string} - The upload URL
 */
function buildUploadUrl(fileName, uploadId, appId) {
  return `https://c-jp.1024terabox.com/rest/2.0/pcs/superfile2?method=upload&app_id=${appId}&channel=dubox&clienttype=0&web=1&path=%2F${encodeURIComponent(fileName)}&uploadid=${uploadId}&uploadsign=0&partseq=0`;
}

/**
 * Builds the URL for the final create call.
 * @returns {string} - The create URL
 */
function buildCreateUrl() {
  return 'https://www.1024terabox.com/api/create';
}

module.exports = { buildUploadUrl, buildCreateUrl };
