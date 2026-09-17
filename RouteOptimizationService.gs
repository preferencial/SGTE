// RouteOptimizationService.gs
/**
 * @overview Orquestra o processo de otimização de rotas no SGTE, interagindo com o JobQueueService e o ColabIntegrationService.
 * @module RouteOptimizationService
 * @requires JobQueueService.gs para enfileirar e gerenciar jobs.
 * @requires ColabIntegrationService.gs para invocar o notebook Colab.
 * @requires StudentService.gs para obter dados de estudantes.
 * @requires RouteService.gs para obter dados de rotas.
 * @requires Logger.gs para registro de operações.
 */

function requestRouteOptimization(studentId, noticeDate, isNotified) {
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
      Logger.info(`Solicitação de otimização (com aviso) para estudante ${studentId} na rota ${route.ID}.`);
    } else {
      optimizationType = "RECALCULATE_RETURN_ONLY"; // Recalcular apenas a volta
      Logger.info(`Solicitação de otimização (sem aviso) para estudante ${studentId} na rota ${route.ID}.`);
    }

    const payload = {
      studentId: studentId,
      routeId: route.ID,
      noticeDate: noticeDate.toISOString(),
      optimizationType: optimizationType,
      // Incluir todos os dados necessários para o Colab, como lista de estudantes na rota, pontos de parada, etc.
      studentsOnRoute: StudentService.getStudentsByRoute(route.ID),
      routeDetails: route,
      stopPoints: StopPointService.getStopPointsByRoute(route.ID)
    };

    const jobId = JobQueueService.enqueueJob("ROUTE_OPTIMIZATION", payload);
    return { success: true, jobId: jobId };
  } catch (error) {
    Logger.log("Erro em requestRouteOptimization: " + error.message);
    throw error;
  }
}

function processOptimizationJob(jobId, payload) {
  // Esta função seria chamada pelo JobQueueService para realmente invocar o Colab
  ColabIntegrationService.executeColabJob(jobId, payload);
}
