// JobQueueService.gs
/**
 * @overview Gerencia a fila de tarefas assíncronas no SGTE, como otimização de rotas.
 *           Enfileira jobs, atualiza seus status (PENDING, PROCESSING, COMPLETED, FAILED) e gerencia o payload para o Google Colab [1].
 * @module JobQueueService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de fila de trabalho.
 * @requires ColabIntegrationService.gs para invocar o Google Colab.
 * @requires Logger.gs para registro de operações.
 */

function enqueueJob(jobType, payload) {
  try {
    const jobData = {
      JobID: Utilities.getUuid(), // Gera um ID único para o job
      JobType: jobType,
      Status: "PENDING",
      Payload: JSON.stringify(payload),
      RequestedAt: new Date()
    };
    createRecord("JOB_QUEUE", jobData);
    info(`Job enfileirado: ${jobType} com ID ${jobData.JobID}`);
    // Acionar um gatilho para processar a fila ou chamar diretamente o Colab se for síncrono
    // Para este projeto, assumimos que um gatilho de tempo ou um processo externo irá consumir esta fila.
    // Ou, para simplificar, podemos chamar ColabIntegrationService.executeColabJob(jobData.JobID);
    return jobData.JobID;
  } catch (error) {
    Logger.log("Erro em enqueueJob: " + error.message);
    throw error;
  }
}

function getJobById(jobId) {
  return getRecordById("JOB_QUEUE", jobId);
}

function updateJobStatus(jobId, status, result = null, errorMessage = null) {
  try {
    try {
      const updates = {
        Status: status,
        UpdatedAt: new Date()
      };
      if (result) {
        updates.Result = JSON.stringify(result);
      }
      if (errorMessage) {
        updates.ErrorMessage = errorMessage;
      }
      if (status === "PROCESSING") {
        updates.StartedAt = new Date();
      } else if (status === "COMPLETED" || status === "FAILED") {
        updates.CompletedAt = new Date();
      }
      updateRecord("JOB_QUEUE", jobId, updates);
      info(`Status do Job ${jobId} atualizado para ${status}`);
    } catch (error) {
      Logger.log("Erro em updateJobStatus: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em updateJobStatus: " + error.message);
    throw error;
  }
}

function getPendingJobs() {
  try {
    const allJobs = getAllRecords("JOB_QUEUE");
    return allJobs.filter(job => job.Status === "PENDING");
  } catch (error) {
    Logger.log("Erro em getPendingJobs: " + error.message);
    throw error;
  }
}

function processJobQueue() {
  try {
    const pendingJobs = getPendingJobs();
    if (pendingJobs.length > 0) {
      info(`Processando ${pendingJobs.length} jobs pendentes.`);
      pendingJobs.forEach(job => {
        try {
          updateJobStatus(job.JobID, "PROCESSING");
          // Dependendo do JobType, chamar o serviço apropriado
          if (job.JobType === "ROUTE_OPTIMIZATION") {
            executeColabJob(job.JobID, JSON.parse(job.Payload));
          } else {
            throw new Error(`Tipo de job desconhecido: ${job.JobType}`);
          }
        } catch (e) {
          error(`Erro ao processar job ${job.JobID}: ${e.message}`);
          updateJobStatus(job.JobID, "FAILED", null, e.message);
        }
      });
    }
  } catch (error) {
    Logger.log("Erro em processJobQueue: " + error.message);
    throw error;
  }
}
