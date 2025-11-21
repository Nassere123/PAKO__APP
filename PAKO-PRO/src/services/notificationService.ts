export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: 'mission';
  timestamp: number;
};

type NotificationListener = (notification: AppNotification) => void;

const listeners = new Set<NotificationListener>();

export const notificationService = {
  subscribe: (listener: NotificationListener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  push: (notification: AppNotification) => {
    listeners.forEach((listener) => listener(notification));
  },
};
