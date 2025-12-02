// Comentarios añadidos en español: hook `useSubscriptions` para suscripciones GraphQL en tiempo real.
// Cómo lo logra: instala listeners a `subscriptions` y actualiza cache/estado cuando llegan eventos.
import { useEffect } from 'react';
import { useSubscription } from '@apollo/client/react';
import { ALERT_SUBSCRIPTION, NOTIFICATION_SUBSCRIPTION } from '../graphql/subscriptions';
import { toast } from 'sonner';

// Tipos para las subscripciones
interface Alert {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  zone?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: string;
  userId: string;
}

interface AlertSubscriptionData {
  onNewAlert: Alert;
}

interface NotificationSubscriptionData {
  onNotification: Notification;
}

/**
 * Hook para escuchar alertas en tiempo real
 * @param zone - Zona a filtrar (opcional)
 * @param onAlertReceived - Callback cuando llega una nueva alerta
 */
export function useAlertSubscription(
  zone?: string,
  onAlertReceived?: (_alert: Alert) => void
) {
  const { data, loading, error } = useSubscription<AlertSubscriptionData>(ALERT_SUBSCRIPTION, {
    variables: { zone },
    shouldResubscribe: true,
  });

  useEffect(() => {
    if (data?.onNewAlert) {
      const _alert = data.onNewAlert;

      // Mostrar notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(`⚠️ ${_alert.title}`, {
          body: _alert.description,
          icon: `/icons/${_alert.type}.png`,
          tag: _alert.id,
          requireInteraction: _alert.severity === 'alta',
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Vibración en dispositivos móviles
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      }

      // Reproducir sonido según severidad
      if (_alert.severity === 'alta' || _alert.severity === 'crítica') {
        const audio = new Audio('/sounds/alert-high.mp3');
        audio.play().catch(console.error);
      }

      // Toast notification
      toast.error(`Nueva alerta: ${_alert.title}`, {
        description: _alert.description,
        duration: 10000,
      });

      // Callback personalizado
      if (onAlertReceived) {
        onAlertReceived(_alert);
      }
    }
  }, [data, onAlertReceived]);

  return {
    alert: data?.onNewAlert,
    loading,
    error,
  };
}

/**
 * Hook para escuchar notificaciones en tiempo real
 * @param userId - ID del usuario
 * @param onNotificationReceived - Callback cuando llega una notificación
 */
export function useNotificationSubscription(
  userId: string,
  onNotificationReceived?: (_notification: Notification) => void
) {
  const { data, loading, error } = useSubscription<NotificationSubscriptionData>(NOTIFICATION_SUBSCRIPTION, {
    variables: { userId },
    shouldResubscribe: true,
  });

  useEffect(() => {
    if (data?.onNotification) {
      const _notification = data.onNotification;

      // Mostrar notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        const browserNotif = new Notification(_notification.title, {
          body: _notification.message,
          icon: '/icons/notification.png',
          tag: _notification.id,
          badge: '/icons/badge.png',
        });

        browserNotif.onclick = () => {
          window.focus();
          browserNotif.close();
        };
      }

      // Toast notification
      const toastType =
        _notification.priority === 'alta'
          ? toast.error
          : _notification.priority === 'media'
          ? toast.warning
          : toast.info;

      toastType(_notification.title, {
        description: _notification.message,
        duration: 5000,
      });

      // Callback personalizado
      if (onNotificationReceived) {
        onNotificationReceived(_notification);
      }
    }
  }, [data, onNotificationReceived]);

  return {
    notification: data?.onNotification,
    loading,
    error,
  };
}

/**
 * Hook para solicitar permisos de notificaciones del navegador
 */
export function useRequestNotificationPermission() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          toast.success('Notificaciones habilitadas');
        }
      });
    }
  }, []);
}
