// SystemStatusService.gs
/**
 * @overview Monitora e gerencia o status geral do sistema SGTE, incluindo a saúde dos serviços integrados e a disponibilidade da planilha.
 * @module SystemStatusService
 * @requires ConfigService.gs para obter o ID da planilha.
 * @requires Logger.gs para registro de operações.
 */

function checkSpreadsheetAvailability() {
  try {
    const spreadsheet = SpreadsheetApp.openById(ConfigService.getSpreadsheetId());
    if (spreadsheet) {
      Logger.info("Planilha principal está disponível.", "SystemStatus");
      return { status: "OK", message: "Planilha principal acessível." };
    }
  } catch (e) {
    Logger.error(`Erro ao acessar a planilha principal: ${e.message}`, "SystemStatus");
    return { status: "ERROR", message: `Falha ao acessar a planilha principal: ${e.message}` };
  }
  return { status: "ERROR", message: "Planilha principal não encontrada ou inacessível." };
}

function checkColabIntegrationStatus() {
  const colabUrl = ConfigService.getConfig("COLAB_NOTEBOOK_URL");
  if (!colabUrl || !/^https:\/\//i.test(String(colabUrl))) {
    return { status: "WARNING", message: "URL do Colab não configurada." };
  }
  return { status: "OK", message: "Integração com Colab configurada; o endpoint será validado ao processar um job." };
}

function getOverallSystemStatus() {
  try {
    const statusChecks = [
      checkSpreadsheetAvailability(),
      checkColabIntegrationStatus(),
      // Adicionar outras verificações de serviço aqui (e.g., Gemini API, EmailService)
    ];

    const overallStatus = statusChecks.every(check => check.status === "OK") ? "OK" : "WARNING";
    const messages = statusChecks.map(check => `${check.status}: ${check.message}`);

    return { overallStatus: overallStatus, details: messages };
  } catch (error) {
    Logger.log("Erro em getOverallSystemStatus: " + error.message);
    throw error;
  }
}
