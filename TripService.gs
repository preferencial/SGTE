// TripService.gs
/**
 * @overview Gerencia os registros de viagens realizadas no SGTE, incluindo detalhes como rota, veículo, motorista, horários e estudantes transportados.
 * @module TripService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de viagem.
 */

function createTripRecord(tripData) {
  // tripData deve incluir RouteID, VehicleID, DriverID, StartTime, EndTime, StudentsCount, etc.
  return DataService.createRecord("TRIPS", tripData);
}

function getTripById(tripId) {
  return DataService.getRecordById("TRIPS", tripId);
}

function getTripsByRouteAndDate(routeId, date) {
  try {
    if (!date || isNaN(new Date(date).getTime())) return [];
    const normalizedRouteId = String(routeId == null ? '' : routeId).trim();
    const allTrips = DataService.getAllRecords("TRIPS");
    return allTrips.filter(trip => 
      String(trip.RouteID == null ? '' : trip.RouteID).trim() === normalizedRouteId &&
      new Date(trip.StartTime).toDateString() === date.toDateString()
    );
  } catch (error) {
    Logger.log("Erro em getTripsByRouteAndDate: " + error.message);
    throw error;
  }
}

function updateTripRecord(tripId, updates) {
  return DataService.updateRecord("TRIPS", tripId, updates);
}

function getAllTrips() {
  return DataService.getAllRecords("TRIPS");
}
