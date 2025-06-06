const { google } = require('googleapis');
const fs = require('fs');
const stream = require('stream');


const KEYFILE = 'account.json';
// Authenticate with service account
const auth = new google.auth.GoogleAuth({
  keyFile:KEYFILE, // your service account key
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

const botFolderId = ''; // Replace with your actual folder ID

async function getFileIdByName(fileName) {
  const res = await drive.files.list({
    q: `'${botFolderId}' in parents and name='${fileName}' and trashed=false`,
    fields: 'files(id)',
  });

  return res.data.files[0]?.id;
}

async function replaceFileContent(fileId, newText) {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(Buffer.from(newText, 'utf-8'));

  const res = await drive.files.update({
    fileId,
    media: {
      mimeType: 'text/plain',
      body: bufferStream,
    },
  });

  console.log('✅ File content replaced:', res.data.id);
}

// Main logic
async function run() {
  const fileName = 'sample.txt'; //Replace with actual file name
  const newContent = '🚀 This is the new content.\nLine 2 of new content.';

  const fileId = await getFileIdByName(fileName);
  if (!fileId) {
    console.error('❌ File not found.');
    return;
  }

  await replaceFileContent(fileId, newContent);
}

run().catch(console.error);
