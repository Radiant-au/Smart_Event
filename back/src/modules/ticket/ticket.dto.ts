import { TicketBatch } from "../ticket_batch/ticket_batch.entity";

export interface TicketDto {
  batch: TicketBatch;
  event_code: string;
  ticket_number: number;
}

export interface AddDynamicDto {
  dynamicResult?: string;
}

export interface ScanDto {
  code: string;
  userId: number;
}

export interface ticketDesignInfoDto {
  code: string;
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

export interface TicketCountDto {
  batchId: number;
  total: number;
  used: number;
  unused: number;
}

// Response item for getTicketByBatch. For static batches, only code and status will be present.
export interface TicketSummaryDto {
  code: string;
  status: string;
  scannerName: String;
  price?: number;
  qrUrl?: string | null;
  dynamicResult?: string | null;
}
