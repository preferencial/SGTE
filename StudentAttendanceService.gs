// StudentAttendanceService.gs
/**
 * @overview Gerencia o registro de frequência dos estudantes no SGTE.
 *           Permite registrar presença, ausência e incidentes, e pode ser uma fonte para detectar não embarques não avisados.
 * @module StudentAttendanceService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de frequência.
 * @requires OptimizationTriggerService.gs para acionar otimização em caso de não embarque não avisado.
 */

function recordAttendance(studentId, date, status, incidentDetails = null) {
  const attendanceData = {
    StudentID: studentId,
    AttendanceDate: date,
    Status: status, // e.g., "Present", "Absent", "Unnotified Absent"
    IncidentDetails: incidentDetails,
    CreatedAt: new Date()
  };
  const newRecord = DataService.createRecord("ATTENDANCE", attendanceData);

  if (status === "Unnotified Absent") {
    OptimizationTriggerService.handleUnnotifiedNonBoarding(studentId, date);
  }
  return newRecord;
}

function getAttendanceByStudentAndDate(studentId, date) {
  try {
    const allAttendance = DataService.getAllRecords("ATTENDANCE");
    const normalizedStudentId = String(studentId == null ? '' : studentId).trim();
    return allAttendance.filter(record => 
      String(record.StudentID == null ? '' : record.StudentID).trim() === normalizedStudentId &&
      new Date(record.AttendanceDate).toDateString() === date.toDateString()
    );
  } catch (error) {
    Logger.log("Erro em getAttendanceByStudentAndDate: " + error.message);
    throw error;
  }
}

function getStudentAttendanceHistory(studentId) {
  try {
    const allAttendance = DataService.getAllRecords("ATTENDANCE");
    const normalizedStudentId = String(studentId == null ? '' : studentId).trim();
    return allAttendance.filter(record => String(record.StudentID == null ? '' : record.StudentID).trim() === normalizedStudentId);
  } catch (error) {
    Logger.log("Erro em getStudentAttendanceHistory: " + error.message);
    throw error;
  }
}
