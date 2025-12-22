require("dotenv").config();
const fs = require("fs");
const path = require("path");

const {
  getTodoRecords,
  markInProgress,
  markCompleted,
  markError,
} = require("../services/importControlService");

const LOG_FILE = path.join(__dirname, "../logs/import-worker.log");

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line);
  console.log(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processOne(record) {
  const partitionKey = record.partitionKey;
  const rowKey = record.rowKey;

  try {
    log(`Starting import for ${rowKey}`);

    await markInProgress(partitionKey, rowKey);

    // 🔹 Dummy import logic
    await sleep(3000); // simulate work

    log(`Completed import for ${rowKey}`);
    await markCompleted(partitionKey, rowKey);
  } catch (err) {
    log(`ERROR for ${rowKey}: ${err.message}`);
    await markError(partitionKey, rowKey, err.message);
  }
}

async function runOnce() {
  const todos = await getTodoRecords();

  if (todos.length === 0) {
    return;
  }

  for (const record of todos) {
    await processOne(record);
  }
}

async function startWorker() {
  log("Import worker started");

  while (true) {
    await runOnce();
    await sleep(5000); // poll every 5 seconds
  }
}

startWorker().catch((err) => {
  log(`Worker crashed: ${err.message}`);
  process.exit(1);
});
