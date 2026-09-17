// RouteOptimizationCallback.gs
/**
 * @overview Função de callback que é invocada pelo Google Colab após a conclusão de uma tarefa de otimização de rota no SGTE, para processar os resultados.
 * @module RouteOptimizationCallback
 * @requires OptimizationResultService.gs para salvar os resultados da otimização.
 * @requires JobQueueService.gs para atualizar o status do job.
 * @requires Logger.gs para registro de operações.
 */

function handleRouteOptimizationCallback(e) {
  try {
    // Esta função é o endpoint que o Google Colab chamaria de volta.
    // O parâmetro 'e' contém os dados enviados pelo Colab.
    const params = e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const jobId = params.jobId;
    const status = params.status;
    const result = params.result;
    const errorMessage = params.errorMessage;

    if (!jobId) {
      error("Callback do Colab recebido sem JobID.");
      return ContentService.createTextOutput(JSON.stringify({ success: false, message: "JobID ausente." })).setMimeType(ContentService.MimeType.JSON);
    }

    try {
      if (status === "SUCCESS") {
        updateJobStatus(jobId, "COMPLETED", result);
        saveOptimizationResult(jobId, result.routeId, result);
        info(`Callback do Colab para JobID ${jobId} processado com sucesso.`);
      } else {
        updateJobStatus(jobId, "FAILED", null, errorMessage);
        error(`Callback do Colab para JobID ${jobId} falhou com erro: ${errorMessage}`);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    } catch (callbackError) {
      error(`Erro ao processar callback do Colab para JobID ${jobId}: ${callbackError.message}`);
      updateJobStatus(jobId, "FAILED", null, `Erro interno no callback: ${callbackError.message}`);
      return ContentService.createTextOutput(JSON.stringify({ success: false, message: callbackError.message })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log("Erro em handleRouteOptimizationCallback: " + error.message);
    throw error;
  }
}
