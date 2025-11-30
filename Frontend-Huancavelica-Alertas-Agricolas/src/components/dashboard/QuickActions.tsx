import { AlertTriangle, Sprout, Lightbulb, BarChart3 } from 'lucide-react';
import { Button, Card, CardContent } from '../ui';
import { useLanguage } from '../../context/LanguageContext';

interface QuickActionsProps {
  onNavigate: (section: 'alerts' | 'crops' | 'recommendations' | 'reports') => void;
}

export const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  const { language } = useLanguage();
  const actions = [
    {
      id: 'alerts' as const,
      icon: AlertTriangle,
      emoji: '🚨',
      title:
        language === 'qu' ? 'Kallpachaykuna' :
        language === 'en' ? 'Alerts' :
        'Alertas',
      description:
        language === 'qu' ? 'Tukuy kallpachaykuna rikuy' :
        language === 'en' ? 'View all alerts' :
        'Ver todas las alertas',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100'
    },
    {
      id: 'crops' as const,
      icon: Sprout,
      emoji: '🌾',
      title:
        language === 'qu' ? 'Sallqa kawsaykuna' :
        language === 'en' ? 'Crops' :
        'Cultivos',
      description:
        language === 'qu' ? 'Sallqa kawsaykuna kamachiy' :
        language === 'en' ? 'Manage crops' :
        'Gestionar cultivos',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100'
    },
    {
      id: 'recommendations' as const,
      icon: Lightbulb,
      emoji: '💡',
      title:
        language === 'qu' ? 'Kamachikuykuna' :
        language === 'en' ? 'Recommendations' :
        'Recomendaciones',
      description:
        language === 'qu' ? 'Kamachikuykuna personal' :
        language === 'en' ? 'Personalized advice' :
        'Consejos personalizados',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      hoverColor: 'hover:bg-yellow-100'
    },
    {
      id: 'reports' as const,
      icon: BarChart3,
      emoji: '📊',
      title:
        language === 'qu' ? 'Willakuykuna' :
        language === 'en' ? 'Reports' :
        'Reportes',
      description:
        language === 'qu' ? 'Analisis, qillqaykuna' :
        language === 'en' ? 'Analysis and charts' :
        'Análisis y gráficos',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium mb-4">
          {language === 'qu' ? 'Ruraqkunapa ruraqkuna' : language === 'en' ? 'Quick Actions' : 'Acciones Rápidas'}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => {
            return (
              <Button
                key={action.id}
                variant="ghost"
                className={`h-auto p-6 flex flex-col items-center space-y-3 min-h-[100px] ${action.bgColor} ${action.hoverColor} border border-gray-200 rounded-xl touch-friendly`}
                onClick={() => {
                  onNavigate(action.id);
                }}
              >
                <div className="text-3xl" role="img" aria-hidden="true">
                  {action.emoji}
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900 text-base">{action.title}</p>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};