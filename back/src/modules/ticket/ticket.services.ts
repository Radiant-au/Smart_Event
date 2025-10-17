import { AddDynamicDto, ScanDto, ticketDesignInfoDto, TicketCountDto, TicketDto, TicketSummaryDto } from "./ticket.dto";
import { Ticket } from "./ticket.entity";
import { BaseService } from "../../utils/base.services";
import { v4 as uuidv4 } from "uuid";
import { RouletteResultRepo } from "../roulette/roulette_result.repo";
import bwipjs from "bwip-js";
import QRCode from "qrcode";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { TicketBatchRepo } from "../ticket_batch/ticket_batch.repo";
import { UserRepo } from "../user/user.repo";

export class TicketService extends BaseService<Ticket> {
  private rouletteResultRepo = RouletteResultRepo;

  constructor() {
    super(Ticket);
  }

  async generate(ticketsDto: TicketDto, dystatus: boolean) {
    const tickets: Ticket[] = [];
    for (let i = 0; i < ticketsDto.ticket_number; i++) {
      const newTicket = new Ticket();
      newTicket.batch = ticketsDto.batch;
      newTicket.code =
        ticketsDto.event_code + (dystatus ? "D" : "") + `00${i + 1}`;
      tickets.push(newTicket);
    }
    return await this.repo.insert(tickets);
  }

  async addRouletteData(qrtoken: string, dto: AddDynamicDto) {
    const ticket = await this.repo.findOneOrFail({
      where: { qrToken: qrtoken },
      relations: ["batch.roulette"],
    });

    const rouletteResult = this.rouletteResultRepo.create({
      ticket: ticket,
      roulette: ticket.batch.roulette,
      result: dto.dynamicResult,
    });
    await this.rouletteResultRepo.save(rouletteResult);
    ticket.dynamicResult = dto.dynamicResult;
    return await this.repo.save(ticket);
  }

  async addQrData(batchId: number) {
    const tickets = await this.repo.find({
      where: { batch: { id: batchId } },
      relations: ["batch.event"],
    });
    for (const ticket of tickets) {
      ticket.qrToken = `${uuidv4().slice(0, 8)}`;
      ticket.qrUrl =
        process.env.DOMAIN + `${ticket.batch.event.id}/${ticket.qrToken}`;
    }
    return await this.repo.save(tickets);
  }

  async validateScan(dto: ScanDto) {
    const ticket = await this.repo.findOne({
      where: { code: dto.code },
      relations: ["batch.event.creator", "batch.event.collaborators"],
    });
    if (!ticket) {
      const err: any = new Error("Invalid ticket code");
      err.status = 404;
      throw err;
    }
    const scanner = await UserRepo.findOneOrFail({ where: { id: dto.userId } });
    if (
      scanner.id !== ticket.batch.event.creator.id &&
      !ticket.batch.event.collaborators.some(
        (collaborator) => collaborator.id === scanner.id
      )
    ) {
      const err: any = new Error("You are not the ticket creator or collaborator");
      err.status = 403;
      throw err;
    }
    if (ticket.status === "used") {
      const err: any = new Error("Ticket already used");
      err.status = 409;
      throw err;
    }
    ticket.scanner = scanner;
    ticket.status = "used";
    return await this.repo.save(ticket);
  }

  async getScannedTickets(userId: number) {
  const tickets = await this.repo.find({
    where: { scanner: { id: userId } },
    relations: ["scanner"],
  });

  return tickets.map((t) => ({
    code: t.code,
    status: t.status,
    scannerName: t.scanner.name,
  }));
}

  async generateTicketWithCode(ticketDesignInfo: ticketDesignInfoDto, ticketfile: Express.Multer.File, batchId: number) {
    if (!ticketfile) {
      throw new Error("No image uploaded.");
    }

    const imagePath = ticketfile.path;
    const ticketCode = ticketDesignInfo.code || "DEFAULT-CODE";

    // --- 1️⃣ Generate barcode
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: ticketCode,
      scale: 3,
      height: 10,
      includetext: false,
    });

    const resizedBarcode = await sharp(barcodeBuffer)
      .resize(parseInt(ticketDesignInfo.barcodeWidth), parseInt(ticketDesignInfo.barcodeHeight))
      .toBuffer();

    // --- 2️⃣ Generate QR (only in dynamic mode)
    let qrBuffer: Buffer | null = null;
    if (ticketDesignInfo.mode === "dynamic") {
      const qrData = `https://smartevent.io/verify/${ticketCode}`;
      const qrImageDataUrl = await QRCode.toDataURL(qrData, {
        margin: 1,
        width: 300,
      });
      const qrBase64 = qrImageDataUrl.split(",")[1];
      qrBuffer = Buffer.from(qrBase64, "base64");
    }

    // --- 3️⃣ Compose final image
    const composites: sharp.OverlayOptions[] = [
      {
        input: resizedBarcode,
        left: parseInt(ticketDesignInfo.barcodeX),
        top: parseInt(ticketDesignInfo.barcodeY),
      },
    ];

    if (ticketDesignInfo.mode === "dynamic" && qrBuffer) {
      const resizedQR = await sharp(qrBuffer)
        .resize(parseInt(ticketDesignInfo.qrWidth), parseInt(ticketDesignInfo.qrHeight))
        .toBuffer();

      composites.push({
        input: resizedQR,
        left: parseInt(ticketDesignInfo.qrX),
        top: parseInt(ticketDesignInfo.qrY),
      });
    }

    const thisBatchId = batchId;
    const outputPath = path.join("temp", `batch-${thisBatchId}`, `final-${Date.now()}.png`);

    await sharp(imagePath).composite(composites).toFile(outputPath);

    // fs.unlinkSync(imagePath);

    return path.resolve(outputPath);
  }

  async getTicketCountByBatchId(batchId: number): Promise<TicketCountDto> {
    const total = await this.repo.count({ where: { batch: { id: batchId } } });
    const used = await this.repo.count({ where: { batch: { id: batchId }, status: "used" } });
    const unused = await this.repo.count({ where: { batch: { id: batchId }, status: "unused" } });
    return { batchId, total, used, unused };
  }

  async getTicketByBatch(batchId: number): Promise<TicketSummaryDto[]> {
    // Determine if batch is dynamic
    const batch = await TicketBatchRepo.findOneByOrFail({ id: batchId });
    const isDynamic = !!batch.dynamic;
    // Load tickets for batch
    const tickets = await this.repo.find({ where: { batch: { id: batchId } } });
    if (!isDynamic) {
      // Static: only code and status
      return tickets.map((t) => ({ code: t.code, status: t.status }));
    }
    // Dynamic: include qrUrl and dynamicResult when present
    return tickets.map((t) => ({
      code: t.code,
      status: t.status,
      qrUrl: t.qrUrl ?? null,
      dynamicResult: t.dynamicResult ?? null,
    }));
  }
}