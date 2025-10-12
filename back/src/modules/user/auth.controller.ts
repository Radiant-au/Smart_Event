import { Request, Response } from "express";
import { asyncHandler } from "../../utils/handler";
import { AuthService } from "./auth.service";
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  ResetPasswordDto,
} from "./auth.dto";

export class AuthController {
  private authService = new AuthService();

  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler(async (req: Request, res: Response) => {
    const dto: RegisterDto = req.body;
    const user = await this.authService.registerUser(dto);
    res.status(201).json({ success: true, data: user });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const dto: LoginDto = req.body;
    const token = await this.authService.loginUser(dto);
    res.status(200).json({ success: true, data: token });
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    const dto: ChangePasswordDto = req.body;
    const result = await this.authService.changePassword(userId, dto);
    res.status(200).json({ success: true, data: result });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const dto: ResetPasswordDto = req.body;
    const result = await this.authService.resetPassword(dto);
    res.status(200).json({ success: true, data: result });
  });

  getMe = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) throw new Error("Token not provided");

      const user = await this.authService.getUserByToken(token);
      res.status(200).json(user);
    } catch (err: any) {
      res.status(401).json({ message: err.message });
    }
  };
}
