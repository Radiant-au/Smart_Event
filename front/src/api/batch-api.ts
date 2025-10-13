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
