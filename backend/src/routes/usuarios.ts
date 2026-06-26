import { Router, Response } from "express";
import pool from "../db/connection";
import { authenticate, requireDocente, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// GET /usuarios/me — perfil do usuário autenticado
router.get("/me", async (req: AuthRequest, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      "SELECT id_usuario, nome, email, tipo_perfil, criado_em FROM Usuarios WHERE id_usuario = ?",
      [req.user!.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Usuário não encontrado." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// GET /usuarios — listar todos os usuários (apenas docentes)
router.get("/", requireDocente, async (_req: AuthRequest, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      "SELECT id_usuario, nome, email, tipo_perfil, criado_em FROM Usuarios ORDER BY nome"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// GET /usuarios/discentes — listar apenas alunos (para docentes matricularem)
router.get("/discentes", requireDocente, async (_req: AuthRequest, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      "SELECT id_usuario, nome, email FROM Usuarios WHERE tipo_perfil = 'Discente' ORDER BY nome"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

export default router;
