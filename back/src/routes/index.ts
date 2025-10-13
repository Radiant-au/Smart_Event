import eventRoute from "../modules/event/event.route";
import ticketRoute from "../modules/ticket/ticket.route";
import batchRoute from "../modules/ticket_batch/ticket_batch.route";
import authRoute from "../modules/user/auth.route";
import { Router } from "express";

const router = Router();
router.use("/event", eventRoute);
router.use("/batch", batchRoute);
router.use("/ticket", ticketRoute);
router.use("/auth", authRoute);
export default router;
