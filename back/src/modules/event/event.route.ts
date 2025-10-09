import { Router } from "express";
import { EventController } from "./event.controller";

const router = Router();

const eventController = new EventController();

router.post("/", eventController.createEvent);


export default router;