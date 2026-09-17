// RouteMonitoringService.gs
/**
 * @overview Monitora o status das rotas em tempo real ou quase real no SGTE.
 *           Pode ser usado para rastrear veículos, verificar atrasos e gerenciar incidentes.
 * @module RouteMonitoringService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de monitoramento de rota.
 * @requires Logger.gs para registro de operações.
 */

function updateRouteStatus(routeId, status, currentLocation = null, eta = null) {
  const updates = {
    Status: status,
    UpdatedAt: new Date()
  };
  if (currentLocation) {
    updates.CurrentLatitude = currentLocation.latitude;
    updates.CurrentLongitude = currentLocation.longitude;
  }
  if (eta) {
    updates.ETA = eta;
  }
  return DataService.updateRecord("ROUTES", routeId, updates);
}

function logRouteIncident(routeId, incidentType, description, timestamp) {
  const incidentData = {
    RouteID: routeId,
    IncidentType: incidentType,
    Description: description,
    Timestamp: timestamp,
    CreatedAt: new Date()
  };
  return DataService.createRecord("ROUTE_INCIDENTS", incidentData);
}

function getActiveRouteStatuses() {
  try {
    const allRoutes = RouteService.getAllRoutes();
    return allRoutes.filter(route => route.Status === "Active" || route.Status === "InProgress");
  } catch (error) {
    Logger.log("Erro em getActiveRouteStatuses: " + error.message);
    throw error;
  }
}
