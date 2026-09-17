// RouteMetricsService.gs
/**
 * @overview Calcula e gerencia métricas de desempenho de rotas no SGTE, como tempo de viagem, distância percorrida e ocupação do veículo.
 * @module RouteMetricsService
 * @requires DataService.gs para obter dados de rotas e resultados de otimização.
 * @requires StudentService.gs para obter dados de estudantes.
 */

function calculateRouteOccupancy(routeId) {
  const route = RouteService.getRouteById(routeId);
  if (!route) return null;
  const capacity = Number(route.Capacity);
  if (!isFinite(capacity) || capacity <= 0) return null;
  const studentsOnRoute = StudentService.getStudentsByRoute(routeId).length;
  return (studentsOnRoute / capacity) * 100;
}

function getAverageTravelTime(routeId) {
  const trips = DataService.getAllRecords('TRIPS').filter(function(trip) { return String(trip.RouteID) === String(routeId); });
  const values = trips.map(function(trip) {
    return Number(trip.ActualDuration || trip.ActualDurationMinutes || trip.Duration || trip.DurationMinutes || trip.TravelTimeMinutes);
  }).filter(function(value) { return isFinite(value) && value > 0; });
  return values.length ? values.reduce(function(a, b) { return a + b; }, 0) / values.length : null;
}

function getAverageDistance(routeId) {
  const trips = DataService.getAllRecords('TRIPS').filter(function(trip) { return String(trip.RouteID) === String(routeId); });
  const values = trips.map(function(trip) {
    return Number(trip.ActualDistance || trip.Distance || trip.DistanceKm || trip.DistanceMeters);
  }).filter(function(value) { return isFinite(value) && value > 0; });
  return values.length ? values.reduce(function(a, b) { return a + b; }, 0) / values.length : null;
}

function getFuelConsumptionEstimate(routeId) {
  const trips = DataService.getAllRecords('TRIPS').filter(function(trip) { return String(trip.RouteID) === String(routeId); });
  const measured = trips.map(function(trip) {
    return Number(trip.FuelConsumed || trip.FuelUsed || trip.ConsumedFuel);
  }).filter(function(value) { return isFinite(value) && value >= 0; });
  if (measured.length) return measured.reduce(function(a, b) { return a + b; }, 0) / measured.length;
  const route = RouteService.getRouteById(routeId);
  const distance = getAverageDistance(routeId);
  const efficiency = route && Number(route.FuelEfficiencyKmPerLiter || route.FuelEfficiency || 0);
  return distance && efficiency > 0 ? distance / efficiency : null;
}
