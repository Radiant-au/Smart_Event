import { Router } from "express";
import { TicketBatchController } from "./ticket_batch.controller";
import multer from "multer";
import { fileFilter, storage } from "../../utils/middleware";

const router = Router();

const ticketBatch = new TicketBatchController();

const upload = multer({
                storage : storage,
                limits: {
                    fileSize: 10 * 1024 * 1024, // 10 MB limit
                },
                fileFilter,
                });

router.post("/:id/static", ticketBatch.createTicketBatch);
router.post("/:id/dynamic", ticketBatch.createDynamicTicketBatch);
router.post("/:id/roulette", ticketBatch.addRoulette);
router.delete("/:id", ticketBatch.deleteBatch);
router.get("/event/:id", ticketBatch.getBatchesByEventId);
router.post("/:id/download", upload.single("file"), ticketBatch.downloadTicketBatchZip);

export default router;
