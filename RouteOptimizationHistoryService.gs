// RouteOptimizationHistoryService.gs
/**
 * @overview Gerencia o histórico de todas as otimizações de rota realizadas no SGTE, incluindo os parâmetros de entrada e os resultados detalhados.
 * @module RouteOptimizationHistoryService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de histórico de otimização.
 */

function logOptimizationRun(jobId, routeId, optimizationType, inputPayload, outputResult) {
  try {
    const historyEntry = {
      JobID: jobId,
      RouteID: routeId,
      OptimizationType: optimizationType,
      InputPayload: JSON.stringify(inputPayload),
      OutputResult: JSON.stringify(outputResult),
      Timestamp: new Date()
    };
    return DataService.createRecord("ROUTE_OPTIMIZATION_HISTORY", historyEntry);
  } catch (error) {
    Logger.log("Erro em logOptimizationRun: " + error.message);
    throw error;
  }
}

function getOptimizationHistoryByRoute(routeId) {
  const allHistory = DataService.getAllRecords("ROUTE_OPTIMIZATION_HISTORY");
  const normalizedRouteId = String(routeId == null ? '' : routeId).trim();
  return allHistory.filter(entry => String(entry.RouteID == null ? '' : entry.RouteID).trim() === normalizedRouteId).sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
}

function getOptimizationHistoryByJob(jobId) {
  const allHistory = DataService.getAllRecords("ROUTE_OPTIMIZATION_HISTORY");
  const normalizedJobId = String(jobId == null ? '' : jobId).trim();
  return allHistory.find(entry => String(entry.JobID == null ? '' : entry.JobID).trim() === normalizedJobId);
}
