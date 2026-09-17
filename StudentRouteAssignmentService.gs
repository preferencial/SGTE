// StudentRouteAssignmentService.gs
/**
 * @overview Gerencia a atribuição e desatribuição de estudantes a rotas no SGTE.
 *           Facilita a realocação de estudantes entre rotas e a gestão de vagas.
 * @module StudentRouteAssignmentService
 * @requires StudentService.gs para atualizar dados de estudantes.
 * @requires RouteService.gs para atualizar contagem de estudantes na rota.
 * @requires Logger.gs para registro de operações.
 */

function assignStudentToRoute(studentId, routeId) {
  const student = StudentService.getStudentById(studentId);
  const route = RouteService.getRouteById(routeId);

  if (!student || !route) {
    Logger.error(`Falha ao atribuir estudante ${studentId} à rota ${routeId}: Estudante ou rota não encontrados.`);
    return false;
  }

  // Remover estudante da rota anterior, se houver
  if (student.RouteID && student.RouteID !== routeId) {
    removeStudentFromRoute(studentId); // Remove da rota antiga
  }

  // Atribuir estudante à nova rota
  StudentService.updateStudent(studentId, { RouteID: routeId });
  // Atualizar contagem de estudantes na rota (lógica simplificada)
  RouteService.updateRoute(routeId, { CurrentStudents: (route.CurrentStudents || 0) + 1 });

  Logger.info(`Estudante ${studentId} atribuído à rota ${routeId}.`);
  return true;
}

function removeStudentFromRoute(studentId) {
  const student = StudentService.getStudentById(studentId);
  if (!student || !student.RouteID) {
    Logger.warn(`Estudante ${studentId} não está atribuído a nenhuma rota ou não encontrado.`);
    return false;
  }

  const oldRoute = RouteService.getRouteById(student.RouteID);
  if (oldRoute) {
    RouteService.updateRoute(oldRoute.ID, { CurrentStudents: Math.max(0, (oldRoute.CurrentStudents || 0) - 1) });
  }

  StudentService.updateStudent(studentId, { RouteID: null });
  Logger.info(`Estudante ${studentId} removido da rota ${oldRoute ? oldRoute.ID : 'desconhecida'}.`);
  return true;
}

function getStudentsOnRoute(routeId) {
  return StudentService.getStudentsByRoute(routeId);
}
