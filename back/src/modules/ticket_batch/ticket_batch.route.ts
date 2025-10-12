import { Router } from "express";
import { TicketBatchController } from "./ticket_batch.controller";

const router = Router();

const ticketBatch = new TicketBatchController();

router.post("/:id", ticketBatch.createTicketBatch);
router.post("/:id/dynamic", ticketBatch.createDynamicTicketBatch);
router.post("/:id/roulette", ticketBatch.addRoulette);
router.delete("/:id", ticketBatch.deleteBatch);


export default router;