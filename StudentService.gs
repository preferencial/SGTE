// StudentService.gs
/**
 * @overview Gerencia as operações CRUD para a entidade 'Estudante' no SGTE.
 *           Inclui métodos para cadastrar, consultar, atualizar e desativar estudantes, com suas informações geoespaciais e de acessibilidade.
 * @module StudentService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de estudante.
 * @requires RouteService.gs para vincular estudantes a rotas.
 */

function getStudentById(studentId) {
  return getRecordById("STUDENTS", studentId);
}

function createStudent(studentData) {
  // Validações adicionais específicas para estudante, se necessário
  return createRecord("STUDENTS", studentData);
}

function updateStudent(studentId, studentData) {
  // Validações adicionais específicas para estudante, se necessário
  return updateRecord("STUDENTS", studentId, studentData);
}

function deactivateStudent(studentId) {
  // O schema atual de estudantes não possui coluna Status.
  // A remoção evita retornar sucesso sem alterar efetivamente o registro.
  return deleteRecord("STUDENTS", studentId);
}

function getAllStudents() {
  return getAllRecords("STUDENTS");
}

function getStudentsByRoute(routeId) {
  try {
    const allStudents = getAllRecords("STUDENTS");
    return allStudents.filter(student => String(student.RouteID) === String(routeId));
  } catch (error) {
    Logger.log("Erro em getStudentsByRoute: " + error.message);
    throw error;
  }
}
