// RouteOptimizationReportService.gs
/**
 * @overview Gera relatórios detalhados sobre as otimizações de rota realizadas no SGTE.
 *           Inclui comparações entre rotas originais e otimizadas, e métricas de economia.
 * @module RouteOptimizationReportService
 * @requires OptimizationResultService.gs para obter resultados de otimização.
 * @requires ReportGenerator.gs para formatar os relatórios.
 * @requires Logger.gs para registro de operações.
 */

function generateOptimizationComparisonReport(jobId) {
  const result = OptimizationResultService.getOptimizationResultByJobId(jobId);
  if (!result) {
    Logger.error(`Resultado de otimização para JobID ${jobId} não encontrado.`);
    return null;
  }

  const reportData = {
    jobId: result.JobID,
    routeId: result.RouteID,
    originalDuration: result.OriginalDuration,
    optimizedDuration: result.OptimizedDuration,
    originalDistance: result.OriginalDistance,
    optimizedDistance: result.OptimizedDistance,
    timeSaved: result.TimeSaved,
    fuelSaved: result.FuelSaved,
    optimizationDate: result.OptimizationDate
  };

  const formattedReport = ReportGenerator.formatOptimizationComparison(reportData);
  return formattedReport;
}

function getOptimizationSummaryForRoute(routeId) {
  try {
    const results = OptimizationResultService.getOptimizationResultsByRouteId(routeId);
    let totalTimeSaved = 0;
    let totalFuelSaved = 0;
    results.forEach(r => {
      totalTimeSaved += r.TimeSaved || 0;
      totalFuelSaved += r.FuelSaved || 0;
    });
    return {
      routeId: routeId,
      totalOptimizations: results.length,
      totalTimeSaved: totalTimeSaved,
      totalFuelSaved: totalFuelSaved
    };
  } catch (error) {
    Logger.log("Erro em getOptimizationSummaryForRoute: " + error.message);
    throw error;
  }
}
