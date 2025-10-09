import { Events } from "./event.entity";
import { EventDto } from "./event.dto";
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
    newEvent.user = await this.userRepo.findOneByOrFail({ id: eventDto.userId });
    return await this.repo.save(newEvent);
  }
}
