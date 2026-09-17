// StudentRouteService.gs
/**
 * @overview Gerencia a associação de estudantes a rotas no SGTE.
 *           Fornece métodos para vincular, desvincular e consultar estudantes por rota.
 * @module StudentRouteService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires StudentService.gs para obter dados de estudantes.
 * @requires RouteService.gs para obter dados de rotas.
 */

function assignStudentToRoute(studentId, routeId) {
  // Atualiza o campo RouteID do estudante
  return StudentService.updateStudent(studentId, { RouteID: routeId });
}

function removeStudentFromRoute(studentId) {
  // Remove o estudante da rota (seta RouteID para null ou vazio)
  return StudentService.updateStudent(studentId, { RouteID: null });
}

function getStudentsAssignedToRoute(routeId) {
  return StudentService.getStudentsByRoute(routeId);
}

function getRouteForStudent(studentId) {
  const student = StudentService.getStudentById(studentId);
  if (student && student.RouteID) {
    return RouteService.getRouteById(student.RouteID);
  }
  return null;
}
