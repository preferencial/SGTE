// RouteScheduleService.gs
/**
 * @overview Gerencia o agendamento diário das rotas no SGTE, incluindo horários de partida e chegada, e a atribuição de veículos e motoristas.
 * @module RouteScheduleService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de agendamento de rota.
 * @requires RouteService.gs para obter dados de rotas.
 * @requires DriverService.gs para obter dados de motoristas.
 * @requires VehicleService.gs para obter dados de veículos.
 */

function createDailyRouteSchedule(date, routeId, driverId, vehicleId, scheduledStartTime, scheduledEndTime) {
  const scheduleData = {
    ScheduleDate: date,
    RouteID: routeId,
    DriverID: driverId,
    VehicleID: vehicleId,
    ScheduledStartTime: scheduledStartTime,
    ScheduledEndTime: scheduledEndTime,
    Status: "Scheduled",
    CreatedAt: new Date()
  };
  return DataService.createRecord("ROUTE_SCHEDULES", scheduleData);
}

function getRouteScheduleByDate(date) {
  try {
    const allSchedules = DataService.getAllRecords("ROUTE_SCHEDULES");
    return allSchedules.filter(schedule => new Date(schedule.ScheduleDate).toDateString() === date.toDateString());
  } catch (error) {
    Logger.log("Erro em getRouteScheduleByDate: " + error.message);
    throw error;
  }
}

function updateRouteScheduleStatus(scheduleId, newStatus) {
  return DataService.updateRecord("ROUTE_SCHEDULES", scheduleId, { Status: newStatus, UpdatedAt: new Date() });
}

function getDriverSchedule(driverId, date) {
  try {
    const allSchedules = DataService.getAllRecords("ROUTE_SCHEDULES");
    const normalizedDriverId = String(driverId == null ? '' : driverId).trim();
    return allSchedules.filter(schedule => 
      String(schedule.DriverID == null ? '' : schedule.DriverID).trim() === normalizedDriverId &&
      new Date(schedule.ScheduleDate).toDateString() === date.toDateString()
    );
  } catch (error) {
    Logger.log("Erro em getDriverSchedule: " + error.message);
    throw error;
  }
}
