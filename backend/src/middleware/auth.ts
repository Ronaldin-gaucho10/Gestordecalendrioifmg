import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ifmg_calendario_secret_change_in_prod";

export interface AuthRequest extends Request {
  user?: { id: number; tipo_perfil: "Docente" | "Discente" };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido." });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthRequest["user"];
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

export function requireDocente(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.tipo_perfil !== "Docente") {
    return res.status(403).json({ error: "Acesso restrito a docentes." });
  }
  next();
}

export { JWT_SECRET };
