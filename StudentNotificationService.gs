// StudentNotificationService.gs
/**
 * @overview Gerencia o envio de notificações específicas para estudantes e suas famílias no SGTE.
 *           Utiliza as configurações de notificação do usuário e templates.
 * @module StudentNotificationService
 * @requires NotificationService.gs para o envio de notificações.
 * @requires NotificationTemplateService.gs para obter templates.
 * @requires StudentService.gs para obter dados do estudante.
 * @requires StudentFamilyService.gs para obter contatos da família.
 * @requires NotificationSettingsService.gs para obter configurações de notificação.
 * @requires Logger.gs para registro de operações.
 */

function notifyFamilyOfNonBoarding(studentId, noticeDate, routeName) {
  try {
    const student = StudentService.getStudentById(studentId);
    if (!student) {
      Logger.error(`Estudante ${studentId} não encontrado para notificação de não embarque.`);
      return false;
    }

    const familyContact = StudentFamilyService.getFamilyContactByStudentId(studentId);
    if (!familyContact || !familyContact.contactPhone) {
      Logger.error(`Contato da família não encontrado para o estudante ${studentId}.`);
      return false;
    }

    const settings = NotificationSettingsService.getNotificationSettings(student.UserID); // Assumindo que o estudante tem um UserID associado
    if (!settings || !settings.nonBoardingEmail) {
      Logger.info(`Notificação de não embarque desativada para o estudante ${studentId}.`);
      return false;
    }

    const templateData = {
      studentName: student.Name,
      noticeDate: noticeDate.toLocaleDateString(),
      routeName: routeName
    };

    const rendered = NotificationTemplateService.renderTemplate("NON_BOARDING_NOTICE", templateData);
    if (rendered) {
      return NotificationService.sendNotification("EMAIL", familyContact.contactPhone, rendered.subject, rendered.body);
    }
    return false;
  } catch (error) {
    Logger.log("Erro em notifyFamilyOfNonBoarding: " + error.message);
    throw error;
  }
}

function notifyFamilyOfRouteChange(studentId, newRouteDetails) {
  const student = StudentService.getStudentById(studentId);
  if (!student) {
    Logger.error(`Estudante ${studentId} não encontrado para notificação de mudança de rota.`);
    return false;
  }

  const familyContact = StudentFamilyService.getFamilyContactByStudentId(studentId);
  if (!familyContact || !familyContact.contactPhone) {
    Logger.error(`Contato da família não encontrado para o estudante ${studentId}.`);
    return false;
  }

  const settings = NotificationSettingsService.getNotificationSettings(student.UserID);
  if (!settings || !settings.emailEnabled) {
    Logger.info(`Notificação de mudança de rota desativada para o estudante ${studentId}.`);
    return false;
  }

  const templateData = {
    studentName: student.Name,
    newRouteDetails: newRouteDetails
  };

  const rendered = NotificationTemplateService.renderTemplate("ROUTE_CHANGE_NOTICE", templateData);
  if (rendered) {
    return NotificationService.sendNotification("EMAIL", familyContact.contactPhone, rendered.subject, rendered.body);
  }
  return false;
}
