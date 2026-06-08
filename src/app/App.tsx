import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { CalendarView } from './components/CalendarView';

function AppContent() {
  const { user, login, logout } = useAuth();

  return (
    <div className="size-full">
      {user ? (
        <CalendarView onLogout={logout} />
      ) : (
        <LoginPage onLogin={login} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}