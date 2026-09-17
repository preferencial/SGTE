// NotificationService.gs
/**
 * @overview Gerencia o envio de notificações para os usuários do SGTE, podendo ser por e-mail, ou outras formas futuras.
 *           Abstrai a lógica de envio para diferentes canais.
 * @module NotificationService
 * @requires EmailService.gs para envio de e-mails.
 * @requires Logger.gs para registro de operações.
 */

function sendNotification(type, recipient, subject, body, options = {}) {
  switch (type) {
    case "EMAIL":
      return EmailService.sendEmail(recipient, subject, body);
    // Adicionar outros tipos de notificação aqui (SMS, Push, etc.)
    default:
      Logger.warn(`Tipo de notificação desconhecido: ${type}`);
      return false;
  }
}

function notifyFamilyOfNonBoarding(studentName, familyEmail, noticeDate, routeName) {
  try {
    const subject = `Aviso de Não Embarque - ${studentName}`;
    const body = `Prezada família,

  Informamos que o estudante ${studentName} não embarcará no transporte escolar na data ${noticeDate.toLocaleDateString()}.

  Rota afetada: ${routeName}

  Atenciosamente,
  Equipe SGTE`;
    return sendNotification("EMAIL", familyEmail, subject, body);
  } catch (error) {
    Logger.log("Erro em notifyFamilyOfNonBoarding: " + error.message);
    throw error;
  }
}

function notifyDriverOfRouteUpdate(routeName, driverEmail, newRouteDetails) {
  const subject = `Atualização de Rota - ${routeName}`;
  const body = `Prezado motorista,

Informamos que a rota ${routeName} foi atualizada. Por favor, verifique os novos detalhes da rota:

${newRouteDetails}

Atenciosamente,
Equipe SGTE`;
  return sendNotification("EMAIL", driverEmail, subject, body);
}
