// StudentHistoryService.gs
/**
 * @overview Gerencia o histórico de alterações e versões dos dados dos estudantes no SGTE.
 *           Permite rastrear modificações e auditar alterações nos perfis dos estudantes.
 * @module StudentHistoryService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de histórico de estudante.
 */

function logStudentChange(studentId, userId, changeDetails) {
  try {
    const historyEntry = {
      StudentID: studentId,
      UserID: userId,
      Timestamp: new Date(),
      ChangeDetails: JSON.stringify(changeDetails)
    };
    return DataService.createRecord("STUDENT_HISTORY", historyEntry);
  } catch (error) {
    Logger.log("Erro em logStudentChange: " + error.message);
    throw error;
  }
}

function getStudentHistory(studentId) {
  const allHistory = DataService.getAllRecords("STUDENT_HISTORY");
  const normalizedStudentId = String(studentId == null ? '' : studentId).trim();
  return allHistory.filter(entry => String(entry.StudentID == null ? '' : entry.StudentID).trim() === normalizedStudentId).sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
}

function getStudentVersion(studentId, timestamp) {
  if (!studentId || !timestamp) throw new Error('Estudante e data da versão são obrigatórios.');
  const at = new Date(timestamp).getTime();
  if (!isFinite(at)) throw new Error('Data da versão inválida.');
  const history = DataService.getAllRecords('STUDENT_HISTORY')
    .filter(function(entry) { return String(entry.StudentID) === String(studentId) && new Date(entry.Timestamp).getTime() <= at; })
    .sort(function(a, b) { return new Date(b.Timestamp) - new Date(a.Timestamp); });
  if (!history.length) return null;
  let details;
  try { details = typeof history[0].ChangeDetails === 'string' ? JSON.parse(history[0].ChangeDetails) : history[0].ChangeDetails; } catch (e) { throw new Error('Histórico do estudante inválido.'); }
  return (details && (details.after || details.snapshot || details.current)) || details || null;
}
