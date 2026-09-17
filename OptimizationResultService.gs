// OptimizationResultService.gs
/**
 * @overview Armazena e gerencia os resultados das otimizações de rota recebidos do Google Colab no SGTE.
 *           Inclui as rotas recalculadas, tempos de viagem e outras métricas.
 * @module OptimizationResultService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de resultados de otimização.
 */

function saveOptimizationResult(jobId, routeId, resultData) {
  const record = {
    ResultID: Utilities.getUuid(),
    JobID: jobId,
    RouteID: routeId,
    OriginalDuration: resultData.originalDuration,
    OptimizedDuration: resultData.optimizedDuration,
    OriginalDistance: resultData.originalDistance,
    OptimizedDistance: resultData.optimizedDistance,
    FuelSaved: resultData.fuelSaved,
    TimeSaved: resultData.timeSaved,
    OptimizationDate: new Date()
  };
  const savedRecord = createRecord("OPTIMIZATION_RESULTS", record);
  info(`Resultado de otimização salvo para o JobID ${jobId} e RouteID ${routeId}`);
  return savedRecord;
}

function getOptimizationResultByJobId(jobId) {
  try {
    const allResults = getAllRecords("OPTIMIZATION_RESULTS");
    const normalizedJobId = String(jobId == null ? '' : jobId).trim();
    return allResults.find(result => String(result.JobID == null ? '' : result.JobID).trim() === normalizedJobId);
  } catch (error) {
    Logger.log("Erro em getOptimizationResultByJobId: " + error.message);
    throw error;
  }
}

function getOptimizationResultsByRouteId(routeId) {
  try {
    const allResults = getAllRecords("OPTIMIZATION_RESULTS");
    const normalizedRouteId = String(routeId == null ? '' : routeId).trim();
    return allResults.filter(result => String(result.RouteID == null ? '' : result.RouteID).trim() === normalizedRouteId);
  } catch (error) {
    Logger.log("Erro em getOptimizationResultsByRouteId: " + error.message);
    throw error;
  }
}

function getOptimizationResultsByMonth(month, year) {
  try {
    const allResults = getAllRecords("OPTIMIZATION_RESULTS");
    return allResults.filter(result => {
      const optDate = new Date(result.OptimizationDate);
      return optDate.getMonth() + 1 === month && optDate.getFullYear() === year;
    });
  } catch (error) {
    Logger.log("Erro em getOptimizationResultsByMonth: " + error.message);
    throw error;
  }
}
