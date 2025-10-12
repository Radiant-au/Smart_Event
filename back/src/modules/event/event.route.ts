import { Router } from "express";
import { EventController } from "./event.controller";

const router = Router();

const eventController = new EventController();

router.post("/", eventController.createEvent);
router.post("/add", eventController.addCollaborator);
router.post("/remove", eventController.removeCollaborator);


export default router;