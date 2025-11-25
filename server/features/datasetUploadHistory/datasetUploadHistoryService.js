// datasetUploadService.js
const DatasetService = require("../dataset/datasetService");
const DataEndpointService = require("../dataEndpoint/dataEndpointService");
const {
  uploadBufferToContainer,
  deleteBlobFromContainer,
} = require("../dataset/blobStorageService");
const DatasetUploadHistoryRepository = require("./datasetUploadHistoryRepository");

async function uploadFileForDataset(datasetUUID, file) {
  // 1. Load dataset
  const dataset = await DatasetService.getDatasetByUUID(datasetUUID);
  if (!dataset) {
    throw new Error(`Dataset with UUID ${datasetUUID} not found`);
  }

  if (dataset.storageType !== "Blob") {
    throw new Error("This dataset is not configured for Blob storage");
  }

  // 2. Load endpoint & get connection string
  if (!dataset.endpointServerUUID) {
    throw new Error("Dataset has no endpointServerUUID configured");
  }

  const endpoint = await DataEndpointService.getDataEndpointByUUID(
    dataset.endpointServerUUID
  );

  if (!endpoint) {
    throw new Error(
      `DataEndpoint with UUID ${dataset.endpointServerUUID} not found`
    );
  }

  // You should have connection details in the endpoint (e.g. endpoint.connectionString)
  const connectionString = endpoint.hostname; // adapt to your actual column
  if (!connectionString) {
    throw new Error("Endpoint has no connection string configured");
  }

  // 3. Upload to container named after dataset UUID
  const containerName = dataset.uuid.toLowerCase();
  const blobName = file.originalname; // or add timestamp / UUID if you want uniqueness

  const uploadResult = await uploadBufferToContainer(
    connectionString,
    containerName,
    file.buffer,
    blobName,
    file.mimetype
  );

  // 4. Log in datasetUploadHistory
  await DatasetUploadHistoryRepository.logDatasetUpload({
    datasetUUID: dataset.uuid,
    endpointUUID: endpoint.uuid,
    filename: file.originalname,
    fileSize: file.size,
  });

  return {
    datasetUUID: dataset.uuid,
    endpointUUID: endpoint.uuid,
    blobUrl: uploadResult.url,
    container: uploadResult.container,
    blobName: uploadResult.blobName,
  };
}

// Get paginated list of uploaded files for a dataset (for your frontend table)
async function getFilesForDataset(datasetUUID, page = 1, pageSize = 10) {
  // Optional: ensure dataset exists (nice for 404 handling)
  const dataset = await DatasetService.getDatasetByUUID(datasetUUID);
  if (!dataset) {
    throw new Error(`Dataset with UUID ${datasetUUID} not found`);
  }

  // Read from upload history (already returns { data, pagination })
  const uploadsPage =
    await DatasetUploadHistoryRepository.getUploadsByDatasetUUIDPaginated(
      datasetUUID,
      page,
      pageSize
    );

  return uploadsPage;
}

// Delete uploaded file by its upload UUID (not numeric id)
async function deleteUploadedFile(uploadUUID) {
  // 1. Load upload entry
  const upload = await DatasetUploadHistoryRepository.getUploadByUUID(uploadUUID);
  if (!upload) {
    throw new Error(`Upload record with UUID ${uploadUUID} not found`);
  }

  const { name: blobName, endpointUUID, datasetUUID } = upload;

  // 2. Load dataset
  const dataset = await DatasetService.getDatasetByUUID(datasetUUID);
  if (!dataset) throw new Error("Dataset not found");

  const containerName = dataset.uuid.toLowerCase();

  // 3. Load endpoint
  const endpoint = await DataEndpointService.getDataEndpointByUUID(endpointUUID);
  if (!endpoint) throw new Error("Endpoint not found");

  const connectionString = endpoint.hostname; // Adjust to your actual column

  // 4. Delete blob
  await deleteBlobFromContainer(connectionString, containerName, blobName);

  // 5. Delete DB record
  await DatasetUploadHistoryRepository.deleteUpload(uploadUUID);

  return { message: "File and upload record deleted successfully" };
}

module.exports = {
  uploadFileForDataset,
  getFilesForDataset,
  deleteUploadedFile,
};
