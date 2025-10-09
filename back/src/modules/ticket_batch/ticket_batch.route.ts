import { Router } from "express";
import { TicketBatchController } from "./ticket_batch.controller";

const router = Router();

const ticketBatch = new TicketBatchController();

router.post("/:id", ticketBatch.createTicketBatch);


export default router;