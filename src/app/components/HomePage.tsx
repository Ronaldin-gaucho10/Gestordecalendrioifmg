import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { eventosApi, ApiEvento } from "../services/api";

const TIPO_CORES: Record<string, string> = {
  Prova:    "bg-red-100 text-red-700",
  Trabalho: "bg-yellow-100 text-yellow-700",
  Aula:     "bg-primary/10 text-primary",
  Outro:    "bg-gray-100 text-gray-700",
};

export function HomePage() {
  const today = new Date();
  const todayFormatted = format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  const [eventos, setEventos]   = useState<ApiEvento[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    eventosApi.hoje()
      .then(setEventos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-6 text-center">
        <h2 className="text-primary mb-2">Agenda de Hoje</h2>
        <p className="text-muted-foreground capitalize">{todayFormatted}</p>
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
          {eventos.length > 0 ? (
            eventos.map((evento) => (
              <div
                key={evento.id_evento}
                className="bg-white border border-border rounded-lg p-6 hover:border-primary/50 transition-colors shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm">
                        {format(new Date(evento.data_inicio), "HH:mm")}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${TIPO_CORES[evento.tipo] || TIPO_CORES.Outro}`}>
                        {evento.tipo}
                      </span>
                      <h3 className="text-foreground">{evento.titulo}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{evento.turmas?.nome_disciplina}</p>
                    {evento.descricao && (
                      <p className="text-muted-foreground">{evento.descricao}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-border">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum evento agendado para hoje</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
