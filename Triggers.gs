// Triggers.gs
/**
 * @overview Define e gerencia os gatilhos do Apps Script no SGTE, como gatilhos de tempo (para DailyCleanupService.gs) e gatilhos de edição de planilha (para OptimizationTriggerService.gs).
 * @module Triggers
 * @requires ScriptApp (serviço nativo do Apps Script).
 * @requires DailyCleanupService.gs para agendamento de limpeza diária.
 * @requires JobQueueService.gs para processamento da fila de jobs.
 */

function createDailyCleanupTrigger() {
  try {
    // Cria um gatilho diário para executar a função performDailyCleanup
    ScriptApp.newTrigger("DailyCleanupService.performDailyCleanup")
        .timeBased()
        .everyDays(1)
        .atHour(2) // Exemplo: executa às 2 da manhã
        .create();
    LoggerService.info("Gatilho diário para limpeza criado.");
  } catch (error) {
    Logger.log("Erro em createDailyCleanupTrigger: " + error.message);
    throw error;
  }
}

function createJobQueueProcessorTrigger() {
  try {
    // Cria um gatilho baseado em tempo para processar a fila de jobs a cada 5 minutos
    ScriptApp.newTrigger("JobQueueService.processJobQueue")
        .timeBased()
        .everyMinutes(5)
        .create();
    LoggerService.info("Gatilho para processamento da fila de jobs criado.");
  } catch (error) {
    Logger.log("Erro em createJobQueueProcessorTrigger: " + error.message);
    throw error;
  }
}

function createOnEditTrigger() {
  try {
    // Cria um gatilho para ser executado quando a planilha é editada
    // Este gatilho pode ser usado para detectar não embarques não avisados
    ScriptApp.newTrigger("OptimizationTriggerService.handleUnnotifiedNonBoarding")
        .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
        .onEdit()
        .create();
    LoggerService.info("Gatilho onEdit criado.");
  } catch (error) {
    Logger.log("Erro em createOnEditTrigger: " + error.message);
    throw error;
  }
}

function setupAllTriggers() {
  createDailyCleanupTrigger();
  createJobQueueProcessorTrigger();
  // createOnEditTrigger(); // Cuidado com gatilhos onEdit, podem ser executados com muita frequência
}

function deleteAllTriggers() {
  try {
    const allTriggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < allTriggers.length; i++) {
      ScriptApp.deleteTrigger(allTriggers[i]);
    }
    LoggerService.info("Todos os gatilhos do projeto foram excluídos.");
  } catch (error) {
    Logger.log("Erro em deleteAllTriggers: " + error.message);
    throw error;
  }
}
