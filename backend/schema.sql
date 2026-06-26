-- =============================================================
-- Gestor de Calendário IFMG — Schema MySQL
-- =============================================================

CREATE DATABASE IF NOT EXISTS gestor_calendario CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestor_calendario;

-- -------------------------------------------------------------
-- Usuários (Docentes e Discentes)
-- -------------------------------------------------------------
CREATE TABLE Usuarios (
    id_usuario   INT AUTO_INCREMENT PRIMARY KEY,
    nome         VARCHAR(100) NOT NULL,
    email        VARCHAR(100) UNIQUE NOT NULL,
    senha_hash   VARCHAR(255) NOT NULL,          -- bcrypt hash, nunca texto puro
    tipo_perfil  ENUM('Docente', 'Discente') NOT NULL,
    criado_em    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- Turmas
-- -------------------------------------------------------------
CREATE TABLE Turmas (
    id_turma           INT AUTO_INCREMENT PRIMARY KEY,
    nome_disciplina    VARCHAR(100) NOT NULL,
    codigo_disciplina  VARCHAR(20)  NOT NULL,
    semestre           VARCHAR(10)  NOT NULL,     -- Ex: '2024.1'
    id_docente         INT NOT NULL,              -- professor responsável
    criado_em          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_docente) REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT
);

-- -------------------------------------------------------------
-- Matrículas (N:N entre Usuários e Turmas)
-- -------------------------------------------------------------
CREATE TABLE Matriculas (
    id_usuario  INT,
    id_turma    INT,
    matriculado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_turma),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_turma)   REFERENCES Turmas(id_turma)    ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- Eventos
-- -------------------------------------------------------------
CREATE TABLE Eventos (
    id_evento    INT AUTO_INCREMENT PRIMARY KEY,
    titulo       VARCHAR(150) NOT NULL,
    descricao    TEXT,
    data_inicio  DATETIME NOT NULL,
    data_fim     DATETIME,
    tipo         ENUM('Prova', 'Trabalho', 'Aula', 'Outro') DEFAULT 'Outro',
    id_turma     INT NOT NULL,
    id_criador   INT NOT NULL,                    -- docente que criou
    criado_em    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_turma)   REFERENCES Turmas(id_turma)    ON DELETE CASCADE,
    FOREIGN KEY (id_criador) REFERENCES Usuarios(id_usuario) ON DELETE RESTRICT
);

-- -------------------------------------------------------------
-- Notificações
-- -------------------------------------------------------------
CREATE TABLE Notificacoes (
    id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario     INT NOT NULL,                  -- destinatário
    id_evento      INT,                           -- evento relacionado (opcional)
    mensagem       TEXT NOT NULL,
    status_leitura BOOLEAN DEFAULT FALSE,
    data_envio     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_evento)  REFERENCES Eventos(id_evento)   ON DELETE SET NULL
);

-- =============================================================
-- Dados de exemplo para teste
-- =============================================================

-- Senhas abaixo são hash bcrypt de "senha123"
INSERT INTO Usuarios (nome, email, senha_hash, tipo_perfil) VALUES
  ('Prof. Carlos Silva',  'carlos@ifmg.edu.br',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Docente'),
  ('Aluna Maria Souza',   'maria@ifmg.edu.br',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Discente'),
  ('Aluno João Pereira',  'joao@ifmg.edu.br',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Discente');

INSERT INTO Turmas (nome_disciplina, codigo_disciplina, semestre, id_docente) VALUES
  ('Cálculo I',            'MAT001', '2024.1', 1),
  ('Programação Web',      'INF042', '2024.1', 1);

INSERT INTO Matriculas (id_usuario, id_turma) VALUES
  (2, 1), (2, 2),
  (3, 1);

INSERT INTO Eventos (titulo, descricao, data_inicio, data_fim, tipo, id_turma, id_criador) VALUES
  ('Prova P1 — Cálculo I', 'Conteúdo: limites e derivadas', '2024-04-10 08:00:00', '2024-04-10 10:00:00', 'Prova', 1, 1),
  ('Entrega Trabalho Web',  'Deploy do projeto final',       '2024-04-20 23:59:00', NULL,                   'Trabalho', 2, 1);
