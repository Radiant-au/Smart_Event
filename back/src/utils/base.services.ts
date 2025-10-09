import { Repository, EntityTarget, DeepPartial, ObjectLiteral } from "typeorm";
import { AppDataSource } from "../config/data-source";

export class BaseService<T extends ObjectLiteral> {
  protected repo: Repository<T>;

  constructor(entity: EntityTarget<T>) {
    this.repo = AppDataSource.getRepository<T>(entity);
  }

  async findAll(): Promise<T[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<T | null> {
    return this.repo.findOneBy({ id } as any);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return await this.repo.save(entity);
  }

  async update(id: number, data: DeepPartial<T>): Promise<T> {
    const entity = await this.repo.preload({ id, ...(data as any) });
    if (!entity) throw new Error("Not found");
    return this.repo.save(entity);
  }
  
  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
