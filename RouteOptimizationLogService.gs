// RouteOptimizationLogService.gs
/**
 * @overview Gerencia os logs detalhados de cada execução do motor de otimização de rotas no SGTE.
 *           Registra os parâmetros de entrada, saída, erros e duração de cada otimização.
 * @module RouteOptimizationLogService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de log de otimização.
 */

function logOptimizationExecution(jobId, status, inputPayload, outputResult = null, errorMessage = null, durationMs = null) {
  try {
    const logEntry = {
      JobID: jobId,
      Timestamp: new Date(),
      Status: status,
      InputPayload: JSON.stringify(inputPayload),
      OutputResult: outputResult ? JSON.stringify(outputResult) : "",
      ErrorMessage: errorMessage || "",
      DurationMs: durationMs
    };
    return DataService.createRecord("OPTIMIZATION_LOGS", logEntry);
  } catch (error) {
    Logger.log("Erro em logOptimizationExecution: " + error.message);
    throw error;
  }
}

function getOptimizationLogsByJobId(jobId) {
  const allLogs = DataService.getAllRecords("OPTIMIZATION_LOGS");
  const normalizedJobId = String(jobId == null ? '' : jobId).trim();
  return allLogs.filter(log => String(log.JobID == null ? '' : log.JobID).trim() === normalizedJobId).sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
}

function getFailedOptimizations(limit = 50) {
  const allLogs = DataService.getAllRecords("OPTIMIZATION_LOGS");
  return allLogs.filter(log => log.Status === "FAILED").sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp)).slice(0, limit);
}
