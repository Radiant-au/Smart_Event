import { Request, Response } from "express";
import { asyncHandler } from "../../utils/handler";
import { TicketService } from "./ticket.services";

export class TicketController {
    
    private ticketService = new TicketService();

    constructor() {
        this.ticketService = new TicketService();
    }

    addDynamicData = asyncHandler(async (req: Request, res: Response) => {
        const ticket = await this.ticketService.addRouletteData(req.params.token, req.body);
        res.status(201).json({ success: true, data: ticket });
    });

    validateScan = asyncHandler(async (req: Request, res: Response) => {
        const ticket = await this.ticketService.validateScan(req.body);
        res.status(201).json({ success: true, data: ticket });
    });

    getTicketCountByBatchId = asyncHandler(async (req: Request, res: Response) => {
        const batchId = Number(req.params.batchId);
        const counts = await this.ticketService.getTicketCountByBatchId(batchId);
        res.status(200).json({ success: true, data: counts });
    });

    getTicketByBatch = asyncHandler(async (req: Request, res: Response) => {
        const batchId = Number(req.params.batchId);
        const tickets = await this.ticketService.getTicketByBatch(batchId);
        res.status(200).json({ success: true, data: tickets });
    });

    getScannedTickets = asyncHandler(async (req: Request, res: Response) => {
        const userId = Number(req.params.userId);
        const tickets = await this.ticketService.getScannedTickets(userId);
        res.status(200).json({ success: true, data: tickets });
    });
}