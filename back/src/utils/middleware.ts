import { UserRepo } from "../modules/user/user.repo";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function authenticateUserToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token is not provided" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultSecret"
    ) as { userId: number };
    if (!decoded?.userId) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }
    const admin = await UserRepo.findOneBy({ id: decoded.userId });
    if (admin) {
      next();
    } else {
      res.status(401).json({ message: "Token is not valid or expired" });
    }
  } catch (err) {
    res.status(401).json({ message: "Token is not valid or expired" });
  }
}
