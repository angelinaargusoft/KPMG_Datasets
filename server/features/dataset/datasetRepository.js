const pool = require("../../config/database");

async function createDataset(dataset) {
  const {
    uuid,
    name,
    description,
    applicationPackageId,
    storageType,
    enablev3,
    tablePrefix,
    createdBy,
    endpointServerUUID,  
  } = dataset;

  const query = `
    INSERT INTO Datasets
    (uuid, name, description, applicationPackageId, storageType, enablev3, tablePrefix, createdBy, endpointServerUUID)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    uuid,
    name,
    description || null,
    applicationPackageId,
    storageType,
    enablev3 ?? false,
    tablePrefix || null,
    createdBy || null,
    endpointServerUUID || null, 
  ];

  const [result] = await pool.execute(query, params);
  return await getDatasetById(result.insertId);
}

async function getDatasetsPaginated(
  page = 1,
  pageSize = 10,
  sortBy = null,
  sortDirection = null,
  search = null
) {
  // ensure positive integers
  const limit = Math.max(parseInt(pageSize, 10) || 10, 1);
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (currentPage - 1) * limit;

  // Map frontend sort keys - real DB columns (whitelist)
  const SORT_COLUMN_MAP = {
    name: "name",
    description: "description",
    createdAt: "createdAt",
    createdBy: "createdBy",
    storageType: "storageType",
    enablev3: "enablev3",
  };

  const sortColumn = SORT_COLUMN_MAP[sortBy] || "createdAt";
  const direction =
    sortDirection && sortDirection.toLowerCase() === "asc" ? "ASC" : "DESC";

  // optional WHERE clause for search
  let whereClause = "";
  const whereParams = [];

  if (search) {
    const like = `%${search}%`;
    whereClause = `
      WHERE
        name LIKE ? OR
        description LIKE ? 
    `;
    whereParams.push(like, like);
  }

  // total count with search
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM Datasets
    ${whereClause}
  `;
  const [countRows] = await pool.execute(countQuery, whereParams);
  const totalItems = countRows[0]?.total || 0;
  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

  const dataQuery = `
    SELECT *
    FROM Datasets
    ${whereClause}
    ORDER BY ${sortColumn} ${direction}
    LIMIT ?, ?
  `;

  const [rows] = await pool.query(dataQuery, [...whereParams, offset, limit]);

  return {
    data: rows,
    pagination: {
      page: currentPage,
      pageSize: limit,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      sortBy: sortBy || "createdAt",
      sortDirection: direction.toLowerCase(),
      search: search || null,
    },
  };
}

async function getAllDatasets() {
  const query = `
    SELECT * FROM Datasets
    ORDER BY createdAt DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
}

async function getDatasetById(id) {
  const query = `
    SELECT * FROM Datasets
    WHERE id = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
}

async function getDatasetByUUID(uuid) {
  const query = `
    SELECT * FROM Datasets
    WHERE uuid = ?
  `;
  const [rows] = await pool.execute(query, [uuid]);
  return rows[0] || null;
}

async function updateDataset(uuid, data) {
  const existingDataset = await getDatasetByUUID(uuid);
  if (!existingDataset) throw new Error("Dataset not found");

  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return existingDataset;

  const query = `
    UPDATE Datasets
    SET ${fields.join(", ")}, lastChangeAt = CURRENT_TIMESTAMP(6)
    WHERE uuid = ?
  `;

  values.push(uuid);
  await pool.execute(query, values);

  return await getDatasetByUUID(uuid);
}

async function deleteDataset(id) {
  const existingDataset = await getDatasetById(id);
  if (!existingDataset) throw new Error("Dataset not found");

  const query = `
    DELETE FROM Datasets
    WHERE id = ?
  `;

  await pool.execute(query, [id]);
  return existingDataset;
}

module.exports = {
  createDataset,
  getDatasetsPaginated,
  getAllDatasets,
  getDatasetById,
  getDatasetByUUID,
  updateDataset,
  deleteDataset,
};
