import { Router } from "express";
import { TicketBatchController } from "./ticket_batch.controller";
import multer from "multer";
import { fileFilter, storage } from "../../utils/middleware";

const router = Router();

const ticketBatch = new TicketBatchController();

<<<<<<< HEAD
const upload = multer({
                storage : storage,
                limits: {
                    fileSize: 10 * 1024 * 1024, // 10 MB limit
                },
                fileFilter,
                });

=======
>>>>>>> 8b934220d7dfeb5604da8c167a0fa6d151a8c95b
router.post("/:id/static", ticketBatch.createTicketBatch);
router.post("/:id/dynamic", ticketBatch.createDynamicTicketBatch);
router.post("/:id/roulette", ticketBatch.addRoulette);
router.delete("/:id", ticketBatch.deleteBatch);
<<<<<<< HEAD
router.post("/:id/download", upload.single("file"), ticketBatch.downloadTicketBatchZip);
=======
router.get("/event/:id", ticketBatch.getBatchesByEventId);
>>>>>>> 8b934220d7dfeb5604da8c167a0fa6d151a8c95b

export default router;
