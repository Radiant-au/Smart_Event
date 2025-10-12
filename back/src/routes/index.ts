import eventRoute from "../modules/event/event.route";
import batchRoute from "../modules/ticket_batch/ticket_batch.route";
import authRoute from "../modules/user/auth.route";
import { Router } from "express";

const router = Router();

router.use("/event", eventRoute);
router.use("/batch", batchRoute);
router.use("/auth", authRoute);
export default router;
