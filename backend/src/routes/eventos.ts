import { Router, Response } from "express";
import pool from "../db/connection";
import { authenticate, requireDocente, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// GET /eventos — eventos das turmas do usuário
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    let rows: any;
    if (req.user!.tipo_perfil === "Docente") {
      [rows] = await pool.query(
        `SELECT e.*, t.nome_disciplina, t.codigo_disciplina
         FROM Eventos e
         INNER JOIN Turmas t ON e.id_turma = t.id_turma
         WHERE t.id_docente = ?
         ORDER BY e.data_inicio`,
        [req.user!.id]
      );
    } else {
      [rows] = await pool.query(
        `SELECT e.*, t.nome_disciplina, t.codigo_disciplina
         FROM Eventos e
         INNER JOIN Turmas t ON e.id_turma = t.id_turma
         INNER JOIN Matriculas m ON t.id_turma = m.id_turma
         WHERE m.id_usuario = ?
         ORDER BY e.data_inicio`,
        [req.user!.id]
      );
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// GET /eventos/hoje — eventos do dia atual
router.get("/hoje", async (req: AuthRequest, res: Response) => {
  try {
    let rows: any;
    const hoje = new Date().toISOString().slice(0, 10);
    if (req.user!.tipo_perfil === "Docente") {
      [rows] = await pool.query(
        `SELECT e.*, t.nome_disciplina FROM Eventos e
         INNER JOIN Turmas t ON e.id_turma = t.id_turma
         WHERE t.id_docente = ? AND DATE(e.data_inicio) = ?
         ORDER BY e.data_inicio`,
        [req.user!.id, hoje]
      );
    } else {
      [rows] = await pool.query(
        `SELECT e.*, t.nome_disciplina FROM Eventos e
         INNER JOIN Turmas t ON e.id_turma = t.id_turma
         INNER JOIN Matriculas m ON t.id_turma = m.id_turma
         WHERE m.id_usuario = ? AND DATE(e.data_inicio) = ?
         ORDER BY e.data_inicio`,
        [req.user!.id, hoje]
      );
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// GET /eventos/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT e.*, t.nome_disciplina, t.codigo_disciplina
       FROM Eventos e INNER JOIN Turmas t ON e.id_turma = t.id_turma
       WHERE e.id_evento = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Evento não encontrado." });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// POST /eventos — criar evento (apenas docentes)
router.post("/", requireDocente, async (req: AuthRequest, res: Response) => {
  const { titulo, descricao, data_inicio, data_fim, tipo, id_turma } = req.body;
  if (!titulo || !data_inicio || !id_turma) {
    return res.status(400).json({ error: "Campos obrigatórios: titulo, data_inicio, id_turma." });
  }
  try {
    // Verificar que o docente é dono da turma
    const [turma]: any = await pool.query(
      "SELECT id_docente FROM Turmas WHERE id_turma = ?",
      [id_turma]
    );
    if (turma.length === 0) return res.status(404).json({ error: "Turma não encontrada." });
    if (turma[0].id_docente !== req.user!.id) {
      return res.status(403).json({ error: "Você não é o docente desta turma." });
    }

    const [result]: any = await pool.query(
      "INSERT INTO Eventos (titulo, descricao, data_inicio, data_fim, tipo, id_turma, id_criador) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [titulo, descricao || null, data_inicio, data_fim || null, tipo || "Outro", id_turma, req.user!.id]
    );

    // Notificar todos os alunos da turma
    const [alunos]: any = await pool.query(
      "SELECT id_usuario FROM Matriculas WHERE id_turma = ?",
      [id_turma]
    );
    if (alunos.length > 0) {
      const notificacoes = alunos.map((a: any) => [
        a.id_usuario,
        result.insertId,
        `Novo evento "${titulo}" adicionado à sua turma.`,
      ]);
      await pool.query(
        "INSERT INTO Notificacoes (id_usuario, id_evento, mensagem) VALUES ?",
        [notificacoes]
      );
    }

    res.status(201).json({ id_evento: result.insertId, titulo, data_inicio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// PUT /eventos/:id — editar evento (apenas docente dono)
router.put("/:id", requireDocente, async (req: AuthRequest, res: Response) => {
  const { titulo, descricao, data_inicio, data_fim, tipo } = req.body;
  try {
    const [evento]: any = await pool.query(
      "SELECT id_criador FROM Eventos WHERE id_evento = ?",
      [req.params.id]
    );
    if (evento.length === 0) return res.status(404).json({ error: "Evento não encontrado." });
    if (evento[0].id_criador !== req.user!.id) {
      return res.status(403).json({ error: "Você não criou este evento." });
    }

    await pool.query(
      `UPDATE Eventos SET
        titulo      = COALESCE(?, titulo),
        descricao   = COALESCE(?, descricao),
        data_inicio = COALESCE(?, data_inicio),
        data_fim    = COALESCE(?, data_fim),
        tipo        = COALESCE(?, tipo)
       WHERE id_evento = ?`,
      [titulo, descricao, data_inicio, data_fim, tipo, req.params.id]
    );
    res.json({ mensagem: "Evento atualizado com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// DELETE /eventos/:id — excluir evento (apenas docente dono)
router.delete("/:id", requireDocente, async (req: AuthRequest, res: Response) => {
  try {
    const [evento]: any = await pool.query(
      "SELECT id_criador FROM Eventos WHERE id_evento = ?",
      [req.params.id]
    );
    if (evento.length === 0) return res.status(404).json({ error: "Evento não encontrado." });
    if (evento[0].id_criador !== req.user!.id) {
      return res.status(403).json({ error: "Você não criou este evento." });
    }
    await pool.query("DELETE FROM Eventos WHERE id_evento = ?", [req.params.id]);
    res.json({ mensagem: "Evento excluído com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

export default router;
