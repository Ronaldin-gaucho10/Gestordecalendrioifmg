import { Bell, Check, X } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export function NotificationsPage() {
  const notifications: Notification[] = [
    {
      id: 1,
      title: 'Novo evento adicionado',
      message: 'Reunião de Coordenação agendada para amanhã às 09:00',
      time: 'há 5 minutos',
      read: false,
      type: 'info'
    },
    {
      id: 2,
      title: 'Lembrete de evento',
      message: 'Aula de Programação começa em 1 hora',
      time: 'há 30 minutos',
      read: false,
      type: 'warning'
    },
    {
      id: 3,
      title: 'Evento concluído',
      message: 'Atendimento aos Alunos foi marcado como concluído',
      time: 'há 2 horas',
      read: true,
      type: 'success'
    },
    {
      id: 4,
      title: 'Calendário atualizado',
      message: 'O calendário acadêmico foi atualizado com novos feriados',
      time: 'há 1 dia',
      read: true,
      type: 'info'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-6 text-center">
        <h2 className="text-primary mb-2">Notificações</h2>
        <p className="text-muted-foreground">
          Você tem {unreadCount} {unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'}
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white border rounded-lg p-5 transition-all ${
              notification.read
                ? 'border-border'
                : 'border-primary/30 bg-primary/5'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 ${
                  notification.type === 'info'
                    ? 'bg-blue-100 text-blue-600'
                    : notification.type === 'warning'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-green-100 text-green-600'
                }`}
              >
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-foreground mb-1">
                      {notification.title}
                      {!notification.read && (
                        <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full"></span>
                      )}
                    </h3>
                    <p className="text-muted-foreground mb-2">{notification.message}</p>
                    <p className="text-sm text-muted-foreground">{notification.time}</p>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <button
                        className="p-2 hover:bg-primary/10 rounded-md text-primary transition-colors"
                        title="Marcar como lida"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="p-2 hover:bg-destructive/10 rounded-md text-destructive transition-colors"
                      title="Excluir"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
