const TeraboxUploader = require('terabox-upload-tool');

// Set up credentials for your account
const credentials = {
  ndus: 'valid_ndus', 
  appId: 'valid_appId',
  uploadId: 'valid_uploadId'
};

const uploader = new TeraboxUploader(credentials);

// Upload a file
const filePath = './path/to/your/file.jpg';


// Save file in a specific directory, e.g., '/my-uploads'
uploader.uploadFile(filePath, (uploaded, total) => {
  console.log(`Progress: ${(uploaded / total * 100).toFixed(2)}%`);
}, '/my-uploads');

// Save file in the root directory (default behavior)
uploader.uploadFile(filePath, (uploaded, total) => {
  console.log(`Progress: ${(uploaded / total * 100).toFixed(2)}%`);
});