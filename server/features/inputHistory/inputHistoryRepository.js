const pool = require("../../config/database");

async function insertDummyImportRecord({ uuid, datasetUUID, userId, params }) {
  const query = `
    INSERT INTO InputHistory
    (
      JobId,
      UserId,
      Status,
      DateTimeStart,
      Output,
      Params,
      UUID,
      CreatedAt,
      Dataset,
      BatchUUID
    )
    VALUES (?, ?, ?, NOW(), ?, ?, ?, NOW(), ?, ?)
  `;

  const paramsArr = [
    null,                  
    userId || null,        
    "ImportPending",       
    null,                  
    JSON.stringify(params), 
    uuid, 
    datasetUUID,           
    null   
  ];

  const [result] = await pool.execute(query, paramsArr);

  return await getById(result.insertId);
}

async function getById(id) {
  const [rows] = await pool.execute(
    `SELECT * FROM InputHistory WHERE ID = ?`, 
    [id]
  );
  return rows[0] || null;
}

async function getAllImportRecords() {
  const [rows] = await pool.execute(
    `SELECT * FROM InputHistory ORDER BY CreatedAt DESC`
  );
  return rows;
}

async function getImportRecordsByDataset(datasetUUID) {
  const [rows] = await pool.execute(
    `SELECT *
     FROM InputHistory
     WHERE Dataset = ?
     ORDER BY CreatedAt DESC`,
    [datasetUUID]
  );
  return rows;
}


module.exports = {
  insertDummyImportRecord,
  getById,
  getAllImportRecords,
  getImportRecordsByDataset
};
