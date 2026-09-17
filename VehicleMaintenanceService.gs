// VehicleMaintenanceService.gs
/**
 * @overview Gerencia o agendamento e registro de manutenções de veículos no SGTE.
 *           Ajuda a garantir a segurança e disponibilidade da frota.
 * @module VehicleMaintenanceService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de manutenção de veículo.
 * @requires VehicleService.gs para obter dados de veículos.
 */

function scheduleMaintenance(vehicleId, maintenanceType, scheduledDate, description) {
  const maintenanceData = {
    VehicleID: vehicleId,
    MaintenanceType: maintenanceType,
    ScheduledDate: scheduledDate,
    Description: description,
    Status: "Scheduled",
    CreatedAt: new Date()
  };
  return DataService.createRecord("VEHICLE_MAINTENANCE", maintenanceData);
}

function updateMaintenanceStatus(maintenanceId, newStatus, completionDate = null) {
  const updates = { Status: newStatus };
  if (completionDate) {
    updates.CompletionDate = completionDate;
  }
  return DataService.updateRecord("VEHICLE_MAINTENANCE", maintenanceId, updates);
}

function getMaintenanceHistory(vehicleId) {
  try {
    const allMaintenance = DataService.getAllRecords("VEHICLE_MAINTENANCE");
    const normalizedVehicleId = String(vehicleId == null ? '' : vehicleId).trim();
    return allMaintenance.filter(m => String(m.VehicleID == null ? '' : m.VehicleID).trim() === normalizedVehicleId).sort((a, b) => new Date(b.ScheduledDate) - new Date(a.ScheduledDate));
  } catch (error) {
    Logger.log("Erro em getMaintenanceHistory: " + error.message);
    throw error;
  }
}

function getUpcomingMaintenances(daysAhead = 30) {
  try {
    const allMaintenance = DataService.getAllRecords("VEHICLE_MAINTENANCE");
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return allMaintenance.filter(m => 
      m.Status === "Scheduled" && 
      new Date(m.ScheduledDate) >= today && 
      new Date(m.ScheduledDate) <= futureDate
    ).sort((a, b) => new Date(a.ScheduledDate) - new Date(b.ScheduledDate));
  } catch (error) {
    Logger.log("Erro em getUpcomingMaintenances: " + error.message);
    throw error;
  }
}
