-- =============================================================
-- Gestor de Calendário IFMG — Supabase Schema (PostgreSQL)
-- Cole este script inteiro no SQL Editor do Supabase e execute.
-- =============================================================

-- Tipos enumerados
CREATE TYPE tipo_perfil AS ENUM ('Docente', 'Discente');
CREATE TYPE tipo_evento  AS ENUM ('Prova', 'Trabalho', 'Aula', 'Outro');

-- -------------------------------------------------------------
-- Profiles (extensão do auth.users do Supabase)
-- -------------------------------------------------------------
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  tipo_perfil tipo_perfil NOT NULL
);

-- Criar perfil automaticamente ao cadastrar usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nome, tipo_perfil)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'tipo_perfil')::tipo_perfil, 'Discente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- -------------------------------------------------------------
-- Turmas
-- -------------------------------------------------------------
CREATE TABLE turmas (
  id_turma          SERIAL PRIMARY KEY,
  nome_disciplina   TEXT NOT NULL,
  codigo_disciplina TEXT NOT NULL,
  semestre          TEXT NOT NULL,
  id_docente        UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  criado_em         TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- Matrículas
-- -------------------------------------------------------------
CREATE TABLE matriculas (
  id_usuario    UUID REFERENCES profiles(id)  ON DELETE CASCADE,
  id_turma      INT  REFERENCES turmas(id_turma) ON DELETE CASCADE,
  matriculado_em TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id_usuario, id_turma)
);

-- -------------------------------------------------------------
-- Eventos
-- -------------------------------------------------------------
CREATE TABLE eventos (
  id_evento   SERIAL PRIMARY KEY,
  titulo      TEXT NOT NULL,
  descricao   TEXT,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim    TIMESTAMPTZ,
  tipo        tipo_evento DEFAULT 'Outro',
  id_turma    INT  NOT NULL REFERENCES turmas(id_turma)  ON DELETE CASCADE,
  id_criador  UUID NOT NULL REFERENCES profiles(id)      ON DELETE RESTRICT,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- Notificações
-- -------------------------------------------------------------
CREATE TABLE notificacoes (
  id_notificacao SERIAL PRIMARY KEY,
  id_usuario     UUID NOT NULL REFERENCES profiles(id)     ON DELETE CASCADE,
  id_evento      INT           REFERENCES eventos(id_evento) ON DELETE SET NULL,
  mensagem       TEXT NOT NULL,
  status_leitura BOOLEAN DEFAULT FALSE,
  data_envio     TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- Row Level Security (RLS)
-- -------------------------------------------------------------
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes  ENABLE ROW LEVEL SECURITY;

-- Profiles: cada um lê o próprio; docentes leem todos
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Turmas: visível para quem é docente ou está matriculado
CREATE POLICY "turmas_select" ON turmas FOR SELECT USING (
  id_docente = auth.uid()
  OR EXISTS (SELECT 1 FROM matriculas WHERE id_turma = turmas.id_turma AND id_usuario = auth.uid())
);
CREATE POLICY "turmas_insert" ON turmas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND tipo_perfil = 'Docente')
);
CREATE POLICY "turmas_delete" ON turmas FOR DELETE USING (id_docente = auth.uid());

-- Matrículas: docente da turma gerencia; aluno vê as próprias
CREATE POLICY "matriculas_select" ON matriculas FOR SELECT USING (
  id_usuario = auth.uid()
  OR EXISTS (SELECT 1 FROM turmas WHERE id_turma = matriculas.id_turma AND id_docente = auth.uid())
);
CREATE POLICY "matriculas_insert" ON matriculas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM turmas WHERE id_turma = matriculas.id_turma AND id_docente = auth.uid())
);
CREATE POLICY "matriculas_delete" ON matriculas FOR DELETE USING (
  EXISTS (SELECT 1 FROM turmas WHERE id_turma = matriculas.id_turma AND id_docente = auth.uid())
);

-- Eventos: visível para membros da turma
CREATE POLICY "eventos_select" ON eventos FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM turmas t
    LEFT JOIN matriculas m ON t.id_turma = m.id_turma
    WHERE t.id_turma = eventos.id_turma
      AND (t.id_docente = auth.uid() OR m.id_usuario = auth.uid())
  )
);
CREATE POLICY "eventos_insert" ON eventos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM turmas WHERE id_turma = eventos.id_turma AND id_docente = auth.uid())
);
CREATE POLICY "eventos_update" ON eventos FOR UPDATE USING (id_criador = auth.uid());
CREATE POLICY "eventos_delete" ON eventos FOR DELETE USING (id_criador = auth.uid());

-- Notificações: cada usuário vê apenas as suas
CREATE POLICY "notificacoes_select" ON notificacoes FOR SELECT USING (id_usuario = auth.uid());
CREATE POLICY "notificacoes_update" ON notificacoes FOR UPDATE USING (id_usuario = auth.uid());
