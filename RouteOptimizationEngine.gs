// RouteOptimizationEngine.gs
/**
 * @overview Este serviço atua como a interface principal para o motor de otimização de rotas no SGTE.
 *           Ele prepara os dados para o Google Colab e processa os resultados da otimização.
 * @module RouteOptimizationEngine
 * @requires StudentService.gs para obter dados de estudantes.
 * @requires RouteService.gs para obter dados de rotas.
 * @requires StopPointService.gs para obter dados de pontos de parada.
 * @requires ColabIntegrationService.gs para interagir com o Google Colab.
 * @requires OptimizationResultService.gs para salvar os resultados.
 * @requires Logger.gs para registro de operações.
 */

function optimizeRoute(routeId, studentsToExclude = [], optimizationType) {
  try {
    Logger.info(`Iniciando otimização para a rota ${routeId} com tipo ${optimizationType}.`);

    const route = RouteService.getRouteById(routeId);
    if (!route) {
      Logger.error(`Rota ${routeId} não encontrada para otimização.`);
      return { success: false, message: "Rota não encontrada." };
    }

    let studentsOnRoute = StudentService.getStudentsByRoute(routeId);
    // Excluir estudantes que não embarcarão
    studentsOnRoute = studentsOnRoute.filter(student => !studentsToExclude.includes(student.ID));

    const stopPoints = StopPointService.getStopPointsByRoute(routeId);

    const payload = {
      routeId: routeId,
      optimizationType: optimizationType,
      students: studentsOnRoute.map(s => ({ id: s.ID, lat: s.Latitude, lng: s.Longitude, accessibility: s.AccessibilityNeeds })),
      stopPoints: stopPoints.map(sp => ({ id: sp.ID, lat: sp.Latitude, lng: sp.Longitude, order: sp.Order })),
      vehicleCapacity: route.Capacity,
      // Adicionar outros parâmetros relevantes para o algoritmo de otimização
    };

    // Enfileirar o job de otimização para o Colab
    const jobId = JobQueueService.enqueueJob("ROUTE_OPTIMIZATION", payload);
    Logger.info(`Job de otimização para rota ${routeId} enfileirado com JobID: ${jobId}.`);

    return { success: true, jobId: jobId };
  } catch (error) {
    Logger.log("Erro em optimizeRoute: " + error.message);
    throw error;
  }
}

function processOptimizationCallback(jobId, resultData) {
  Logger.info(`Processando callback de otimização para JobID ${jobId}.`);
  OptimizationResultService.saveOptimizationResult(jobId, resultData.routeId, resultData);
  // Atualizar a rota no RouteService com os novos dados otimizados
  RouteService.updateRoute(resultData.routeId, {
    Distance: resultData.optimizedDistance,
    Duration: resultData.optimizedDuration,
    // Atualizar pontos de parada, se o Colab retornar uma nova sequência
  });
  Logger.info(`Rota ${resultData.routeId} atualizada com resultados da otimização.`);
}
