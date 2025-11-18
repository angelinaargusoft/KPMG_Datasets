// datasetUploadHistoryRepository.js
const { v4: uuidv4 } = require("uuid");
const pool = require("../../config/database");

// Log a single upload event
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

// Get all uploads for a given dataset UUID
async function getUploadsByDatasetUUID(datasetUUID) {
  const query = `
    SELECT
      id,
      uuid,
      filename,
      fileSize,
      uploadedAt,
      endpoint
    FROM datasetUploadHistory
    WHERE dataset = ?
    ORDER BY uploadedAt DESC
  `;

  const [rows] = await pool.execute(query, [datasetUUID]);

  return rows.map((row) => ({
    id: row.id,
    uuid: row.uuid,
    name: row.filename,
    size: row.fileSize ? Number(row.fileSize) || null : null,
    uploadedAt: row.uploadedAt,
    endpointUUID: row.endpoint,
  }));
}

// 🔥 Get a single upload record by DB id
async function getUploadByRecordId(id) {
  const query = `
    SELECT
      id,
      uuid,
      dataset,
      filename,
      fileSize,
      uploadedAt,
      endpoint
    FROM datasetUploadHistory
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [id]);
  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    uuid: row.uuid,            // upload UUID
    datasetUUID: row.dataset,  // dataset UUID this upload belongs to
    name: row.filename,
    size: row.fileSize ? Number(row.fileSize) || null : null,
    uploadedAt: row.uploadedAt,
    endpointUUID: row.endpoint,
  };
}

// Delete a single upload record (by DB id)
async function deleteUploadRecord(id) {
  const query = `DELETE FROM datasetUploadHistory WHERE id = ?`;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0;
}

module.exports = {
  logDatasetUpload,
  getUploadsByDatasetUUID,
  getUploadByRecordId,
  deleteUploadRecord,
};


