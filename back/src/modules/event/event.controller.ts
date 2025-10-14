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

  addCollaborator = asyncHandler(async (req: Request, res: Response) => {
    const email = String((req.body as any)?.email || "").trim();
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const eventId = Number(req.params.event);
    const event = await this.eventService.addCollaboratorByEmail(eventId, email);
    res.status(201).json({ success: true, data: event });
  });

  removeCollaborator = asyncHandler(async (req: Request, res: Response) => {
    const event = await this.eventService.removeCollaborator(
      Number(req.params.event),
      Number(req.params.user)
    );
    res.status(201).json({ success: true, data: event });
  });

  getCollaboratorByEventId = asyncHandler(async (req: Request, res: Response) => {
    const eventId = Number(req.params.event);
    const collaborators = await this.eventService.getCollaboratorByEventId(eventId);
    res.status(200).json({ success: true, data: collaborators });
  });
}
