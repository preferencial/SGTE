// StopPointService.gs
/**
 * @overview Gerencia os pontos de parada das rotas no SGTE, incluindo coordenadas e ordem na rota.
 * @module StopPointService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de ponto de parada.
 * @requires RouteService.gs para associar pontos de parada a rotas.
 */

function getStopPointById(stopPointId) {
  return DataService.getRecordById("STOP_POINTS", stopPointId);
}

function createStopPoint(stopPointData) {
  // Validações adicionais específicas para ponto de parada, se necessário
  return DataService.createRecord("STOP_POINTS", stopPointData);
}

function updateStopPoint(stopPointId, stopPointData) {
  // Validações adicionais específicas para ponto de parada, se necessário
  return DataService.updateRecord("STOP_POINTS", stopPointId, stopPointData);
}

function deleteStopPoint(stopPointId) {
  return DataService.deleteRecord("STOP_POINTS", stopPointId);
}

function getStopPointsByRoute(routeId) {
  try {
    const allStopPoints = DataService.getAllRecords("STOP_POINTS");
    const normalizedRouteId = String(routeId == null ? '' : routeId).trim();
    return allStopPoints.filter(stopPoint => String(stopPoint.RouteID == null ? '' : stopPoint.RouteID).trim() === normalizedRouteId);
  } catch (error) {
    Logger.log("Erro em getStopPointsByRoute: " + error.message);
    throw error;
  }
}
