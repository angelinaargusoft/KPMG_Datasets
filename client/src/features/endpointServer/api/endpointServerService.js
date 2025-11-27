import api from "@/plugins/axios";

export const createEndpointServer = async (data) => {
  const res = await api.post(`/endpointservers`, data);
  return res.data.endpoint || res.data;
};

export const getAllEndpointServers = async (page = 1, pageSize = 10) => {
  const res = await api.get(`/endpointservers`, {
    params: { page, pageSize },
  });
  return res.data;
};

export const getEndpointServerByUUID = async (uuid) => {
  const res = await api.get(`/endpointservers/uuid/${uuid}`);
  return res.data;
};

export const getEndpointServerById = async (id) => {
  const res = await api.get(`/endpointservers/${id}`);
  return res.data;
};

export const updateEndpointServer = async (uuid, data) => {
  const res = await api.put(`/endpointservers/${uuid}`, data);
  return res.data;
};

export const deleteEndpointServer = async (id) => {
  const res = await api.delete(`/endpointservers/${id}`);
  return res.data;
};

