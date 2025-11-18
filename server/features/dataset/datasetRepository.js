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

async function updateDataset(id, data) {
  console.log(id);
  const existingDataset = await getDatasetByUUID(id);
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

  values.push(id);
  await pool.execute(query, values);

  return await getDatasetById(id);
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
  getAllDatasets,
  getDatasetById,
  getDatasetByUUID,
  updateDataset,
  deleteDataset,
};
