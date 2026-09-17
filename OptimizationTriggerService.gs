// OptimizationTriggerService.gs
/**
 * @overview Contém a lógica para determinar quando e como acionar a otimização de rotas no SGTE.
 *           Diferencia entre avisos de não embarque (otimização de ida e volta) e não embarques não avisados (otimização apenas de volta).
 * @module OptimizationTriggerService
 * @requires NonBoardingNoticeService.gs para obter informações sobre avisos de não embarque.
 * @requires JobQueueService.gs para enfileirar tarefas de otimização.
 * @requires StudentService.gs para obter dados do estudante.
 * @requires RouteService.gs para obter dados da rota.
 */

function triggerOptimization(studentId, noticeDate, isNotified) {
  try {
    const student = StudentService.getStudentById(studentId);
    if (!student || !student.RouteID) {
      LoggerService.info('Otimização não iniciada: estudante ausente ou sem rota. Identificador não registrado.');
      return;
    }

    const route = RouteService.getRouteById(student.RouteID);
    if (!route) {
      LoggerService.info('Otimização não iniciada: rota associada não encontrada. Identificador não registrado.');
      return;
    }

    let optimizationType;
    if (isNotified) {
      optimizationType = "RECALCULATE_BOTH_WAYS"; // Recalcular ida e volta
      LoggerService.info('Otimização acionada com aviso prévio. Identificadores não registrados.');
    } else {
      optimizationType = "RECALCULATE_RETURN_ONLY"; // Recalcular apenas a volta
      LoggerService.info('Otimização acionada sem aviso prévio. Identificadores não registrados.');
    }

    const payload = {
      studentId: studentId,
      routeId: route.ID,
      noticeDate: noticeDate.toISOString(),
      optimizationType: optimizationType
    };

    JobQueueService.enqueueJob("ROUTE_OPTIMIZATION", payload);
  } catch (error) {
    Logger.log("Erro em triggerOptimization: " + error.message);
    throw error;
  }
}

function handleUnnotifiedNonBoarding(studentId, date) {
  // Esta função seria chamada por um gatilho de edição na planilha de frequência
  // ou por um processo que detecta não embarques não avisados.
  LoggerService.info('Não embarque sem aviso detectado. Data registrada pelo evento operacional.');
  triggerOptimization(studentId, date, false);
}
