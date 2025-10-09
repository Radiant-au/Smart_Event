import { AppDataSource } from "../../config/data-source";
import { Ticket } from "./ticket.entity";

export const TicketRepo = AppDataSource.getRepository(Ticket);