import { BaseService } from "../../utils/base.services";
import { rouletteDto } from "./roulette.dto";
import { Roulette } from "./roulette.entity";

export class RouletteService extends BaseService<Roulette> {

  constructor() {
    super(Roulette);
  }

  async updateRoulette(id:number , dto: rouletteDto) {
    const roulette = await this.repo.findOneByOrFail({ id });
    roulette.sectors = dto.sectors;
    return await this.repo.save(roulette);
  }
}