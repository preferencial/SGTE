// RouteStopPointService.gs
/**
 * @overview Gerencia a associação de pontos de parada a rotas no SGTE.
 *           Fornece métodos para adicionar, remover e consultar pontos de parada por rota.
 * @module RouteStopPointService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires StopPointService.gs para obter dados de pontos de parada.
 * @requires RouteService.gs para obter dados de rotas.
 */

function addStopPointToRoute(routeId, stopPointData) {
  // stopPointData deve incluir Latitude, Longitude, Address, Order
  stopPointData.RouteID = routeId;
  return StopPointService.createStopPoint(stopPointData);
}

function removeStopPointFromRoute(stopPointId) {
  return StopPointService.deleteStopPoint(stopPointId);
}

function getStopPointsForRoute(routeId) {
  return StopPointService.getStopPointsByRoute(routeId);
}

function updateStopPointOrder(stopPointId, newOrder) {
  return StopPointService.updateStopPoint(stopPointId, { Order: newOrder });
}
