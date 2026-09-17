// RouteService.gs
/**
 * @overview Gerencia as operações CRUD para a entidade 'Rota' no SGTE.
 *           Inclui métodos para criar, consultar, atualizar e desativar rotas, com detalhes sobre veículos, capacidade e pontos de parada.
 * @module RouteService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de rota.
 * @requires StudentService.gs para associar estudantes a rotas.
 */

function getRouteById(routeId) {
  return getRecordById("ROUTES", routeId);
}

function createRoute(routeData) {
  // Validações adicionais específicas para rota, se necessário
  return createRecord("ROUTES", routeData);
}

function updateRoute(routeId, routeData) {
  if (!routeId || !routeData || typeof routeData !== 'object') {
    throw new Error('ID e dados da rota são obrigatórios.');
  }
  const before = getRouteById(routeId);
  if (!before) throw new Error('Rota não encontrada: ' + routeId);
  const updated = updateRecord("ROUTES", routeId, routeData);
  if (!updated) throw new Error('Não foi possível atualizar a rota: ' + routeId);

  const after = Object.assign({}, before, routeData);
  const user = typeof getCurrentSessionUser === 'function' ? getCurrentSessionUser() : null;
  const userId = user && (user.ID || user.UserID || user.userId || user.Username) || 'system';
  if (typeof logRouteChange === 'function') {
    logRouteChange(routeId, userId, {
      before: before,
      after: after,
      changedFields: Object.keys(routeData)
    });
  }
  if (typeof logRouteUpdate === 'function') logRouteUpdate(userId, routeId);
  return updated;
}

function deactivateRoute(routeId) {
  // Implementar lógica de desativação (soft delete) ou exclusão
  return updateRecord("ROUTES", routeId, { Status: "Inactive" });
}

function getAllRoutes() {
  return getAllRecords("ROUTES");
}

function getRoutesByVehicle(vehicleId) {
  try {
    const allRoutes = getAllRecords("ROUTES");
    return allRoutes.filter(route => String(route.VehicleID) === String(vehicleId));
  } catch (error) {
    Logger.log("Erro em getRoutesByVehicle: " + error.message);
    throw error;
  }
}
