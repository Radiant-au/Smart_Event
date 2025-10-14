import { Events } from "./event.entity";
import { EventDto, CollaboratorDto } from "./event.dto";
import { generateRandomString } from "../../utils/generate";
import { UserRepo } from "../user/user.repo";
import { BaseService } from "../../utils/base.services";

export class EventService extends BaseService<Events> {
  private userRepo = UserRepo;

  constructor() {
    super(Events);
  }

  async createEvent(eventDto: EventDto) {
    const newEvent = this.repo.create(eventDto);
    newEvent.code = generateRandomString(3);
    newEvent.creator = await this.userRepo.findOneByOrFail({
      id: eventDto.userId,
    });
    return await this.repo.save(newEvent);
  }

  async addCollaborator(eventId: number, userId: number) {
    const event = await this.repo.findOneOrFail({
      where: { id: eventId },
      relations: ["collaborators"],
    });
    const user = await this.userRepo.findOneByOrFail({ id: userId });
    event.collaborators.push(user);
    return await this.repo.save(event);
  }

  async addCollaboratorByEmail(eventId: number, email: string) {
    const event = await this.repo.findOneOrFail({
      where: { id: eventId },
      relations: ["collaborators"],
    });
    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      const err: any = new Error("User not found");
      err.status = 404;
      throw err;
    }
    event.collaborators.push(user);
    return await this.repo.save(event);
  }

  async removeCollaborator(eventId: number, userId: number) {
    const event = await this.repo.findOneOrFail({
      where: { id: eventId },
      relations: ["collaborators"],
    });
    const user = await this.userRepo.findOneByOrFail({ id: userId });
    event.collaborators = event.collaborators.filter(
      (collaborator) => collaborator.id !== user.id
    );
    return await this.repo.save(event);
  }

  async getCollaboratorByEventId(eventId: number): Promise<CollaboratorDto[]> {
    const event = await this.repo.findOneOrFail({
      where: { id: eventId },
      relations: ["collaborators"],
    });
    return (event.collaborators || []).map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
    }));
  }
}
