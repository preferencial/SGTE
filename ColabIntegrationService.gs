// ColabIntegrationService.gs
/**
 * @overview Responsável por invocar o notebook Python no Google Colab para executar as tarefas de otimização no SGTE.
 *           Passa os dados necessários e recebe os resultados da otimização.
 * @module ColabIntegrationService
 * @requires ConfigService.gs para obter a URL do notebook Colab.
 * @requires JobQueueService.gs para atualizar o status do job.
 * @requires UrlFetchApp (serviço nativo do Apps Script para fazer requisições HTTP).
 * @requires Logger.gs para registro de operações.
 */

function executeColabJob(jobId, payload) {
  if (!jobId || !payload || typeof payload !== 'object') {
    throw new Error('Job de otimização inválido: jobId e payload são obrigatórios.');
  }
  const colabUrl = ConfigService.getConfig("COLAB_NOTEBOOK_URL") || getConfig('COLAB_NOTEBOOK_URL');
  if (!colabUrl || !/^https:\/\//i.test(String(colabUrl))) {
    LoggerService.error("Erro: URL do notebook Colab não configurada em ConfigService.gs", "ERROR");
    JobQueueService.updateJobStatus(jobId, "FAILED", null, "URL do Colab não configurada.");
    return { success: false, error: "URL do Colab não configurada." };
  }

  try {
    const response = UrlFetchApp.fetch(String(colabUrl), {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ jobId: jobId, payload: payload }),
      muteHttpExceptions: true
    });
    const status = response.getResponseCode();
    const body = response.getContentText() || '';
    if (status < 200 || status >= 300) throw new Error('Colab respondeu HTTP ' + status + '.');

    const result = normalizeColabOptimizationResult_(body);

    JobQueueService.updateJobStatus(jobId, "COMPLETED", result);
    OptimizationResultService.saveOptimizationResult(jobId, payload.routeId, result);
    return { success: true, data: result };

  } catch (e) {
    LoggerService.error(`Erro ao invocar o Colab para o job ${jobId}: ${e.message}`, "ERROR");
    JobQueueService.updateJobStatus(jobId, "FAILED", null, e.message);
    return { success: false, error: e.message };
  }
}

function handleColabCallback(e) {
  var callbackJobId = '';
  try {
    try {
      // Esta função seria o endpoint que o Colab chamaria de volta após a conclusão do processamento.
      // O evento 'e' conteria os resultados da otimização.
      const jobId = e.parameter.jobId;
      callbackJobId = jobId;
      const status = String(e.parameter.status || '').toUpperCase();
      const errorMessage = e.parameter.errorMessage;

      if (status === "SUCCESS") {
        const result = normalizeColabOptimizationResult_(e.parameter.result || '');
        if (!result.routeId && !e.parameter.routeId) throw new Error('Callback do Colab sem routeId.');
        JobQueueService.updateJobStatus(jobId, "COMPLETED", result);
        OptimizationResultService.saveOptimizationResult(jobId, e.parameter.routeId || result.routeId, result);
      } else {
        JobQueueService.updateJobStatus(jobId, "FAILED", null, errorMessage);
      }
      return ContentService.createTextOutput("Callback received");
    } catch (error) {
      if (callbackJobId) {
        try { JobQueueService.updateJobStatus(callbackJobId, "FAILED", null, error.message); } catch (ignored) {}
      }
      Logger.log("Erro em handleColabCallback: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em handleColabCallback: " + error.message);
    throw error;
  }
}

function normalizeColabOptimizationResult_(body) {
  let envelope;
  try { envelope = typeof body === 'string' ? JSON.parse(body) : body; } catch (parseError) {
    throw new Error('Resposta do Colab não é JSON válido.');
  }
  if (!envelope || typeof envelope !== 'object') throw new Error('Resposta do Colab vazia.');
  if (envelope.success === false) throw new Error(envelope.error || 'Colab rejeitou o job.');
  const result = envelope.data && typeof envelope.data === 'object' ? envelope.data : envelope;
  const required = ['originalDuration', 'optimizedDuration', 'originalDistance', 'optimizedDistance'];
  const missing = required.filter(function(key) {
    return result[key] === undefined || result[key] === null || isNaN(Number(result[key]));
  });
  if (missing.length) throw new Error('Resposta do Colab sem métricas obrigatórias: ' + missing.join(', '));
  return result;
}
