import apiClient from "@/api/api-client";

/**
 * =====================
 *  Ticket API
 * =====================
 * Backend routes (base: /api/ticket):
 * - POST /validate         -> validateScan
 * - POST /dynamic/:token   -> addDynamicData
 */

export const validateTicket = async (data: {
  code: string;
  userId: string;
}) => {
  return apiClient.post(`/ticket/validate`, data);
};

export const addDynamicDataToTicket = async (
  token: string,
  data: Record<string, any>
) => {
  return apiClient.post(`/ticket/dynamic/${encodeURIComponent(token)}`, data);
};

export interface TicketCountResponse {
  batchId: number;
  total: number;
  used: number;
  unused: number;
}

export const getTicketCountByBatchId = async (batchId: number) => {
  return apiClient.get<{ success: boolean; data: TicketCountResponse }>(
    `/ticket/count/${batchId}`
  );
};

export interface TicketSummaryDto {
  price: string;
  scannerName: String;
  code: string;
  status: string;
  qrUrl?: string | null;
  dynamicResult?: string | null;
}

export const getTicketsByBatch = async (batchId: number) => {
  return apiClient.get<{ success: boolean; data: TicketSummaryDto[] }>(
    `/ticket/by-batch/${batchId}`
  );
};

export const getScannedTicketsByBatch = async (batchId: number) => {
  return apiClient.get<{ success: boolean; data: TicketSummaryDto[] }>(
    `/ticket/scanned/${batchId}`
  );
};
