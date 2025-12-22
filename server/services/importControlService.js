require("dotenv").config();
const { tableClient, ensureTableExists } = require("./azureTableClient");

const ENV = process.env.APP_ENV || "dev";

const STATUS = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ERROR: "ERROR",
};

async function markInProgress(partitionKey, rowKey) {
  await tableClient.updateEntity(
    {
      partitionKey: partitionKey,
      rowKey: rowKey,
      status: STATUS.IN_PROGRESS,
      startTime: new Date(),
    },
    "Merge"
  );
}

async function markCompleted(partitionKey, rowKey) {
  await tableClient.updateEntity(
    {
      partitionKey: partitionKey,
      rowKey: rowKey,
      status: STATUS.COMPLETED,
      endTime: new Date(),
    },
    "Merge"
  );
}

async function markError(partitionKey, rowKey, errorMessage) {
  await tableClient.updateEntity(
    {
      partitionKey: partitionKey,
      rowKey: rowKey,
      status: STATUS.ERROR,
      endTime: new Date(),
      errorMessage: errorMessage,
    },
    "Merge"
  );
}


async function getTodoRecords() {
  const records = [];

  for await (const e of tableClient.listEntities({
    queryOptions: {
      filter: `PartitionKey eq '${ENV}' and status eq 'TODO'`,
    },
  })) {
    records.push(e);
  }

  return records;
}
async function createImportControlEntry(inputHistoryUuid) {
  await ensureTableExists();

  const entity = {
    partitionKey: "dev",              
    rowKey: inputHistoryUuid,

    status: "TODO",
    startTime: null,
    endTime: null,
    errorMessage: null,
  };

  console.log("CREATING:", entity);
  await tableClient.createEntity(entity);
}

module.exports = {
  STATUS,
  getTodoRecords,
  markInProgress,
  markCompleted,
  markError,
  createImportControlEntry
};
