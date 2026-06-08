import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Event {
  id: number;
  title: string;
  time: string;
  description: string;
  date: Date;
}

export function CalendarPage() {
  const { isTeacher } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events] = useState<Event[]>([
    {
      id: 1,
      title: 'Reunião de Coordenação',
      time: '09:00',
      description: 'Discussão sobre o calendário acadêmico',
      date: new Date()
    },
    {
      id: 2,
      title: 'Aula de Programação',
      time: '14:00',
      description: 'Desenvolvimento Web com React',
      date: new Date()
    }
  ]);

  const selectedDateFormatted = format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR
  });

  const filteredEvents = events.filter(
    (event) => format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-6 text-center">
        <h2 className="text-primary">Calendário</h2>
        <p className="text-muted-foreground">Visualize e gerencie seus eventos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 justify-items-center lg:justify-items-stretch">
        <div className="lg:col-span-1 w-full max-w-md lg:max-w-none">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-primary">Selecione uma Data</h3>
            </div>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="border-0"
              classNames={{
                months: 'flex flex-col',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-7 w-7 bg-transparent p-0 hover:bg-accent rounded-md',
                table: 'w-full border-collapse',
                head_row: 'flex',
                head_cell: 'text-muted-foreground rounded-md w-9 font-normal',
                row: 'flex w-full mt-2',
                cell: 'h-9 w-9 text-center p-0 relative',
                day: 'h-9 w-9 p-0 rounded-md hover:bg-accent hover:text-accent-foreground',
                day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                day_today: 'bg-accent text-accent-foreground',
                day_outside: 'text-muted-foreground opacity-50',
                day_disabled: 'text-muted-foreground opacity-50',
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-2 w-full">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-primary capitalize">{selectedDateFormatted}</h3>
                <p className="text-muted-foreground mt-1">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
                </p>
              </div>
              {isTeacher && (
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <Plus className="w-5 h-5" />
                  Novo Evento
                </button>
              )}
            </div>

            <div className="space-y-4">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-primary text-primary-foreground rounded-md">
                            {event.time}
                          </span>
                          <h4 className="text-foreground">{event.title}</h4>
                        </div>
                        <p className="text-muted-foreground ml-16">{event.description}</p>
                      </div>
                      {isTeacher && (
                        <button className="text-muted-foreground hover:text-primary">
                          •••
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Nenhum evento para esta data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
