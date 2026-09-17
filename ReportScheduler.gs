// ReportScheduler.gs
/**
 * @overview Gerencia o agendamento e a execução automática de relatórios no SGTE.
 *           Permite configurar relatórios para serem gerados e enviados periodicamente.
 * @module ReportScheduler
 * @requires ScriptApp (serviço nativo do Apps Script).
 * @requires ReportService.gs para gerar os relatórios.
 * @requires NotificationService.gs para enviar os relatórios.
 * @requires Logger.gs para registro de operações.
 */

function createMonthlyReportTrigger() {
  try {
    // Cria um gatilho mensal para gerar e enviar o relatório de economia
    ScriptApp.newTrigger("ReportScheduler.generateAndSendMonthlyReport")
        .timeBased()
        .onMonthDay(1) // Primeiro dia do mês
        .atHour(3) // Exemplo: executa às 3 da manhã
        .create();
    LoggerService.info("Gatilho mensal para relatório criado.");
  } catch (error) {
    Logger.log("Erro em createMonthlyReportTrigger: " + error.message);
    throw error;
  }
}

function generateAndSendMonthlyReport() {
  const today = new Date();
  const month = today.getMonth(); // Mês atual (0-11)
  const year = today.getFullYear();

  // Gerar relatório para o mês anterior
  const targetMonth = month === 0 ? 12 : month;
  const targetYear = month === 0 ? year - 1 : year;

  Logger.info(`Gerando e enviando relatório mensal para ${targetMonth}/${targetYear}.`);
  const report = ReportService.generateMonthlySavingsReport(targetMonth, targetYear);

  const recipient = ConfigurationManager.getSystemSetting("REPORT_EMAIL_RECIPIENT");
  if (recipient) {
    const subject = `Relatório Mensal de Economia SGTE - ${targetMonth}/${targetYear}`;
    const body = `Prezado(a) administrador(a),

Segue o relatório mensal de economia do SGTE para o período de ${targetMonth}/${targetYear}.

Sumário:
${report.summary}

Detalhes adicionais podem ser encontrados no sistema.

Atenciosamente,
Sistema SGTE`;
    NotificationService.sendNotification("EMAIL", recipient, subject, body);
    Logger.info(`Relatório mensal enviado para ${recipient}.`);
  } else {
    Logger.warn("Destinatário do relatório mensal não configurado.");
  }
}

function setupReportTriggers() {
  createMonthlyReportTrigger();
}
