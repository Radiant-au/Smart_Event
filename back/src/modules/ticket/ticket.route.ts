import { Router } from "express";
import { TicketController } from "./ticket.controller";

const router = Router();

const ticketController = new TicketController();

router.post("/dynamic/:token", ticketController.addDynamicData);
router.post("/validate", ticketController.validateScan);
router.get("/count/:batchId", ticketController.getTicketCountByBatchId);
router.get("/by-batch/:batchId", ticketController.getTicketByBatch);

export default router;