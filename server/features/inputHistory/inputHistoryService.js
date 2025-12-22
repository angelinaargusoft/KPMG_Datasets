const { v4: uuidv4 } = require("uuid");

const InputHistoryRepository = require("./inputHistoryRepository");
const DatasetService = require("../dataset/datasetService");
const { createImportControlEntry } = require("../../services/importControlService");

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function createImportRecordsFromBlobFiles({
  datasetUUID,
  filesName,
  append = false,
  userId,
}) {
  const dataset = await DatasetService.getDatasetByUUID(datasetUUID);
  if (!dataset) throw new Error("Dataset not found");

  // Fetch blob metadata once
  const blobFiles = await DatasetService.listDatasetBlobFiles({
    datasetUUID,
  });

  // Create a quick lookup map
  const blobMap = new Map(
    blobFiles.map((f) => [f.name, f])
  );

  const records = [];

  for (const fileName of filesName) {
    const blob = blobMap.get(fileName);

    if (!blob) {
      throw new Error(`Blob file not found: ${fileName}`);
    }

    const params = {
      table: fileName,
      size: formatSize(blob.size),
      path: fileName,
      datasetUUID,
      prefix: dataset.tablePrefix || "",
      type: dataset.storageType || "Blob",
      append,
      inPreProcessed: true,
    };

    const uuid = uuidv4();

    const record = await InputHistoryRepository.insertDummyImportRecord({
      uuid,
      datasetUUID,
      userId,
      params,
    });

    await createImportControlEntry(record.UUID);
    records.push(record);
  }

  return records;
}


async function getAllImportRecords() {
  return await InputHistoryRepository.getAllImportRecords();
}

async function getImportRecordsByDataset(datasetUUID) {
  return await InputHistoryRepository.getImportRecordsByDataset(datasetUUID);
}

module.exports = {
  createImportRecordsFromBlobFiles,
  getAllImportRecords,
  getImportRecordsByDataset
};

