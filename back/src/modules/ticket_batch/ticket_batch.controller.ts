import { Request, Response } from "express";
import { asyncHandler } from "../../utils/handler";
import { TicketBatchService } from "./ticket_batch.services";

export class TicketBatchController {
    private ticketService = new TicketBatchService();

    constructor() {
        this.ticketService = new TicketBatchService();
    }

    createTicketBatch = asyncHandler(async (req: Request, res: Response) => {
        const event = await this.ticketService.createTicketBatch(Number(req.params.id), req.body);
        res.status(201).json({ success: true, data: event });
    });

    createDynamicTicketBatch = asyncHandler(async (req: Request, res: Response) => {
        const event = await this.ticketService.createDynamicTicketBatch(Number(req.params.id), req.body);
        res.status(201).json({ success: true, data: event });
    });

    addRoulette = asyncHandler(async (req: Request, res: Response) => {
        const event = await this.ticketService.addroulette(Number(req.params.id), req.body);
        res.status(201).json({ success: true, data: event });
    });

    deleteBatch = asyncHandler(async (req: Request, res: Response) => {
        const event = await this.ticketService.deleteBatch(Number(req.params.id));
        res.status(201).json({ success: true, data: event });
    });

    getBatchesByEventId = asyncHandler(async (req: Request, res: Response) => {
        const batches = await this.ticketService.getBatchesByEventId(Number(req.params.id));
        res.status(200).json({ success: true, data: batches });
    });
}