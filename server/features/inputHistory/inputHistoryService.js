const InputHistoryRepository = require("./inputHistoryRepository");
const DatasetService = require("../dataset/datasetService");
const DatasetUploadHistoryRepository = require("../datasetUploadHistory/datasetUploadHistoryRepository");

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function createImportRecord(datasetUUID, uploadUUID, userId) {
  const dataset = await DatasetService.getDatasetByUUID(datasetUUID);
  if (!dataset) throw new Error("Dataset not found");

  const upload = await DatasetUploadHistoryRepository.getUploadByUUID(uploadUUID);
  if (!upload) throw new Error("Upload not found");

  const filename = upload.name;
  const fileSizeBytes = upload.size ?? null;

  const params = {
    table: filename,
    size: formatSize(fileSizeBytes),
    path: filename,                   
    datasetUUID: datasetUUID,
    prefix: dataset.tablePrefix || "", 
    type: dataset.storageType || "Blob",
    inPreProcessed: true
  };

  return await InputHistoryRepository.insertDummyImportRecord({
    datasetUUID,
    userId,
    params
  });
}

async function getAllImportRecords() {
  return await InputHistoryRepository.getAllImportRecords();
}

async function getImportRecordsByDataset(datasetUUID) {
  return await InputHistoryRepository.getImportRecordsByDataset(datasetUUID);
}

module.exports = {
  createImportRecord,
  getAllImportRecords,
  getImportRecordsByDataset
};

