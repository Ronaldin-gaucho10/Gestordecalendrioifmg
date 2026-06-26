import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { notificacoesApi, ApiNotificacao } from "../services/api";

export function NotificationsPage() {
  const [notificacoes, setNotificacoes] = useState<ApiNotificacao[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const carregar = () =>
    notificacoesApi
      .listar()
      .then(setNotificacoes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

  useEffect(() => { carregar(); }, []);

  const marcarLida = async (id: number) => {
    await notificacoesApi.marcarLida(id);
    setNotificacoes((prev) =>
      prev.map((n) => (n.id_notificacao === id ? { ...n, status_leitura: true } : n))
    );
  };

  const marcarTodas = async () => {
    await notificacoesApi.marcarTodasLidas();
    setNotificacoes((prev) => prev.map((n) => ({ ...n, status_leitura: true })));
  };

  const naoLidas = notificacoes.filter((n) => !n.status_leitura).length;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-primary mb-2">Notificações</h2>
          <p className="text-muted-foreground">
            {naoLidas > 0
              ? `Você tem ${naoLidas} ${naoLidas === 1 ? "notificação não lida" : "notificações não lidas"}`
              : "Tudo em dia"}
          </p>
        </div>
        {naoLidas > 0 && (
          <button
            onClick={marcarTodas}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
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
        <div className="space-y-3">
          {notificacoes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-border">
              <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            notificacoes.map((n) => (
              <div
                key={n.id_notificacao}
                className={`bg-white border rounded-lg p-5 transition-all ${
                  n.status_leitura ? "border-border" : "border-primary/30 bg-primary/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 ${
                    n.status_leitura ? "bg-gray-100 text-gray-500" : "bg-primary/10 text-primary"
                  }`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {n.eventos?.titulo && (
                          <p className="font-medium text-foreground mb-0.5">
                            {n.eventos.titulo}
                            {!n.status_leitura && (
                              <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full align-middle" />
                            )}
                          </p>
                        )}
                        <p className="text-muted-foreground">{n.mensagem}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.data_envio), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      {!n.status_leitura && (
                        <button
                          onClick={() => marcarLida(n.id_notificacao)}
                          className="p-2 hover:bg-primary/10 rounded-md text-primary transition-colors flex-shrink-0"
                          title="Marcar como lida"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
