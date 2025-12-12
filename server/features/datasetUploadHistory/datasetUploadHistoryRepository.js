const pool = require("../../config/database");

async function logDatasetUpload({
  uuid,
  datasetUUID,
  endpointUUID,
  filename,
  fileSize,
  md5 = null,
  sha256 = null,
  lineCount = null,
  filepath = null
}) {
  const query = `
    INSERT INTO DatasetUploadHistory
      (uuid, dataset, endpoint, filename, uploadedAt, fileSize, MD5, SHA256, lineCount, filepath)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(6), ?, ?, ?, ?, ?)
  `;

  const params = [
    uuid,
    datasetUUID || null,
    endpointUUID || null,
    filename || null,
    fileSize != null ? String(fileSize) : null,
    md5,
    sha256,
    lineCount != null ? Number(lineCount) : null,
    filepath
  ];

  await pool.execute(query, params);
  return { uuid };
}

async function getUploadsByDatasetUUIDPaginated(
  datasetUUID,
  page = 1,
  pageSize = 10,
  sortBy = null,
  sortDirection = null,
  search = null          
) {
  const limit = Math.max(parseInt(pageSize, 10) || 10, 1);
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (currentPage - 1) * limit;

  // Map frontend fields - actual DB column names
  const SORT_COLUMN_MAP = {
    name: "filename",
    size: "fileSize",
    uploadedAt: "uploadedAt",
    endpointUUID: "endpoint",
    md5: "MD5",
    sha256: "SHA256",
    lineCount: "lineCount",
  };

  // Resolve column safely
  const sortColumn = SORT_COLUMN_MAP[sortBy] || "uploadedAt";

  // Allow only ASC or DESC
  const direction = sortDirection && sortDirection.toLowerCase() === "asc" ? "ASC" : "DESC";

  let whereClause = `WHERE dataset = ?`;
  const whereParams = [datasetUUID];

  if (search) {
    const like = `%${search}%`;
    whereClause += `
      AND (
        filename LIKE ?
      )
    `;
    whereParams.push(like);
  }

  // Count total items
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM DatasetUploadHistory
    ${whereClause}
  `;
  const [countRows] = await pool.execute(countQuery, whereParams);
  const totalItems = countRows[0]?.total || 0;
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / limit);

  const dataQuery = `
    SELECT
      uuid,
      filename,
      fileSize,
      uploadedAt,
      endpoint,
      MD5,
      SHA256,
      lineCount,
      filepath
    FROM DatasetUploadHistory
    ${whereClause}
    ORDER BY ${sortColumn} ${direction}
    LIMIT ?, ?
  `;

  const [rows] = await pool.query(dataQuery, [...whereParams, offset, limit]);

  const data = rows.map((row) => ({
    uuid: row.uuid,
    name: row.filename,
    size: row.fileSize ? Number(row.fileSize) || null : null,
    uploadedAt: row.uploadedAt,
    endpointUUID: row.endpoint,
    md5: row.MD5 || null,
    sha256: row.SHA256 || null,
    lineCount: row.lineCount ? Number(row.lineCount) || null : null,
    filepath: row.filepath || null,
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
      sortBy: sortBy || "uploadedAt",
      sortDirection: direction.toLowerCase(),
      search: search || null, 
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
      endpoint,
      MD5,
      SHA256,
      lineCount,
      filepath
    FROM DatasetUploadHistory
    WHERE uuid = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(query, [uploadUUID]);
  const row = rows[0];
  if (!row) return null;

  return {
    uuid: row.uuid,
    datasetUUID: row.dataset,
    name: row.filename,
    size: row.fileSize ? Number(row.fileSize) || null : null,
    uploadedAt: row.uploadedAt,
    endpointUUID: row.endpoint,
    md5: row.MD5 || null,
    sha256: row.SHA256 || null,
    lineCount: row.lineCount ? Number(row.lineCount) || null : null,
    filepath: row.filepath || null,
  };
}

async function deleteUpload(uploadUUID) {
  const query = `
    DELETE FROM DatasetUploadHistory
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
