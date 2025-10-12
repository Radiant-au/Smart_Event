import { AddDynamicDto, addQrDataDto, ScanDto, TicketDto } from "./ticket.dto";
import { Ticket } from "./ticket.entity";
import { BaseService } from "../../utils/base.services";
import { v4 as uuidv4 } from 'uuid';
import { RouletteResultRepo } from "../roulette/roulette_result.repo";

export class TicketService extends BaseService<Ticket>{

    private rouletteResultRepo = RouletteResultRepo;

    constructor() {
        super(Ticket);
    }

   async generate(ticketsDto: TicketDto) {
        const tickets: Ticket[] = [];
        for (let i = 0; i < ticketsDto.ticket_number; i++) {
            const newTicket = new Ticket();
            newTicket.batch = ticketsDto.batch;
            newTicket.code = ticketsDto.event_code + `00${i + 1}`;
            tickets.push(newTicket);
        }
        return await this.repo.insert(tickets);
    }

    async addRouletteData(qrtoken :string , dto: AddDynamicDto) {
        const ticket = await this.repo.findOneByOrFail({ qrToken: qrtoken });
        const rouletteResult = this.rouletteResultRepo.create({
            ticket: ticket,
            roulette: ticket.batch.roulette,
            result: dto.dynamicResult,
        });
        await this.rouletteResultRepo.save(rouletteResult);
        ticket.dynamicResult = dto.dynamicResult;
        return await this.repo.save(ticket);
    }

    async addQrData(dto: addQrDataDto) {
        const tickets = await this.repo.find({
            where: { batch: { id: dto.ticketBatch, event: { id: dto.eventId } } },
            relations: ['batch.event']
        });
        for (const ticket of tickets) {
            ticket.qrToken = `${uuidv4().slice(0, 8)}`;
            ticket.qrUrl = process.env.DOMAIN + `${ticket.batch.event.id}/${ticket.qrToken}`;
        }
        return await this.repo.save(tickets);
    }

    async validateScan(dto : ScanDto){
        const ticket = await this.repo.findOneOrFail({ where: { code: dto.code }, relations: ['batch.event.creator', 'batch.event.collaborators'] });
        const scanner = dto.userId;
        if (scanner !== ticket.batch.event.creator.id && !ticket.batch.event.collaborators.some((collaborator) => collaborator.id === scanner)) {
            throw new Error("You are not the ticket creator or collaborator");
        }
        if(ticket.status === "used"){
            throw new Error("Ticket already used");
        }
        ticket.status = "used";
        return await this.repo.save(ticket);
    }
}
