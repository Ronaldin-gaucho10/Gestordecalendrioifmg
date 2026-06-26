import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/connection";
import { JWT_SECRET } from "../middleware/auth";

const router = Router();

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  try {
    const [rows]: any = await pool.query(
      "SELECT id_usuario, nome, email, senha_hash, tipo_perfil FROM Usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const usuario = rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, tipo_perfil: usuario.tipo_perfil },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      usuario: {
        id:          usuario.id_usuario,
        nome:        usuario.nome,
        email:       usuario.email,
        tipo_perfil: usuario.tipo_perfil,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// POST /auth/registro
router.post("/registro", async (req: Request, res: Response) => {
  const { nome, email, senha, tipo_perfil } = req.body;

  if (!nome || !email || !senha || !tipo_perfil) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  if (!["Docente", "Discente"].includes(tipo_perfil)) {
    return res.status(400).json({ error: "tipo_perfil deve ser 'Docente' ou 'Discente'." });
  }

  try {
    const [existing]: any = await pool.query(
      "SELECT id_usuario FROM Usuarios WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email já cadastrado." });
    }

    const senha_hash = await bcrypt.hash(senha, 10);
    const [result]: any = await pool.query(
      "INSERT INTO Usuarios (nome, email, senha_hash, tipo_perfil) VALUES (?, ?, ?, ?)",
      [nome, email, senha_hash, tipo_perfil]
    );

    res.status(201).json({ id_usuario: result.insertId, nome, email, tipo_perfil });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

export default router;
