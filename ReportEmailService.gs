// ReportEmailService.gs
/**
 * @overview Serviço específico para o envio de relatórios por e-mail no SGTE.
 *           Utiliza templates e configurações específicas para relatórios.
 * @module ReportEmailService
 * @requires EmailService.gs para o envio de e-mails.
 * @requires NotificationTemplateService.gs para obter templates de e-mail.
 * @requires Logger.gs para registro de operações.
 */

function sendReportByEmail(recipient, reportName, reportData) {
  try {
    const template = NotificationTemplateService.getTemplate("REPORT_EMAIL");
    if (!template) {
      Logger.error("Template de e-mail para relatório não encontrado.");
      return false;
    }

    const rendered = NotificationTemplateService.renderTemplate("REPORT_EMAIL", {
      reportName: reportName,
      reportSummary: reportData.summary,
      // Adicionar outros campos do relatório que podem ser usados no template
    });

    if (rendered) {
      return EmailService.sendEmail(recipient, rendered.subject, rendered.body);
    }
    return false;
  } catch (e) {
    Logger.error(`Erro ao enviar relatório por e-mail para ${recipient}: ${e.message}`);
    return false;
  }
}
