import { BaseService } from "../../utils/base.services";
import { User } from "./user.entity";
import { UserRepo } from "./user.repo";
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  ResetPasswordDto,
} from "./auth.dto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService extends BaseService<User> {
  private userRepo = UserRepo;

  constructor() {
    super(User);
  }

  private generateToken(payload: object) {
    return jwt.sign(payload, process.env.JWT_SECRET || "defaultSecret", {
      expiresIn: (process.env.JWT_EXPIRE_MINUTES +
        "m") as jwt.SignOptions["expiresIn"],
    });
  }

  private hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
  }

  private async comparePassword(password: string, hashed: string) {
    return await bcrypt.compare(password, hashed);
  }

  async registerUser(dto: RegisterDto) {
    const existing = await this.userRepo.findOneBy({ email: dto.email });
    if (existing) throw new Error("Email already registered");

    const hashedPassword = this.hashPassword(dto.password);
    const user = this.repo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    const saved = await this.repo.save(user);
    const { password, ...safeUser } = saved;
    return safeUser;
  }

  async loginUser(dto: LoginDto): Promise<{ token: string }> {
    const user = await this.userRepo.findOneBy({ email: dto.email });
    if (!user) throw new Error("Invalid email or password");

    const isValid = await this.comparePassword(dto.password, user.password);
    if (!isValid) throw new Error("Invalid email or password");

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
    });

    return { token };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.repo.findOneByOrFail({ id: userId });
    const isValid = await this.comparePassword(dto.oldPassword, user.password);
    if (!isValid) throw new Error("Old password is incorrect");

    user.password = this.hashPassword(dto.newPassword);
    await this.repo.save(user);

    return { message: "Password changed successfully" };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepo.findOneBy({ email: dto.email });
    if (!user) throw new Error("User not found");

    user.password = this.hashPassword(dto.newPassword);
    await this.repo.save(user);

    return { message: "Password reset successfully" };
  }

  async getUserByToken(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "defaultSecret"
      ) as {
        userId: number;
        email: string;
      };

      const user = await this.repo.findOne({
        where: { id: decoded.userId },
        relations: ["events"],
      });
      if (!user) throw new Error("User not found");

      const { password, ...safeUser } = user;
      return safeUser;
    } catch {
      throw new Error("Invalid or expired token");
    }
  }
}
