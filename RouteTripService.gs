// RouteTripService.gs
/**
 * @overview Gerencia a relação entre rotas e viagens no SGTE.
 *           Permite associar viagens a rotas específicas e recuperar informações de viagens para uma dada rota.
 * @module RouteTripService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires TripService.gs para obter dados de viagens.
 * @requires RouteService.gs para obter dados de rotas.
 */

function getTripsForRoute(routeId) {
  return TripService.getTripsByRouteAndDate(routeId, new Date()); // Exemplo: viagens de hoje
}

function createTripForRoute(routeId, tripData) {
  tripData.RouteID = routeId;
  return TripService.createTripRecord(tripData);
}

function updateTripForRoute(tripId, routeId, updates) {
  const trip = TripService.getTripById(tripId);
  if (trip && String(trip.RouteID == null ? '' : trip.RouteID).trim() === String(routeId == null ? '' : routeId).trim()) {
    return TripService.updateTripRecord(tripId, updates);
  }
  return null;
}
