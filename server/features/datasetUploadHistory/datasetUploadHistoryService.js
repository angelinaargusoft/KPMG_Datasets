const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const DatasetService = require("../dataset/datasetService");
const EndpointServerService = require("../endpointServer/endpointServerService");
const {
  uploadBufferToContainer,
  deleteBlobFromContainer,
} = require("../dataset/blobStorageService");
const DatasetUploadHistoryRepository = require("./datasetUploadHistoryRepository");

function countLines(buffer) {
  if (!buffer || buffer.length === 0) return 0;

  // Convert buffer to string. Safe for text files.
  const str = buffer.toString("utf8");

  // Count all newline variants
  const matches = str.match(/\r\n|\r|\n/g);
  return matches ? matches.length : 1; // 1 line minimal if text exists
}

async function uploadFileForDataset(datasetUUID, file) {
  const dataset = await DatasetService.getDatasetByUUID(datasetUUID);
  if (!dataset) {
    throw new Error(`Dataset with UUID ${datasetUUID} not found`);
  }

  if (dataset.storageType !== "Blob") {
    throw new Error("This dataset is not configured for Blob storage");
  }

  if (!dataset.endpointServerUUID) {
    throw new Error("Dataset has no endpointServerUUID configured");
  }

  const endpoint = await EndpointServerService.getEndpointServerByUUID(
    dataset.endpointServerUUID
  );

  if (!endpoint) {
    throw new Error(
      `Endpoint with UUID ${dataset.endpointServerUUID} not found`
    );
  }

  const connectionString =
    await DatasetService.buildBlobConnectionStringFromEndpoint(endpoint);

  const containerName = dataset.uuid.toLowerCase();
  const blobName = file.originalname;

  let md5hash = null;
  let sha256hash = null;
  try {
    const md5 = crypto.createHash("md5");
    const sha256 = crypto.createHash("sha256");

    const buf = file.buffer || Buffer.from([]);
    md5.update(buf);
    sha256.update(buf);

    md5hash = md5.digest("hex");
    sha256hash = sha256.digest("hex");
  } catch (err) {
    console.warn("Hashing failed for upload buffer:", err);
  }

  let lineCount = null;
  try {
    // Only count for text-based content types
    const isTextFile =
      file.mimetype.startsWith("text/") ||
      file.mimetype.includes("csv") ||
      file.mimetype.includes("json") ||
      file.originalname.endsWith(".log");

    if (isTextFile) {
      lineCount = countLines(file.buffer);
    }
  } catch (err) {
    console.warn("Line count failed:", err);
  }

  const uploadResult = await uploadBufferToContainer(
    connectionString,
    containerName,
    file.buffer,
    blobName,
    file.mimetype
  );

  const filepath = uploadResult.url;

  await DatasetUploadHistoryRepository.logDatasetUpload({
    uuid: uuidv4(),
    datasetUUID: dataset.uuid,
    endpointUUID: endpoint.uuid,
    filename: file.originalname,
    fileSize: file.size,
    md5: md5hash,
    sha256: sha256hash,
    lineCount: lineCount,
    filepath
  });

  return {
    datasetUUID: dataset.uuid,
    endpointUUID: endpoint.uuid,
    blobUrl: uploadResult.url,
    container: uploadResult.container,
    blobName: uploadResult.blobName,
    md5: md5hash,
    sha256: sha256hash,
    lineCount,
    filepath
  };
}

async function getFilesForDataset(
  datasetUUID,
  page = 1,
  pageSize = 10,
  sortBy = null,
  sortDirection = null,
  search = null          
) {
  const dataset = await DatasetService.getDatasetByUUID(datasetUUID);
  if (!dataset) {
    throw new Error(`Dataset with UUID ${datasetUUID} not found`);
  }

  const uploadsPage =
    await DatasetUploadHistoryRepository.getUploadsByDatasetUUIDPaginated(
      datasetUUID,
      page,
      pageSize,
      sortBy,
      sortDirection,
      search         
    );

  return uploadsPage;
}

async function deleteUploadedFile(uploadUUID) {
  const upload = await DatasetUploadHistoryRepository.getUploadByUUID(
    uploadUUID
  );
  if (!upload) {
    throw new Error(`Upload record with UUID ${uploadUUID} not found`);
  }

  const blobName = upload.filename || upload.name;

  const { endpointUUID, datasetUUID } = upload;

  if (!blobName) {
    throw new Error("Upload record is missing blob name/filename");
  }

  const dataset = await DatasetService.getDatasetByUUID(datasetUUID);
  if (!dataset) throw new Error("Dataset not found");

  const containerName = dataset.uuid.toLowerCase();

  const endpoint = await EndpointServerService.getEndpointServerByUUID(
    endpointUUID
  );
  if (!endpoint) throw new Error("Endpoint not found");

  const connectionString =
    await DatasetService.buildBlobConnectionStringFromEndpoint(endpoint);

  await deleteBlobFromContainer(connectionString, containerName, blobName);
  await DatasetUploadHistoryRepository.deleteUpload(uploadUUID);

  return { message: "File and upload record deleted successfully" };
}

module.exports = {
  uploadFileForDataset,
  getFilesForDataset,
  deleteUploadedFile,
};
