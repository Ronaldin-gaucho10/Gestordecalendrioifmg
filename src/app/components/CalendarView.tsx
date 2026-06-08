import { useState } from 'react';
import { Home, Calendar, Bell, CalendarDays, LogOut, User } from 'lucide-react';
import { HomePage } from './HomePage';
import { CalendarPage } from './CalendarPage';
import { NotificationsPage } from './NotificationsPage';
import { EventsPage } from './EventsPage';
import { useAuth } from '../context/AuthContext';
import logoIfmg from '../../imports/1000658421.jpg';

interface CalendarViewProps {
  onLogout: () => void;
}

type PageType = 'home' | 'calendar' | 'notifications' | 'events';

export function CalendarView({ onLogout }: CalendarViewProps) {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const { user, isTeacher } = useAuth();

  const menuItems = [
    { id: 'home' as PageType, label: 'HOME', icon: Home },
    { id: 'calendar' as PageType, label: 'Calendário', icon: Calendar },
    { id: 'notifications' as PageType, label: 'Notificações', icon: Bell },
    { id: 'events' as PageType, label: 'Eventos', icon: CalendarDays },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'calendar':
        return <CalendarPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'events':
        return <EventsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoIfmg} alt="IFMG Logo" className="h-12 object-contain bg-white rounded px-2" />
              <div>
                <h1 className="text-xl">Gestor de Calendário</h1>
                <p className="text-sm text-primary-foreground/80">Instituto Federal de Minas Gerais</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                <User className="w-4 h-4" />
                <div className="text-sm">
                  <div>{user?.name}</div>
                  <div className="text-xs text-primary-foreground/70">
                    {isTeacher ? 'Professor' : 'Aluno'}
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all ${
                    isActive
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="w-full py-8 flex justify-center">
        <div className="w-full">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
