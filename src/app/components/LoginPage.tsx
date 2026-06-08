import { useState } from 'react';
import { UserType } from '../context/AuthContext';
import { GraduationCap, User } from 'lucide-react';
import logoIfmg from '../../imports/1000658421.jpg';

interface LoginPageProps {
  onLogin: (email: string, password: string, type: UserType) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password, userType);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-2xl">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <img src={logoIfmg} alt="IFMG Logo" className="h-32 object-contain" />
          </div>
          <h1 className="text-primary mb-2">Gestor de Calendário</h1>
          <p className="text-muted-foreground">Instituto Federal de Minas Gerais</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-3 text-foreground">
              Tipo de Usuário
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('student')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  userType === 'student'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <GraduationCap className="w-8 h-8" />
                <span>Aluno</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('teacher')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  userType === 'teacher'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <User className="w-8 h-8" />
                <span>Professor</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block mb-2 text-foreground">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="seu.email@ifmg.edu.br"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-foreground">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-primary hover:underline">
            Esqueceu sua senha?
          </a>
        </div>
      </div>
    </div>
  );
}
