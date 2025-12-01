const pool = require("../../config/database");

async function createEndpointServer(endpoint) {
  const {
    uuid,
    name,
    active,
    type,              // 'blob' | 'sftp'
    hostname,
    apiKey,
    key1,
    key2,
    isKeyEncrypted,
    useAzureFunction,
  } = endpoint;

  const query = `
    INSERT INTO EndpointServers
      (uuid, name, active, type, hostname, apiKey, key1, key2, isKeyEncrypted, useAzureFunction)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    uuid,
    name,
    active ?? 1,
    type || null,
    hostname || null,
    apiKey || null,
    key1 || null,
    key2 || null,
    isKeyEncrypted ?? 1,
    useAzureFunction ?? 0,
  ];

  const [result] = await pool.execute(query, params);
  return await getEndpointServerById(result.insertId);
}

async function getEndpointServersPaginated(page = 1, pageSize = 10) {
  const limit = Math.max(parseInt(pageSize, 10) || 10, 1);
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (currentPage - 1) * limit;

  const [countRows] = await pool.execute(`
    SELECT COUNT(*) AS total
    FROM EndpointServers
  `);
  const totalItems = countRows[0]?.total || 0;
  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

  const query = `
    SELECT *
    FROM EndpointServers
    ORDER BY id DESC
    LIMIT ${offset}, ${limit}
  `;
  const [rows] = await pool.query(query);

  return {
    data: rows,
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

async function getAllEndpointServers() {
  const query = `
    SELECT *
    FROM EndpointServers
    ORDER BY id DESC
  `;
  const [rows] = await pool.execute(query);
  return rows;
}

async function getEndpointServerById(id) {
  const query = `
    SELECT *
    FROM EndpointServers
    WHERE id = ?
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
}

async function getEndpointServerByUUID(uuid) {
  const query = `
    SELECT *
    FROM EndpointServers
    WHERE uuid = ?
  `;
  const [rows] = await pool.execute(query, [uuid]);
  return rows[0] || null;
}

async function updateEndpointServer(uuid, data) {
  const existing = await getEndpointServerByUUID(uuid);
  if (!existing) throw new Error("Endpoint server not found");

  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return existing;

  const query = `
    UPDATE EndpointServers
    SET ${fields.join(", ")}
    WHERE uuid = ?
  `;

  values.push(uuid);
  await pool.execute(query, values);

  return await getEndpointServerByUUID(uuid);
}

async function deleteEndpointServer(id) {
  const existing = await getEndpointServerById(id);
  if (!existing) throw new Error("Endpoint server not found");

  const query = `
    DELETE FROM EndpointServers
    WHERE id = ?
  `;

  await pool.execute(query, [id]);
  return existing;
}

module.exports = {
  createEndpointServer,
  getEndpointServersPaginated,
  getAllEndpointServers,
  getEndpointServerById,
  getEndpointServerByUUID,
  updateEndpointServer,
  deleteEndpointServer,
};
