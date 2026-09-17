// StudentHealthService.gs
/**
 * @overview Gerencia informações de saúde dos estudantes no SGTE, como alergias, condições médicas e medicamentos.
 *           Essencial para garantir a segurança e o bem-estar dos alunos durante o transporte.
 * @module StudentHealthService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de saúde do estudante.
 */

function getStudentHealthInfo(studentId) {
  return DataService.getRecordById("STUDENT_HEALTH", studentId);
}

function updateStudentHealthInfo(studentId, healthData) {
  // healthData deve incluir alergias, condições, medicamentos, etc.
  return DataService.updateRecord("STUDENT_HEALTH", studentId, healthData);
}

function createStudentHealthInfo(healthData) {
  // healthData deve incluir StudentID, alergias, condições, medicamentos, etc.
  return DataService.createRecord("STUDENT_HEALTH", healthData);
}

function hasMedicalCondition(studentId) {
  const healthInfo = getStudentHealthInfo(studentId);
  return healthInfo && healthInfo.MedicalConditions && healthInfo.MedicalConditions.length > 0;
}
