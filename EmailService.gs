// EmailService.gs
/**
 * @overview Envia notificações por e-mail para usuários (famílias, transportadores, administradores) sobre avisos de não embarque, atualizações de rota ou relatórios no SGTE.
 * @module EmailService
 * @requires MailApp (serviço nativo do Apps Script).
 * @requires Logger.gs para registro de operações.
 */

function sendEmail(recipient, subject, body) {
  try {
    MailApp.sendEmail(recipient, subject, body);
    LoggerService.info('E-mail enviado. Metadados: destinatarios=1, assuntoChars=' +
      String(subject || '').length + '.');
    return true;
  } catch (e) {
    Logger.error(`Erro ao enviar e-mail para ${recipient}: ${e.message}`);
    return false;
  }
}

function sendNonBoardingNotification(studentName, familyEmail, noticeDate, routeName) {
  const subject = `Aviso de Não Embarque - ${studentName}`;
  const body = `Prezada família,

Informamos que o estudante ${studentName} não embarcará no transporte escolar na data ${noticeDate.toLocaleDateString()}.

Rota afetada: ${routeName}

Atenciosamente,
Equipe SGTE`;
  
  return sendEmail(familyEmail, subject, body);
}

function sendRouteUpdateNotification(routeName, driverEmail, newRouteDetails) {
  const subject = `Atualização de Rota - ${routeName}`;
  const body = `Prezado motorista,

Informamos que a rota ${routeName} foi atualizada. Por favor, verifique os novos detalhes da rota:

${newRouteDetails}

Atenciosamente,
Equipe SGTE`;

  return sendEmail(driverEmail, subject, body);
}
