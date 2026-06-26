import { Router, Response } from "express";
import pool from "../db/connection";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// GET /notificacoes — notificações do usuário autenticado
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT n.*, e.titulo AS titulo_evento
       FROM Notificacoes n
       LEFT JOIN Eventos e ON n.id_evento = e.id_evento
       WHERE n.id_usuario = ?
       ORDER BY n.data_envio DESC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// GET /notificacoes/nao-lidas — contagem de não lidas
router.get("/nao-lidas", async (req: AuthRequest, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      "SELECT COUNT(*) AS total FROM Notificacoes WHERE id_usuario = ? AND status_leitura = FALSE",
      [req.user!.id]
    );
    res.json({ total: rows[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// PATCH /notificacoes/:id/lida — marcar como lida
router.patch("/:id/lida", async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(
      "UPDATE Notificacoes SET status_leitura = TRUE WHERE id_notificacao = ? AND id_usuario = ?",
      [req.params.id, req.user!.id]
    );
    res.json({ mensagem: "Notificação marcada como lida." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// PATCH /notificacoes/marcar-todas-lidas
router.patch("/marcar-todas-lidas", async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(
      "UPDATE Notificacoes SET status_leitura = TRUE WHERE id_usuario = ?",
      [req.user!.id]
    );
    res.json({ mensagem: "Todas as notificações marcadas como lidas." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

export default router;
