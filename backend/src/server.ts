import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes          from "./routes/auth";
import usuariosRoutes      from "./routes/usuarios";
import turmasRoutes        from "./routes/turmas";
import eventosRoutes       from "./routes/eventos";
import notificacoesRoutes  from "./routes/notificacoes";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth",          authRoutes);
app.use("/usuarios",      usuariosRoutes);
app.use("/turmas",        turmasRoutes);
app.use("/eventos",       eventosRoutes);
app.use("/notificacoes",  notificacoesRoutes);

// Garante que o listen só rode localmente e não atrapalhe o Vercel
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

// Exportação essencial para o deploy no Vercel funcionar
export default app;
