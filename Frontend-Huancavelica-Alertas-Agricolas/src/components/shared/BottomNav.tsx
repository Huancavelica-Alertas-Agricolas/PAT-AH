import { Home, AlertTriangle, BarChart3, User } from 'lucide-react';
import { Button } from '../ui';

type AppSection = 'dashboard' | 'alerts' | 'reports' | 'profile';

interface BottomNavProps {
  currentSection: AppSection;
  onSectionChange: (section: AppSection) => void;
}

export const BottomNav = ({ currentSection, onSectionChange }: BottomNavProps) => {
  const navItems = [
    {
      id: 'dashboard' as const,
      icon: Home,
      label: '🏠 Inicio',
      emoji: '🏠'
    },
    {
      id: 'alerts' as const, 
      icon: AlertTriangle,
      label: '🚨 Alertas',
      emoji: '🚨'
    },
    {
      id: 'reports' as const,
      icon: BarChart3,
      label: '📊 Reportes', 
      emoji: '📊'
    },
    {
      id: 'profile' as const,
      icon: User,
      label: '⚙️ Config',
      emoji: '⚙️'
    }
  ];

  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onSectionChange(item.id)}
              className={`flex flex-col items-center space-y-1 min-h-[60px] min-w-[60px] p-2 ${
                isActive 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
              aria-label={item.label}
            >
              <span className="text-xl" role="img" aria-hidden="true">
                {item.emoji}
              </span>
              <span className="text-xs font-medium">
                {item.label.split(' ')[1]}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};