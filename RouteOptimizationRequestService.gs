// RouteOptimizationRequestService.gs
/**
 * @overview Gerencia as requisições de otimização de rota, encapsulando a lógica de preparação dos dados para o Colab.
 * @module RouteOptimizationRequestService
 * @requires StudentService.gs para obter dados de estudantes.
 * @requires RouteService.gs para obter dados de rotas.
 * @requires StopPointService.gs para obter dados de pontos de parada.
 * @requires JobQueueService.gs para enfileirar a requisição de otimização.
 * @requires Logger.gs para registro de operações.
 */

function prepareAndEnqueueOptimizationRequest(studentId, noticeDate, isNotified) {
  try {
    const student = StudentService.getStudentById(studentId);
    if (!student || !student.RouteID) {
      Logger.error(`Erro: Estudante ${studentId} não encontrado ou sem rota associada para otimização.`);
      return { success: false, message: "Estudante não encontrado ou sem rota." };
    }

    const route = RouteService.getRouteById(student.RouteID);
    if (!route) {
      Logger.error(`Erro: Rota ${student.RouteID} não encontrada para otimização.`);
      return { success: false, message: "Rota não encontrada." };
    }

    let optimizationType;
    if (isNotified) {
      optimizationType = "RECALCULATE_BOTH_WAYS"; // Recalcular ida e volta
    } else {
      optimizationType = "RECALCULATE_RETURN_ONLY"; // Recalcular apenas a volta
    }

    const payload = {
      studentId: studentId,
      routeId: route.ID,
      noticeDate: noticeDate.toISOString(),
      optimizationType: optimizationType,
      studentsOnRoute: StudentService.getStudentsByRoute(route.ID).map(s => ({ id: s.ID, lat: s.Latitude, lng: s.Longitude })),
      routeDetails: { id: route.ID, name: route.RouteName, capacity: route.Capacity },
      stopPoints: StopPointService.getStopPointsByRoute(route.ID).map(sp => ({ id: sp.ID, lat: sp.Latitude, lng: sp.Longitude, order: sp.Order }))
    };

    const jobId = JobQueueService.enqueueJob("ROUTE_OPTIMIZATION", payload);
    Logger.info(`Requisição de otimização para rota ${route.ID} enfileirada com JobID: ${jobId}`);
    return { success: true, jobId: jobId };
  } catch (error) {
    Logger.log("Erro em prepareAndEnqueueOptimizationRequest: " + error.message);
    throw error;
  }
}
