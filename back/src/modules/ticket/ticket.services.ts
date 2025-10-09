import { TicketDto } from "./ticket.dto";
import { TicketRepo } from "./ticket.repo";
import { Ticket } from "./ticket.entity";

export class TicketService {

   async generate(ticketsDto: TicketDto) {
        const tickets: Ticket[] = [];
        for (let i = 0; i < ticketsDto.ticket_number; i++) {
            const newTicket = new Ticket();
            newTicket.batch = ticketsDto.batch;
            newTicket.code = ticketsDto.event_code + `00${i + 1}`;
            tickets.push(newTicket);
        }
        return await TicketRepo.insert(tickets);
    }
}
