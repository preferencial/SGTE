// DailyCleanupService.gs
/**
 * @overview Executa tarefas de manutenção diárias no SGTE, como arquivamento de dados antigos e limpeza de registros temporários,
 *           para garantir a performance da planilha e evitar o limite de células [1].
 * @module DailyCleanupService
 * @requires ArchiveService.gs para mover dados para o arquivo.
 * @requires DataService.gs para operações de exclusão de registros.
 * @requires ConfigService.gs para obter configurações de retenção.
 * @requires Logger.gs para registro de operações.
 */

function performDailyCleanup() {
  try {
    LoggerService.info("Iniciando tarefas de limpeza diária...");

    // Exemplo: Arquivar avisos de não embarque antigos (mais de X dias)
    const retentionDays = 30; // Configurar em ConfigService
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const allNotices = DataService.getAllRecords("NON_BOARDING_NOTICES");
    const noticesToArchive = allNotices.filter(notice => new Date(notice.CreatedAt) < cutoffDate);

    if (noticesToArchive.length > 0) {
      LoggerService.info(`Arquivando ${noticesToArchive.length} avisos de não embarque antigos.`);
      ArchiveService.archiveRecords("NON_BOARDING_NOTICES", noticesToArchive);
      noticesToArchive.forEach(notice => DataService.deleteRecord("NON_BOARDING_NOTICES", notice.ID));
    }

    // Exemplo: Limpar jobs antigos da fila de trabalho (jobs COMPLETED ou FAILED com mais de X dias)
    const jobRetentionDays = 7; // Configurar em ConfigService
    const jobCutoffDate = new Date();
    jobCutoffDate.setDate(jobCutoffDate.getDate() - jobRetentionDays);

    const allJobs = DataService.getAllRecords("JOB_QUEUE");
    const jobsToClean = allJobs.filter(job => 
      (job.Status === "COMPLETED" || job.Status === "FAILED") && 
      new Date(job.CompletedAt) < jobCutoffDate
    );

    if (jobsToClean.length > 0) {
      LoggerService.info(`Limpando ${jobsToClean.length} jobs antigos da fila de trabalho.`);
      jobsToClean.forEach(job => DataService.deleteRecord("JOB_QUEUE", job.ID));
    }

    LoggerService.info("Tarefas de limpeza diária concluídas.");
  } catch (error) {
    Logger.log("Erro em performDailyCleanup: " + error.message);
    throw error;
  }
}
