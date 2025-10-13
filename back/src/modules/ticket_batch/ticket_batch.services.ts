import { BaseService } from "../../utils/base.services";
import { TicketBatch } from "./ticket_batch.entity";
import { TicketBatchDto } from "./ticket_batch.dto";
import { EventRepo } from "../event/event.repo";
import { TicketService } from "../ticket/ticket.services";
import { RouletteRepo } from "../roulette/roulette.repo";
import { rouletteDto } from "../roulette/roulette.dto";
import { ticketDesignInfoDto } from "../ticket/ticket.dto";
import JSZip from "jszip";
import path from "path";
import fs from "fs";

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

    const savedBatch = await this.repo.save(batch);

    await this.ticketService.generate({
      batch: savedBatch,
      event_code: event.code,
      ticket_number: dto.ticket,
    },false);

    return true;
  }

  async createDynamicTicketBatch(id:number , dto: TicketBatchDto) {
    const event = await this.eventRepo.findOneByOrFail({ id });

    const batch = this.repo.create({
      event,
      name: dto.name,
      dynamic: true,
    });

    const savedBatch = await this.repo.save(batch);

    await this.ticketService.generate({
      batch:  savedBatch,
      event_code: event.code,
      ticket_number: dto.ticket,
    },true);

    return true;
  }

  async addroulette(id:number , dto: rouletteDto) {
    const batch = await this.repo.findOneOrFail({ where: { id }, relations: { event: true } });
    const roulette = this.rouletteRepo.create({
      batch,
      sectors: dto.sectors,
    });
    await this.rouletteRepo.save(roulette);
    batch.roulette = roulette;  
    await this.ticketService.addQrData( batch.id );
    return this.repo.save(batch)
  }

  async deleteBatch(id:number){
    const batch = await this.repo.findOneByOrFail({ id });
    return this.repo.delete(id);
  }

<<<<<<< HEAD
  async downloadTicketBatchZip(
    id: number,
    ticketDesignInfo: ticketDesignInfoDto,
    ticketFile?: Express.Multer.File
  ) {
    const batch = await this.repo.findOne({
      where: { id },
      relations: ["event", "tickets"],
    });

    if (!batch) throw new Error("Batch not found");
    if (!batch.tickets || batch.tickets.length === 0)
      throw new Error("No tickets found in batch");

    // Prepare ZIP & temporary dirs
    const zip = new JSZip();
    const tempDir = path.join("temp", `batch-${batch.id}`);
    fs.mkdirSync(tempDir, { recursive: true });

    // Loop through tickets
    for (const ticket of batch.tickets) {
      const ticketCode = ticket.code || `${batch.event.code}-${ticket.id}`;

      // Apply ticket-specific code
      const designWithCode = {
        ...ticketDesignInfo,
        code: ticketCode,
      };

      // Use frontend’s uploaded image or fallback
      const ticketTemplate = ticketFile
        ? ticketFile
        : { path: "uploads/default-template.png" };

      const generatedPath = await this.ticketService.generateTicketWithCode(
        designWithCode,
        ticketTemplate as Express.Multer.File
      );

      const fileBuffer = fs.readFileSync(generatedPath);
      const fileName = `ticket-${ticketCode}.png`;

      zip.file(fileName, fileBuffer);
      fs.unlinkSync(generatedPath);
    }

    // Final ZIP
    const outputDir = "temp/zips";
    fs.mkdirSync(outputDir, { recursive: true });

    const zipPath = path.join(outputDir, `batch-${batch.id}-${Date.now()}.zip`);
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    fs.writeFileSync(zipPath, zipBuffer);

    fs.rmSync(tempDir, { recursive: true, force: true });

    return path.resolve(zipPath);
=======
  async getBatchesByEventId(eventId: number) {
    await this.eventRepo.findOneByOrFail({ id: eventId });
    return this.repo.find({
      where: { event: { id: eventId } },
      order: { createdAt: "DESC" }
    });
>>>>>>> 8b934220d7dfeb5604da8c167a0fa6d151a8c95b
  }
}
