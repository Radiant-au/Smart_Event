import { BaseService } from "../../utils/base.services";
import { TicketBatch } from "./ticket_batch.entity";
import { TicketBatchDto } from "./ticket_batch.dto";
import { EventRepo } from "../event/event.repo";
import { TicketService } from "../ticket/ticket.services";

export class TicketBatchService extends BaseService<TicketBatch> {
  private eventRepo = EventRepo;
  private ticketService = new TicketService();

  constructor() {
    super(TicketBatch);
  }

  async createTicketBatch(id:number , dto: TicketBatchDto) {
    const event = await this.eventRepo.findOneByOrFail({ id });

    const batch = this.repo.create({
      event,
      name: dto.name,
      price: dto.price,
      dynamicConfig: dto.dynamicConfig ?? undefined,
    });

    await this.ticketService.generate({
      batch,
      event_code: event.code,
      ticket_number: dto.ticket,
    });

    return await this.repo.save(batch);
  }
}
