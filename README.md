# Terabox Upload Tool

A simple and efficient Node.js library for uploading files to [TeraBox](https://www.terabox.com/wap) storage. This tool streamlines the process of file uploads while offering customization options such as directory selection.

## Features

* File Upload: Easily upload files to Terabox storage.
* Custom Directory Support: Specify the directory where the file should be uploaded.
* Progress Tracking: Monitor the upload progress in real-time.


## Coming Soon (Open for Collaboration)

* Fetch Files: Retrieve the files stored in your Terabox account.
* Delete Files: Remove files from your Terabox storage directly using this library.



## Installation

Install the package using npm:

```bash
npm install terabox-upload-tool

```

## Getting Started

### Setting up credentials

```javascript
const TeraboxUploader = require('terabox-upload-tool');

const credentials = {
  ndus: 'valid_ndus', //Required: Get this from your session (See guide below)
  appId: 'valid_appId', //Get from session (See attached screenshots)
  uploadId: 'valid_uploadId' //Get from session (See attached screenshots)
};

```
### Uploading a File
To upload a file, create an instance of TeraboxUploader and specify the file path.

#### Example: Save File to a Specific Directory

```javascript
const uploader = new TeraboxUploader(credentials);

const filePath = './path/to/your/file.jpg';

// Uploads to '/my-uploads'
uploader.uploadFile(filePath, (uploaded, total) => {
  console.log(`Progress: ${(uploaded / total * 100).toFixed(2)}%`);
}, '/my-uploads'); 
```

#### Example: Save File to Root Directly

```javascript

// Uploads to '/' 
uploader.uploadFile(filePath, (uploaded, total) => {
  console.log(`Progress: ${(uploaded / total * 100).toFixed(2)}%`);
}, '/my-uploads'); 
```

## Future Enhancements (Open Collaboration)
We are actively seeking contributors to add the following features:

1. Fetch Files:
    * Implement functionality to list files stored in Terabox directories.
    * Provide options to filter by file types, size, or date modified.

2. Delete Files:
    * Enable users to delete specific files or directories from their Terabox storage.
    * Include safeguards like confirmation prompts before deletion.

3. Error Handling Enhancements:
    * Improve error messages for easier debugging and user guidance.

4. Automated Tests:
    * Add test cases to ensure reliability and robustness.

5. Documentation Updates:

    * Expand guides with screenshots and example workflows.

## Contribution Guidelines

We welcome contributions from the community! Here’s how you can get started:

1. Fork the repository and create a new branch for your feature or bugfix.
2. Make your changes and ensure the code adheres to the project's style guide.
3. Submit a pull request detailing your changes and their purpose.
4. Feel free to open issues for feature requests or bug reports.

## Resources for Developers
* [Node.js File System Documentation](https://nodejs.org/api/fs.html)
* [Chrome Dev-Tools (Networks)](https://developer.chrome.com/docs/devtools/network)


<br>

Terabox Node.js Library

Upload Files to Terabox

Terabox API Integration

Terabox File Management

Node.js Terabox SDK

## Screenshots

For getting your credentials, go to the terabox, create an account and follow the steps:

![Login you account and open the developer tools](https://res.cloudinary.com/djjq0ds7o/image/upload/v1736944135/Screenshot_2025-01-15_164342_lqev64.png)
Login you account and open the developer tools
<br>
<br>
<br>

![Go to network tab](https://res.cloudinary.com/djjq0ds7o/image/upload/v1736944135/Screenshot_2025-01-15_164430_clhj2j.png)
Go to network tab
<br>
<br>
<br>

![Upload an image from left of your screen](https://res.cloudinary.com/djjq0ds7o/image/upload/v1736944135/Screenshot_2025-01-15_164628_hutnsg.png)
Upload an image from left of your screen
<br>
<br>
<br>

![Look for the following appId and uploadId from following request ](https://res.cloudinary.com/djjq0ds7o/image/upload/v1736945073/Screenshot_2025-01-15_164845_1_fxuvj9.png)
Look for 'appId' and 'uploadId' from following request
<br>
<br>
<br>

![Get the 'ndus' from the cookies in header section](https://res.cloudinary.com/djjq0ds7o/image/upload/v1736945222/Screenshot_2025-01-15_181119_zvnbt5.png)
Get the 'ndus' from cookies in the header section
<br>
<br>
<br>




## Licence

This project is licensed under the [MIT License.]() 



