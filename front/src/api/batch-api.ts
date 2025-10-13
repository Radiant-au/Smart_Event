import apiClient from "@/api/api-client";

/**
 * =====================
 *  Ticket Batch API
 * =====================
 * Backend routes (base: /api/batch):
 * - POST   /:id/static      -> createTicketBatch (id = eventId)
 * - POST   /:id/dynamic     -> createDynamicTicketBatch (id = eventId)
 * - POST   /:id/roulette    -> addRoulette (id = eventId)
 * - DELETE /:id             -> deleteBatch (id = batchId)
 */

export interface CreateBatchDto {
  name: string;
  price: number | string;
  ticket: number;
}

export interface CreateDynamicBatchDto {
  name: string;
  ticket: number;
}

export interface ticketDesignInfoDto{
  barcodeWidth: string;
  barcodeHeight: string;
  barcodeX: string;
  barcodeY: string;
  qrWidth: string;
  qrHeight: string;
  qrX: string;
  qrY: string;
  mode: string;
}


export const createTicketBatch = async (eventId: number, data: CreateBatchDto) => {
  return apiClient.post(`/batch/${eventId}/static`, data);
};

export const createDynamicTicketBatch = async (
  eventId: number,
  data: CreateDynamicBatchDto
) => {
  return apiClient.post(`/batch/${eventId}/dynamic`, data);
};

export const addRouletteToEvent = async (eventId: number) => {
  return apiClient.post(`/batch/${eventId}/roulette`);
};

export const deleteBatch = async (batchId: number) => {
  return apiClient.delete(`/batch/${batchId}`);
};

export const getBatchesByEventId = async (eventId: number) => {
  return apiClient.get(`/batch/event/${eventId}`);
};

export const DownloadBatchZip = async (batchId: number, data: ticketDesignInfoDto) => {
  return apiClient.get(`/batch/${batchId}/download`, { data });
};

export const uploadBatchImage = async (batchId: number, imageFile: File, data: ticketDesignInfoDto) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('mode', data.mode);
  formData.append('barcodeWidth', data.barcodeWidth);
  formData.append('barcodeHeight', data.barcodeHeight);
  formData.append('barcodeX', data.barcodeX);
  formData.append('barcodeY', data.barcodeY);
  formData.append('qrWidth', data.qrWidth);
  formData.append('qrHeight', data.qrHeight);
  formData.append('qrX', data.qrX);
  formData.append('qrY', data.qrY);
  return apiClient.post(`/batch/${batchId}/download`, formData, {
    responseType: 'blob' // This is important for file downloads
  });
};
