// NonBoardingNoticeService.gs
/**
 * @overview Permite que as famílias registrem avisos sobre o não embarque de estudantes no SGTE.
 *           Registra a data, estudante, motivo e status do aviso. Aciona o processo de otimização de rota quando um aviso é registrado.
 * @module NonBoardingNoticeService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de aviso de não embarque.
 * @requires JobQueueService.gs para enfileirar tarefas de otimização.
 */

function createNonBoardingNotice(noticeData) {
  // noticeData deve conter StudentID, NoticeDate, Reason, NotifiedBy, NotificationMethod
  const newNotice = createRecord("NON_BOARDING_NOTICES", noticeData);
  
  // Após criar o aviso, acionar a otimização de rota
  // OptimizationTriggerService.triggerOptimization(newNotice.StudentID, newNotice.NoticeDate, true); // true para aviso
  
  return newNotice;
}

function getNonBoardingNoticeById(noticeId) {
  return getRecordById("NON_BOARDING_NOTICES", noticeId);
}

function getNonBoardingNoticesByStudent(studentId) {
  try {
    const allNotices = getAllRecords("NON_BOARDING_NOTICES");
    const normalizedStudentId = String(studentId == null ? '' : studentId).trim();
    return allNotices.filter(notice => String(notice.StudentID == null ? '' : notice.StudentID).trim() === normalizedStudentId);
  } catch (error) {
    Logger.log("Erro em getNonBoardingNoticesByStudent: " + error.message);
    throw error;
  }
}

function updateNonBoardingNotice(noticeId, updates) {
  return updateRecord("NON_BOARDING_NOTICES", noticeId, updates);
}

function getAllNonBoardingNotices() {
  return getAllRecords("NON_BOARDING_NOTICES");
}
