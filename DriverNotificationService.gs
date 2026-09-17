// DriverNotificationService.gs
/**
 * @overview Gerencia o envio de notificações específicas para motoristas no SGTE.
 *           Utiliza as configurações de notificação do usuário e templates.
 * @module DriverNotificationService
 * @requires NotificationService.gs para o envio de notificações.
 * @requires NotificationTemplateService.gs para obter templates.
 * @requires DriverService.gs para obter dados do motorista.
 * @requires NotificationSettingsService.gs para obter configurações de notificação.
 * @requires Logger.gs para registro de operações.
 */

function notifyDriverOfRouteUpdate(driverId, routeName, newRouteDetails) {
  const driver = DriverService.getDriverById(driverId);
  if (!driver) {
    Logger.error(`Motorista ${driverId} não encontrado para notificação de atualização de rota.`);
    return false;
  }

  const settings = NotificationSettingsService.getNotificationSettings(driver.UserID); // Assumindo que o motorista tem um UserID associado
  if (!settings || !settings.emailEnabled) {
    Logger.info(`Notificação de atualização de rota desativada para o motorista ${driverId}.`);
    return false;
  }

  const templateData = {
    driverName: driver.Name,
    routeName: routeName,
    newRouteDetails: newRouteDetails
  };

  const rendered = NotificationTemplateService.renderTemplate("DRIVER_ROUTE_UPDATE", templateData);
  if (rendered) {
    return NotificationService.sendNotification("EMAIL", driver.ContactPhone, rendered.subject, rendered.body);
  }
  return false;
}

function notifyDriverOfScheduleChange(driverId, scheduleDetails) {
  const driver = DriverService.getDriverById(driverId);
  if (!driver) {
    Logger.error(`Motorista ${driverId} não encontrado para notificação de mudança de horário.`);
    return false;
  }

  const settings = NotificationSettingsService.getNotificationSettings(driver.UserID);
  if (!settings || !settings.emailEnabled) {
    Logger.info(`Notificação de mudança de horário desativada para o motorista ${driverId}.`);
    return false;
  }

  const templateData = {
    driverName: driver.Name,
    scheduleDetails: scheduleDetails
  };

  const rendered = NotificationTemplateService.renderTemplate("DRIVER_SCHEDULE_CHANGE", templateData);
  if (rendered) {
    return NotificationService.sendNotification("EMAIL", driver.ContactPhone, rendered.subject, rendered.body);
  }
  return false;
}
