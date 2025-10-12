import { BaseService } from "../../utils/base.services";
import { TicketBatch } from "./ticket_batch.entity";
import { TicketBatchDto } from "./ticket_batch.dto";
import { EventRepo } from "../event/event.repo";
import { TicketService } from "../ticket/ticket.services";
import { RouletteRepo } from "../roulette/roulette.repo";
import { rouletteDto } from "../roulette/roulette.dto";

export class TicketBatchService extends BaseService<TicketBatch> {
  private eventRepo = EventRepo;
  private rouletteRepo = RouletteRepo;
  private ticketService = new TicketService();

  constructor() {
    super(TicketBatch);
  }

  async createTicketBatch(id:number , dto: TicketBatchDto) {
    const event = await this.eventRepo.findOneByOrFail({ id });

    const batch = this.repo.create({
      event,
      name: dto.name,
      price: dto.price
    });

    await this.ticketService.generate({
      batch,
      event_code: event.code,
      ticket_number: dto.ticket,
    });

    return await this.repo.save(batch);
  }

  async createDynamicTicketBatch(id:number , dto: TicketBatchDto) {
    const event = await this.eventRepo.findOneByOrFail({ id });

    const batch = this.repo.create({
      event,
      name: dto.name,
      dynamic: true,
    });

    await this.ticketService.generate({
      batch,
      event_code: event.code,
      ticket_number: dto.ticket,
    });

    return await this.repo.save(batch);
  }

  async addroulette(id:number , dto: rouletteDto) {
    const batch = await this.repo.findOneOrFail({ where: { id }, relations: { event: true } });
    const roulette = this.rouletteRepo.create({
      batch,
      sectors: dto.sectors,
    });
    batch.roulette = roulette;   
    await this.ticketService.addQrData({
      ticketBatch: batch.id,
      eventId: batch.event.id,
    });
    return await this.repo.save(batch);
  }
  
}
