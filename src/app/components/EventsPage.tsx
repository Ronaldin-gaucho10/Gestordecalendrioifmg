import { Calendar, MapPin, Plus, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  description: string;
  category: 'meeting' | 'class' | 'event';
}

export function EventsPage() {
  const { isTeacher } = useAuth();
  const events: Event[] = [
    {
      id: 1,
      title: 'Reunião de Coordenação',
      date: '14 de Maio, 2026',
      time: '09:00 - 11:00',
      location: 'Sala de Reuniões 101',
      participants: 12,
      description: 'Discussão sobre o calendário acadêmico do próximo semestre',
      category: 'meeting'
    },
    {
      id: 2,
      title: 'Aula de Programação Web',
      date: '14 de Maio, 2026',
      time: '14:00 - 16:00',
      location: 'Laboratório de Informática 3',
      participants: 35,
      description: 'Desenvolvimento Web com React e TypeScript',
      category: 'class'
    },
    {
      id: 3,
      title: 'Semana de Tecnologia IFMG',
      date: '20 de Maio, 2026',
      time: '08:00 - 18:00',
      location: 'Auditório Principal',
      participants: 200,
      description: 'Evento anual com palestras, workshops e apresentações de projetos',
      category: 'event'
    },
    {
      id: 4,
      title: 'Atendimento aos Alunos',
      date: '14 de Maio, 2026',
      time: '16:00 - 18:00',
      location: 'Gabinete 205',
      participants: 8,
      description: 'Horário de atendimento individual aos alunos',
      category: 'meeting'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meeting':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'class':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'event':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'meeting':
        return 'Reunião';
      case 'class':
        return 'Aula';
      case 'event':
        return 'Evento';
      default:
        return 'Outro';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-primary mb-2">Eventos</h2>
          <p className="text-muted-foreground">
            {isTeacher ? 'Todos os eventos agendados' : 'Eventos da sua turma'}
          </p>
        </div>
        {isTeacher && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-5 h-5" />
            Criar Evento
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white border border-border rounded-lg p-6 hover:border-primary/50 transition-all shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`px-3 py-1 rounded-md border ${getCategoryColor(
                      event.category
                    )}`}
                  >
                    {getCategoryLabel(event.category)}
                  </span>
                  <h3 className="text-foreground">{event.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{event.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{event.participants} participantes</span>
                  </div>
                </div>
              </div>
              {isTeacher && (
                <button className="text-muted-foreground hover:text-primary px-2">
                  •••
                </button>
              )}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                {event.time}
              </span>
              <div className="flex gap-2">
                {isTeacher && (
                  <button className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
                    Editar
                  </button>
                )}
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
