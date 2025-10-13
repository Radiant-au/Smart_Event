import apiClient from "@/api/api-client";

/**
 * =====================
 *  Ticket API
 * =====================
 * Backend routes (base: /api/ticket):
 * - POST /validate         -> validateScan
 * - POST /dynamic/:token   -> addDynamicData
 */

export interface ValidateTicketDto {
  barcode: string;
}

export const validateTicket = async (data: ValidateTicketDto) => {
  return apiClient.post(`/ticket/validate`, data);
};

export const addDynamicDataToTicket = async (token: string, data: Record<string, any>) => {
  return apiClient.post(`/ticket/dynamic/${encodeURIComponent(token)}`, data);
};
