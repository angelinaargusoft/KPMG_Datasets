// datasetUploadHistoryRepository.js
const { v4: uuidv4 } = require("uuid");
const pool = require("../../config/database");

async function logDatasetUpload({ datasetUUID, endpointUUID, filename, fileSize }) {
  const uuid = uuidv4();
  const query = `
    INSERT INTO datasetUploadHistory
      (uuid, dataset, endpoint, filename, uploadedAt, fileSize)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(6), ?)
  `;
  const params = [
    uuid,
    datasetUUID || null,
    endpointUUID || null,
    filename || null,
    fileSize != null ? String(fileSize) : null,
  ];

  const [result] = await pool.execute(query, params);
  return { id: result.insertId, uuid };
}

module.exports = {
  logDatasetUpload,
};
