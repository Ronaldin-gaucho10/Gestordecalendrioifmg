import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  time: string;
  description: string;
}

export function HomePage() {
  const today = new Date();
  const todayFormatted = format(today, "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR
  });

  const events: Event[] = [
    {
      id: 1,
      title: 'Reunião de Coordenação',
      time: '09:00',
      description: 'Discussão sobre o calendário acadêmico'
    },
    {
      id: 2,
      title: 'Aula de Programação',
      time: '14:00',
      description: 'Desenvolvimento Web com React'
    },
    {
      id: 3,
      title: 'Atendimento aos Alunos',
      time: '16:00',
      description: 'Horário de atendimento'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-6 text-center">
        <h2 className="text-primary mb-2">Agenda de Hoje</h2>
        <p className="text-muted-foreground capitalize">{todayFormatted}</p>
      </div>

      <div className="grid gap-4">
        {events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-border rounded-lg p-6 hover:border-primary/50 transition-colors shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-primary text-primary-foreground rounded-md">
                      {event.time}
                    </span>
                    <h3 className="text-foreground">{event.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
                <button className="text-muted-foreground hover:text-primary px-2">
                  •••
                </button>
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
    </div>
  );
}
