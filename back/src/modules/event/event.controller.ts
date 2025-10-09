import { Request, Response } from "express";
import { asyncHandler } from "../../utils/handler";
import { EventService } from "./event.servcies";

export class EventController {
    private eventService = new EventService();

    constructor() {
        this.eventService = new EventService();
    }

    createEvent = asyncHandler(async (req: Request, res: Response) => {
        const event = await this.eventService.createEvent(req.body);
        res.status(201).json({ success: true, data: event });
    });
}