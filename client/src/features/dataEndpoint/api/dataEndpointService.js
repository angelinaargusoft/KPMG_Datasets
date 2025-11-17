import api from "@/plugins/axios";

// Create a new DataEndpoint
export const createDataEndpoint = async (data) => {
  const res = await api.post(`/dataEndpoint`, data);
  return res.data.endpoint || res.data;
};

// Fetch all DataEndpoints
export const getAllDataEndpoints = async () => {
  const res = await api.get(`/dataEndpoint`);
  return res.data;
};

// Fetch DataEndpoint by UUID
export const getDataEndpointByUUID = async (uuid) => {
  const res = await api.get(`/dataEndpoint/${uuid}`);
  return res.data;
};

// Update DataEndpoint by numeric ID
export const updateDataEndpoint = async (id, data) => {
  const res = await api.put(`/dataEndpoint/${id}`, data);
  return res.data;
};

// Delete DataEndpoint by numeric ID
export const deleteDataEndpoint = async (id) => {
  const res = await api.delete(`/dataEndpoints/${id}`);
  return res.data;
};
