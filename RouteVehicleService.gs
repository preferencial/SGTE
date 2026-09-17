// RouteVehicleService.gs
/**
 * @overview Gerencia a associação de veículos a rotas no SGTE.
 *           Fornece métodos para atribuir, remover e consultar veículos por rota.
 * @module RouteVehicleService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires VehicleService.gs para obter dados de veículos.
 * @requires RouteService.gs para obter dados de rotas.
 */

function assignVehicleToRoute(routeId, vehicleId) {
  // Atualiza o campo VehicleID da rota
  return RouteService.updateRoute(routeId, { VehicleID: vehicleId });
}

function removeVehicleFromRoute(routeId) {
  // Remove o veículo da rota (seta VehicleID para null ou vazio)
  return RouteService.updateRoute(routeId, { VehicleID: null });
}

function getVehicleForRoute(routeId) {
  const route = RouteService.getRouteById(routeId);
  if (route && route.VehicleID) {
    return VehicleService.getVehicleById(route.VehicleID);
  }
  return null;
}

function getRoutesByVehicle(vehicleId) {
  try {
    const allRoutes = RouteService.getAllRoutes();
    return allRoutes.filter(route => String(route.VehicleID) === String(vehicleId));
  } catch (error) {
    Logger.log("Erro em getRoutesByVehicle: " + error.message);
    throw error;
  }
}
