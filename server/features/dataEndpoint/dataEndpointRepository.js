const pool = require("../../config/database");

async function createDataEndpoint(dataEndpoint) {
  const {
    uuid,
    name,
    type,
    hostname,
  } = dataEndpoint;
  const query = `
    INSERT INTO DataEndpoints
    (uuid, name, type, hostname)
    VALUES (?, ?, ?, ?)
  `;
  const params = [
    uuid,
    name,
    type,
    hostname,
  ];
  const [result] = await pool.execute(query, params);
  return await getDataEndpointByUUID(uuid);
}

async function getAllDataEndpoints() {
  const query = `
    SELECT * FROM DataEndpoints
    ORDER BY name
  `;
  const [rows] = await pool.execute(query);
  return rows;
}


async function getDataEndpointByUUID(uuid) {
  const query = `
    SELECT * FROM DataEndpoints
    WHERE uuid = ?
  `;
  const [rows] = await pool.execute(query, [uuid]);
  return rows[0] || null;
}

async function updateDataEndpoint(id, data) {
  const existingDataEndpoint = await getDataEndpointById(id);
  if (!existingDataEndpoint) throw new Error("DataEndpoint not found");

  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  if (fields.length === 0) return existingDataEndpoint;

  const query = `
    UPDATE DataEndpoints
    SET ${fields.join(", ")}, lastChangeAt = CURRENT_TIMESTAMP(6)
    WHERE id = ?
  `;
  values.push(id);
  await pool.execute(query, values);
  return await getDataEndpointById(id);
}

async function deleteDataEndpoint(id) {
  const existingDataEndpoint = await getDataEndpointById(id);
  if (!existingDataEndpoint) throw new Error("DataEndpoint not found");

  const query = `
    DELETE FROM DataEndpoints
    WHERE id = ?
  `;
  await pool.execute(query, [id]);
  return existingDataEndpoint;
}

module.exports = {
  createDataEndpoint,
  getAllDataEndpoints,
  getDataEndpointByUUID,
  updateDataEndpoint,
  deleteDataEndpoint,
};

