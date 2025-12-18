// uploadValidator.js
const path = require("path");

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; 
const ALLOWED_EXTENSIONS = [
  ".txt",
  ".csv",
  ".pgp",
  ".gpg",
  ".xlsm",
  ".xlsx",
  ".xls",
  ".xml",
  ".zip",
];

const ALLOWED_MIME_TYPES = [
  "text/plain",                        // .txt
  "text/csv",                          // .csv
  "application/pgp-encrypted",         // .pgp
  "application/pgp-signature",         // .gpg (sometimes)
  "application/octet-stream",          // .pgp / .gpg (very common)
  "application/vnd.ms-excel",           // .xls
  "application/vnd.ms-excel.sheet.macroEnabled.12", // .xlsm
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/xml",                   // .xml
  "text/xml",                          // .xml
  "application/zip",                   // .zip
];

function validateUpload(buffer, blobName, mimeType) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Invalid file buffer");
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error("File size exceeds allowed limit");
  }

  const ext = path.extname(blobName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Unsupported file extension: ${ext}`);
  }

  if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`Unsupported MIME type: ${mimeType}`);
  }
}

module.exports = {
  validateUpload,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
};
