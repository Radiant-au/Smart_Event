import { TicketBatch } from "../ticket_batch/ticket_batch.entity";

export interface TicketDto {
    batch: TicketBatch;
    event_code: string;
    ticket_number: number;
}