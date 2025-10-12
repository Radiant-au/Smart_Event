import eventRoute from "../modules/event/event.route";
import batchRoute from "../modules/ticket_batch/ticket_batch.route";
import { Router } from "express";

const router = Router();


router.use("/event",  eventRoute);
router.use("/batch" , batchRoute)

export default router;