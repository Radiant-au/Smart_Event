import { AppDataSource } from "../../config/data-source";
import { Ticket } from "./ticket.entity";

export const TicketRepo = AppDataSource.getRepository(Ticket);

export const countTicketsByBatchId = async (batchId: number) => {
  return TicketRepo.count({ where: { batch: { id: batchId } } });
};

export const countTicketsByBatchIdAndStatus = async (
  batchId: number,
  status: "used" | "unused"
) => {
  return TicketRepo.count({ where: { batch: { id: batchId }, status } });
};