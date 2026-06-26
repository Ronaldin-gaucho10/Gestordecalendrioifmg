import { supabase } from "../lib/supabase";

// --- Tipos ---
export interface ApiEvento {
  id_evento: number;
  titulo: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string | null;
  tipo: "Prova" | "Trabalho" | "Aula" | "Outro";
  id_turma: number;
  turmas: { nome_disciplina: string; codigo_disciplina: string } | null;
}

export interface ApiNotificacao {
  id_notificacao: number;
  mensagem: string;
  status_leitura: boolean;
  data_envio: string;
  eventos: { titulo: string } | null;
}

export interface ApiTurma {
  id_turma: number;
  nome_disciplina: string;
  codigo_disciplina: string;
  semestre: string;
}

export interface ApiUsuario {
  id: string;
  nome: string;
  email: string;
  tipo_perfil: "Docente" | "Discente";
}

export interface CriarEventoPayload {
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim?: string;
  tipo?: string;
  id_turma: number;
}

// --- Helpers ---
async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return user.id;
}

async function isDocente(): Promise<boolean> {
  const uid = await getUserId();
  const { data } = await supabase
    .from("profiles")
    .select("tipo_perfil")
    .eq("id", uid)
    .single();
  return data?.tipo_perfil === "Docente";
}

// --- Eventos ---
export const eventosApi = {
  listar: async (): Promise<ApiEvento[]> => {
    const { data, error } = await supabase
      .from("eventos")
      .select("*, turmas(nome_disciplina, codigo_disciplina)")
      .order("data_inicio");
    if (error) throw new Error(error.message);
    return data as ApiEvento[];
  },

  hoje: async (): Promise<ApiEvento[]> => {
    const hoje = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("eventos")
      .select("*, turmas(nome_disciplina, codigo_disciplina)")
      .gte("data_inicio", `${hoje}T00:00:00`)
      .lte("data_inicio", `${hoje}T23:59:59`)
      .order("data_inicio");
    if (error) throw new Error(error.message);
    return data as ApiEvento[];
  },

  criar: async (payload: CriarEventoPayload): Promise<void> => {
    const uid = await getUserId();
    const { data: evento, error } = await supabase
      .from("eventos")
      .insert({ ...payload, id_criador: uid })
      .select("id_evento")
      .single();
    if (error) throw new Error(error.message);

    // Notificar alunos matriculados
    const { data: matriculas } = await supabase
      .from("matriculas")
      .select("id_usuario")
      .eq("id_turma", payload.id_turma);

    if (matriculas && matriculas.length > 0) {
      await supabase.from("notificacoes").insert(
        matriculas.map((m: { id_usuario: string }) => ({
          id_usuario: m.id_usuario,
          id_evento:  evento.id_evento,
          mensagem:   `Novo evento "${payload.titulo}" adicionado à sua turma.`,
        }))
      );
    }
  },

  editar: async (id: number, payload: Partial<CriarEventoPayload>): Promise<void> => {
    const { error } = await supabase
      .from("eventos")
      .update(payload)
      .eq("id_evento", id);
    if (error) throw new Error(error.message);
  },

  excluir: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from("eventos")
      .delete()
      .eq("id_evento", id);
    if (error) throw new Error(error.message);
  },
};

// --- Notificações ---
export const notificacoesApi = {
  listar: async (): Promise<ApiNotificacao[]> => {
    const { data, error } = await supabase
      .from("notificacoes")
      .select("*, eventos(titulo)")
      .order("data_envio", { ascending: false });
    if (error) throw new Error(error.message);
    return data as ApiNotificacao[];
  },

  naoLidas: async (): Promise<number> => {
    const { count, error } = await supabase
      .from("notificacoes")
      .select("*", { count: "exact", head: true })
      .eq("status_leitura", false);
    if (error) throw new Error(error.message);
    return count ?? 0;
  },

  marcarLida: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from("notificacoes")
      .update({ status_leitura: true })
      .eq("id_notificacao", id);
    if (error) throw new Error(error.message);
  },

  marcarTodasLidas: async (): Promise<void> => {
    const uid = await getUserId();
    const { error } = await supabase
      .from("notificacoes")
      .update({ status_leitura: true })
      .eq("id_usuario", uid)
      .eq("status_leitura", false);
    if (error) throw new Error(error.message);
  },
};

// --- Turmas ---
export const turmasApi = {
  listar: async (): Promise<ApiTurma[]> => {
    const { data, error } = await supabase
      .from("turmas")
      .select("id_turma, nome_disciplina, codigo_disciplina, semestre")
      .order("semestre", { ascending: false });
    if (error) throw new Error(error.message);
    return data as ApiTurma[];
  },
};

// --- Usuários ---
export const usuariosApi = {
  discentes: async (): Promise<ApiUsuario[]> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nome, tipo_perfil")
      .eq("tipo_perfil", "Discente")
      .order("nome");
    if (error) throw new Error(error.message);
    return data as ApiUsuario[];
  },
};
