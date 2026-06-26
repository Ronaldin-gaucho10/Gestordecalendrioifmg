import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, Loader2, Pencil, Trash2, X, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { eventosApi, turmasApi, ApiEvento, ApiTurma, CriarEventoPayload } from "../services/api";

const TIPO_CORES: Record<string, string> = {
  Prova:    "bg-red-100 text-red-700 border-red-200",
  Trabalho: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Aula:     "bg-primary/10 text-primary border-primary/20",
  Outro:    "bg-gray-100 text-gray-700 border-gray-200",
};

const TIPOS = ["Prova", "Trabalho", "Aula", "Outro"] as const;

interface FormState {
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  tipo: string;
  id_turma: number | "";
}

const FORM_VAZIO: FormState = {
  titulo: "", descricao: "", data_inicio: "", data_fim: "", tipo: "Outro", id_turma: "",
};

export function EventsPage() {
  const { isTeacher } = useAuth();

  const [eventos, setEventos]   = useState<ApiEvento[]>([]);
  const [turmas, setTurmas]     = useState<ApiTurma[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const [modalAberto, setModalAberto]   = useState(false);
  const [editandoId, setEditandoId]     = useState<number | null>(null);
  const [form, setForm]                 = useState<FormState>(FORM_VAZIO);
  const [salvando, setSalvando]         = useState(false);
  const [formErro, setFormErro]         = useState<string | null>(null);

  const carregar = async () => {
    try {
      const [evs, trs] = await Promise.all([
        eventosApi.listar(),
        isTeacher ? turmasApi.listar() : Promise.resolve([]),
      ]);
      setEventos(evs);
      setTurmas(trs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirCriar = () => {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setFormErro(null);
    setModalAberto(true);
  };

  const abrirEditar = (ev: ApiEvento) => {
    setEditandoId(ev.id_evento);
    setForm({
      titulo:      ev.titulo,
      descricao:   ev.descricao || "",
      data_inicio: ev.data_inicio.slice(0, 16),
      data_fim:    ev.data_fim ? ev.data_fim.slice(0, 16) : "",
      tipo:        ev.tipo,
      id_turma:    ev.id_turma,
    });
    setFormErro(null);
    setModalAberto(true);
  };

  const fecharModal = () => { setModalAberto(false); setFormErro(null); };

  const salvar = async () => {
    if (!form.titulo || !form.data_inicio || form.id_turma === "") {
      setFormErro("Preencha título, data de início e turma.");
      return;
    }
    setSalvando(true);
    setFormErro(null);
    const payload: CriarEventoPayload = {
      titulo:      form.titulo,
      descricao:   form.descricao || undefined,
      data_inicio: form.data_inicio,
      data_fim:    form.data_fim || undefined,
      tipo:        form.tipo,
      id_turma:    Number(form.id_turma),
    };
    try {
      if (editandoId) {
        await eventosApi.editar(editandoId, payload);
      } else {
        await eventosApi.criar(payload);
      }
      fecharModal();
      setLoading(true);
      await carregar();
    } catch (err: any) {
      setFormErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id: number) => {
    if (!confirm("Excluir este evento?")) return;
    try {
      await eventosApi.excluir(id);
      setEventos((prev) => prev.filter((e) => e.id_evento !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-primary mb-2">Eventos</h2>
          <p className="text-muted-foreground">
            {isTeacher ? "Todos os eventos das suas turmas" : "Eventos das suas turmas"}
          </p>
        </div>
        {isTeacher && (
          <button
            onClick={abrirCriar}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Criar Evento
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4">
          {eventos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-border">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum evento cadastrado</p>
            </div>
          ) : (
            eventos.map((ev) => (
              <div
                key={ev.id_evento}
                className="bg-white border border-border rounded-lg p-6 hover:border-primary/50 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-3 py-1 rounded-md border text-sm ${TIPO_CORES[ev.tipo] || TIPO_CORES.Outro}`}>
                      {ev.tipo}
                    </span>
                    <h3 className="text-foreground">{ev.titulo}</h3>
                  </div>
                  {isTeacher && (
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => abrirEditar(ev)}
                        className="p-2 hover:bg-primary/10 rounded-md text-primary transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => excluir(ev.id_evento)}
                        className="p-2 hover:bg-destructive/10 rounded-md text-destructive transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-1">{ev.turmas?.nome_disciplina} · {ev.turmas?.codigo_disciplina}</p>
                {ev.descricao && <p className="text-muted-foreground mb-3">{ev.descricao}</p>}

                <div className="flex items-center gap-4 pt-3 border-t border-border flex-wrap">
                  <span className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm">
                    {format(new Date(ev.data_inicio), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </span>
                  {ev.data_fim && (
                    <span className="text-sm text-muted-foreground">
                      até {format(new Date(ev.data_fim), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal criar/editar */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-primary">{editandoId ? "Editar Evento" : "Novo Evento"}</h3>
              <button onClick={fecharModal} className="p-1 hover:bg-accent rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErro && (
              <div className="mb-4 px-3 py-2 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm">
                {formErro}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm text-foreground">Título *</label>
                <input
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-foreground">Turma *</label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.id_turma}
                  onChange={(e) => setForm({ ...form, id_turma: Number(e.target.value) })}
                >
                  <option value="">Selecione...</option>
                  {turmas.map((t) => (
                    <option key={t.id_turma} value={t.id_turma}>
                      {t.nome_disciplina} ({t.semestre})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm text-foreground">Tipo</label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                >
                  {TIPOS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm text-foreground">Data início *</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.data_inicio}
                    onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-foreground">Data fim</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.data_fim}
                    onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm text-foreground">Descrição</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={fecharModal}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editandoId ? "Salvar" : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
