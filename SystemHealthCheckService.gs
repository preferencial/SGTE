// SystemHealthCheckService.gs
/**
 * @overview Realiza verificações de saúde abrangentes no sistema SGTE para garantir que todos os componentes essenciais estejam operacionais.
 *           Pode ser usado para diagnósticos e alertas proativos.
 * @module SystemHealthCheckService
 * @requires SystemStatusService.gs para verificações de status de componentes.
 * @requires Logger.gs para registro de operações.
 * @requires NotificationService.gs para enviar alertas.
 */

function performFullHealthCheck() {
  try {
    Logger.info("Iniciando verificação completa de saúde do sistema.");
    const overallStatus = SystemStatusService.getOverallSystemStatus();

    if (overallStatus.overallStatus === "ERROR") {
      const errorMessage = `Erro crítico no sistema SGTE: ${overallStatus.details.join("; ")}`;
      Logger.error(errorMessage, "SystemHealthCheck");
      // Notificar administradores sobre o erro crítico
      AdminNotificationService.notifyAdminOfSystemError(errorMessage, "Full System Health Check");
    } else if (overallStatus.overallStatus === "WARNING") {
      const warningMessage = `Avisos no sistema SGTE: ${overallStatus.details.join("; ")}`;
      Logger.warn(warningMessage, "SystemHealthCheck");
      // Notificar administradores sobre os avisos
      AdminNotificationService.notifyAdminOfSystemError(warningMessage, "Full System Health Check");
    } else {
      Logger.info("Sistema SGTE operando normalmente.", "SystemHealthCheck");
    }
    return overallStatus;
  } catch (error) {
    Logger.log("Erro em performFullHealthCheck: " + error.message);
    throw error;
  }
}

function checkExternalAPIs() {
  // Implementar verificações de APIs externas (Google Maps, Gemini, etc.)
  // Exemplo: tentar fazer uma chamada simples à API Gemini
  try {
    const testPrompt = "Hello";
    const testResponse = GeminiIntegrationService.generateSavingsSummary({ month: 1, year: 2023, totalTimeSaved: 0, totalFuelSaved: 0 }); // Chamada de teste
    if (testResponse && typeof testResponse === "string" && testResponse.length > 0) {
      Logger.info("API Gemini acessível.", "SystemHealthCheck");
      return { status: "OK", message: "API Gemini acessível." };
    } else {
      throw new Error("Resposta inválida da API Gemini.");
    }
  } catch (e) {
    Logger.error(`Falha ao acessar a API Gemini: ${e.message}`, "SystemHealthCheck");
    return { status: "ERROR", message: `Falha ao acessar a API Gemini: ${e.message}` };
  }
}
