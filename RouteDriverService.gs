// RouteDriverService.gs
/**
 * @overview Gerencia a associação de motoristas a rotas no SGTE.
 *           Fornece métodos para atribuir, remover e consultar motoristas por rota.
 * @module RouteDriverService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires DriverService.gs para obter dados de motoristas.
 * @requires RouteService.gs para obter dados de rotas.
 */

function assignDriverToRoute(routeId, driverId) {
  // Atualiza o campo DriverID da rota
  return RouteService.updateRoute(routeId, { DriverID: driverId });
}

function removeDriverFromRoute(routeId) {
  // Remove o motorista da rota (seta DriverID para null ou vazio)
  return RouteService.updateRoute(routeId, { DriverID: null });
}

function getDriverForRoute(routeId) {
  const route = RouteService.getRouteById(routeId);
  if (route && route.DriverID) {
    return DriverService.getDriverById(route.DriverID);
  }
  return null;
}

function getRoutesByDriver(driverId) {
  try {
    const allRoutes = RouteService.getAllRoutes();
    return allRoutes.filter(route => String(route.DriverID) === String(driverId));
  } catch (error) {
    Logger.log("Erro em getRoutesByDriver: " + error.message);
    throw error;
  }
}
