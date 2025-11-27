const DatasetService = require("../dataset/datasetService");
const EndpointServerService = require("../endpointServer/endpointServerService");
const {
  uploadBufferToContainer,
  deleteBlobFromContainer,
} = require("../dataset/blobStorageService");
const DatasetUploadHistoryRepository = require("./datasetUploadHistoryRepository");

const {
  buildBlobConnectionStringFromEndpoint,
} = require("../dataset/datasetService");

async function uploadFileForDataset(datasetUUID, file) {
  //Load dataset
  const dataset = await DatasetService.getDatasetByUUID(datasetUUID);
  if (!dataset) {
    throw new Error(`Dataset with UUID ${datasetUUID} not found`);
  }

  if (dataset.storageType !== "Blob") {
    throw new Error("This dataset is not configured for Blob storage");
  }

  //Load endpoint
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

  const connectionString = await buildBlobConnectionStringFromEndpoint(endpoint);

  //Upload to container named after dataset UUID
  const containerName = dataset.uuid.toLowerCase();
  const blobName = file.originalname; 

  const uploadResult = await uploadBufferToContainer(
    connectionString,
    containerName,
    file.buffer,
    blobName,
    file.mimetype
  );

  // Log in datasetUploadHistory
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

async function getFilesForDataset(datasetUUID, page = 1, pageSize = 10) {
  const dataset = await DatasetService.getDatasetByUUID(datasetUUID);
  if (!dataset) {
    throw new Error(`Dataset with UUID ${datasetUUID} not found`);
  }

  const uploadsPage =
    await DatasetUploadHistoryRepository.getUploadsByDatasetUUIDPaginated(
      datasetUUID,
      page,
      pageSize
    );

  return uploadsPage;
}

async function deleteUploadedFile(uploadUUID) {
  //Load upload entry
  const upload = await DatasetUploadHistoryRepository.getUploadByUUID(uploadUUID);
  if (!upload) {
    throw new Error(`Upload record with UUID ${uploadUUID} not found`);
  }

  const blobName =
    upload.filename || upload.name;

  const { endpointUUID, datasetUUID } = upload;

  if (!blobName) {
    throw new Error("Upload record is missing blob name/filename");
  }

  //Load dataset
  const dataset = await DatasetService.getDatasetByUUID(datasetUUID);
  if (!dataset) throw new Error("Dataset not found");

  const containerName = dataset.uuid.toLowerCase();

  //Load endpoint
  const endpoint = await EndpointServerService.getEndpointServerByUUID(endpointUUID);
  if (!endpoint) throw new Error("Endpoint not found");

  const { buildBlobConnectionStringFromEndpoint } = require("../dataset/datasetService");
  const connectionString = await buildBlobConnectionStringFromEndpoint(endpoint);

  //Delete blob
  await deleteBlobFromContainer(connectionString, containerName, blobName);

  //Delete DB record
  await DatasetUploadHistoryRepository.deleteUpload(uploadUUID);

  return { message: "File and upload record deleted successfully" };
}


module.exports = {
  uploadFileForDataset,
  getFilesForDataset,
  deleteUploadedFile,
};
