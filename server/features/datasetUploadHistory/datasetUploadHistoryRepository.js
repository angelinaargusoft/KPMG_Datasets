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

  await pool.execute(query, params);
  return { uuid };
}

async function getUploadsByDatasetUUIDPaginated(datasetUUID, page = 1, pageSize = 10) {
  // normalize pagination input
  const limit = Math.max(parseInt(pageSize, 10) || 10, 1);
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (currentPage - 1) * limit;

  // total count for this dataset
  const [countRows] = await pool.execute(
    `
      SELECT COUNT(*) AS total
      FROM datasetUploadHistory
      WHERE dataset = ?
    `,
    [datasetUUID]
  );

  const totalItems = countRows[0]?.total || 0;
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / limit);

  // fetch a page of data
  const query = `
    SELECT
      uuid,
      filename,
      fileSize,
      uploadedAt,
      endpoint
    FROM datasetUploadHistory
    WHERE dataset = ?
    ORDER BY uploadedAt DESC
    LIMIT ${offset}, ${limit}
  `;

  const [rows] = await pool.query(query, [datasetUUID]);

  const data = rows.map((row) => ({
    uuid: row.uuid,          // upload UUID
    name: row.filename,
    size: row.fileSize ? Number(row.fileSize) || null : null,
    uploadedAt: row.uploadedAt,
    endpointUUID: row.endpoint,
  }));

  return {
    data,
    pagination: {
      page: currentPage,
      pageSize: limit,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
}

async function getUploadByUUID(uploadUUID) {
  const query = `
    SELECT
      uuid,
      dataset,
      filename,
      fileSize,
      uploadedAt,
      endpoint
    FROM datasetUploadHistory
    WHERE uuid = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [uploadUUID]);
  const row = rows[0];
  if (!row) return null;

  return {
    uuid: row.uuid,              // upload UUID
    datasetUUID: row.dataset,    // dataset UUID
    name: row.filename,
    size: row.fileSize ? Number(row.fileSize) || null : null,
    uploadedAt: row.uploadedAt,
    endpointUUID: row.endpoint,
  };
}

async function deleteUpload(uploadUUID) {
  const query = `
    DELETE FROM datasetUploadHistory
    WHERE uuid = ?
  `;

  const [result] = await pool.execute(query, [uploadUUID]);
  return result.affectedRows > 0;
}

module.exports = {
  logDatasetUpload,
  getUploadsByDatasetUUIDPaginated,
  getUploadByUUID,
  deleteUpload,
};



