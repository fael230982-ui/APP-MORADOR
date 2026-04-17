export function useNotifications() {
  async function registerForPushNotificationsAsync() {
    console.log('Notificacoes delegadas para o registro oficial do dispositivo.');
    return null;
  }

  return { registerForPushNotificationsAsync };
}
