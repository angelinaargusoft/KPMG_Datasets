const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

if (!account || !accountKey) {
  throw new Error("Azure Storage credentials are missing");
}

const tableName = "ImportControl";

const credential = new AzureNamedKeyCredential(account, accountKey);

const tableClient = new TableClient(
  `https://${account}.table.core.windows.net`,
  tableName,
  credential
);

async function ensureTableExists() {
  try {
    await tableClient.createTable();
  } catch (err) {
    // 409 = table already exists
    if (err.statusCode !== 409) {
      throw err;
    }
  }
}

module.exports = {
  tableClient,
  ensureTableExists,
};
