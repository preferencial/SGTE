// AdminNotificationService.gs
/**
 * @overview Gerencia o envio de notificações específicas para administradores do sistema SGTE.
 *           Utiliza as configurações de notificação do usuário e templates.
 * @module AdminNotificationService
 * @requires NotificationService.gs para o envio de notificações.
 * @requires NotificationTemplateService.gs para obter templates.
 * @requires UserService.gs para obter dados de administradores.
 * @requires NotificationSettingsService.gs para obter configurações de notificação.
 * @requires Logger.gs para registro de operações.
 */

function notifyAdminOfSystemError(errorMessage, context) {
  try {
    const admins = UserService.getAllUsers().filter(user => user.Role === "Admin");
    admins.forEach(admin => {
      const settings = NotificationSettingsService.getNotificationSettings(admin.ID);
      if (settings && settings.emailEnabled) {
        const templateData = {
          errorMessage: errorMessage,
          context: context
        };
        const rendered = NotificationTemplateService.renderTemplate("ADMIN_SYSTEM_ERROR", templateData);
        if (rendered) {
          NotificationService.sendNotification("EMAIL", admin.Username, rendered.subject, rendered.body); // Assumindo que o username é o email
        }
      }
    });
    Logger.error(`Notificação de erro do sistema enviada para administradores: ${errorMessage}`, context);
  } catch (error) {
    Logger.log("Erro em notifyAdminOfSystemError: " + error.message);
    throw error;
  }
}

function notifyAdminOfPendingTransportRequest(requestId) {
  try {
    const admins = UserService.getAllUsers().filter(user => user.Role === "Admin");
    admins.forEach(admin => {
      const settings = NotificationSettingsService.getNotificationSettings(admin.ID);
      if (settings && settings.emailEnabled) {
        const templateData = {
          requestId: requestId
        };
        const rendered = NotificationTemplateService.renderTemplate("ADMIN_PENDING_TRANSPORT_REQUEST", templateData);
        if (rendered) {
          NotificationService.sendNotification("EMAIL", admin.Username, rendered.subject, rendered.body);
        }
      }
    });
    Logger.info(`Notificação de solicitação de transporte pendente enviada para administradores: ${requestId}`);
  } catch (error) {
    Logger.log("Erro em notifyAdminOfPendingTransportRequest: " + error.message);
    throw error;
  }
}
