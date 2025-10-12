import { AppDataSource } from "../../config/data-source";
import { TicketBatch } from "./ticket_batch.entity";

export const TicketBatchRepo = AppDataSource.getRepository(TicketBatch);