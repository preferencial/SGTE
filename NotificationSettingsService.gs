// NotificationSettingsService.gs
/**
 * @overview Gerencia as configurações de notificação para usuários e famílias no SGTE.
 *           Permite personalizar como e quando as notificações são recebidas.
 * @module NotificationSettingsService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de configurações de notificação.
 */

function getNotificationSettings(userId) {
  // Buscar configurações de notificação para um usuário específico
  // Pode ser armazenado em uma planilha separada ou como parte do perfil do usuário
  const settings = DataService.getRecordById("NOTIFICATION_SETTINGS", userId);
  if (!settings) {
    // Retornar configurações padrão se não houver configurações personalizadas
    return { emailEnabled: true, smsEnabled: false, nonBoardingEmail: true };
  }
  return settings;
}

function updateNotificationSettings(userId, settingsData) {
  // Atualizar configurações de notificação para um usuário
  return DataService.updateRecord("NOTIFICATION_SETTINGS", userId, settingsData);
}

function isEmailNotificationEnabled(userId) {
  const settings = getNotificationSettings(userId);
  return settings.emailEnabled;
}

function isNonBoardingEmailEnabled(userId) {
  const settings = getNotificationSettings(userId);
  return settings.nonBoardingEmail;
}
