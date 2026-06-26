import { Router, Response } from "express";
import pool from "../db/connection";
import { authenticate, requireDocente, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// GET /turmas — lista turmas do usuário autenticado
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    let rows: any;
    if (req.user!.tipo_perfil === "Docente") {
      [rows] = await pool.query(
        "SELECT * FROM Turmas WHERE id_docente = ? ORDER BY semestre DESC",
        [req.user!.id]
      );
    } else {
      [rows] = await pool.query(
        `SELECT t.* FROM Turmas t
         INNER JOIN Matriculas m ON t.id_turma = m.id_turma
         WHERE m.id_usuario = ?
         ORDER BY t.semestre DESC`,
        [req.user!.id]
      );
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// GET /turmas/:id — detalhes de uma turma (com alunos matriculados)
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const [turma]: any = await pool.query(
      "SELECT * FROM Turmas WHERE id_turma = ?",
      [req.params.id]
    );
    if (turma.length === 0) return res.status(404).json({ error: "Turma não encontrada." });

    const [alunos]: any = await pool.query(
      `SELECT u.id_usuario, u.nome, u.email FROM Usuarios u
       INNER JOIN Matriculas m ON u.id_usuario = m.id_usuario
       WHERE m.id_turma = ?`,
      [req.params.id]
    );

    res.json({ ...turma[0], alunos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// POST /turmas — criar turma (apenas docentes)
router.post("/", requireDocente, async (req: AuthRequest, res: Response) => {
  const { nome_disciplina, codigo_disciplina, semestre } = req.body;
  if (!nome_disciplina || !codigo_disciplina || !semestre) {
    return res.status(400).json({ error: "Campos obrigatórios: nome_disciplina, codigo_disciplina, semestre." });
  }
  try {
    const [result]: any = await pool.query(
      "INSERT INTO Turmas (nome_disciplina, codigo_disciplina, semestre, id_docente) VALUES (?, ?, ?, ?)",
      [nome_disciplina, codigo_disciplina, semestre, req.user!.id]
    );
    res.status(201).json({ id_turma: result.insertId, nome_disciplina, codigo_disciplina, semestre });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// POST /turmas/:id/matricular — matricular aluno em turma (apenas docentes)
router.post("/:id/matricular", requireDocente, async (req: AuthRequest, res: Response) => {
  const { id_usuario } = req.body;
  if (!id_usuario) return res.status(400).json({ error: "id_usuario é obrigatório." });
  try {
    await pool.query(
      "INSERT IGNORE INTO Matriculas (id_usuario, id_turma) VALUES (?, ?)",
      [id_usuario, req.params.id]
    );
    res.status(201).json({ mensagem: "Aluno matriculado com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// DELETE /turmas/:id — excluir turma (apenas docente dono da turma)
router.delete("/:id", requireDocente, async (req: AuthRequest, res: Response) => {
  try {
    const [turma]: any = await pool.query(
      "SELECT id_docente FROM Turmas WHERE id_turma = ?",
      [req.params.id]
    );
    if (turma.length === 0) return res.status(404).json({ error: "Turma não encontrada." });
    if (turma[0].id_docente !== req.user!.id) {
      return res.status(403).json({ error: "Você não é o docente desta turma." });
    }
    await pool.query("DELETE FROM Turmas WHERE id_turma = ?", [req.params.id]);
    res.json({ mensagem: "Turma excluída com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

export default router;
