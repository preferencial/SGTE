// DriverAvailabilityService.gs
/**
 * @overview Gerencia a disponibilidade dos motoristas no SGTE, permitindo registrar horários de trabalho, folgas e ausências.
 *           Ajuda no planejamento e alocação de motoristas para as rotas.
 * @module DriverAvailabilityService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de disponibilidade de motorista.
 * @requires DriverService.gs para obter dados de motoristas.
 */

function setDriverAvailability(driverId, date, status, startTime = null, endTime = null) {
  const availabilityData = {
    DriverID: driverId,
    Date: date,
    Status: status, // e.g., "Available", "Unavailable", "OnLeave"
    StartTime: startTime,
    EndTime: endTime,
    CreatedAt: new Date()
  };
  return DataService.createRecord("DRIVER_AVAILABILITY", availabilityData);
}

function getDriverAvailability(driverId, date) {
  try {
    const allAvailability = DataService.getAllRecords("DRIVER_AVAILABILITY");
    const normalizedDriverId = String(driverId == null ? '' : driverId).trim();
    return allAvailability.filter(a => 
      String(a.DriverID == null ? '' : a.DriverID).trim() === normalizedDriverId &&
      new Date(a.Date).toDateString() === date.toDateString()
    );
  } catch (error) {
    Logger.log("Erro em getDriverAvailability: " + error.message);
    throw error;
  }
}

function getAvailableDriversForDate(date) {
  try {
    const allDrivers = DriverService.getAllDrivers();
    const availableDrivers = [];
    allDrivers.forEach(driver => {
      const availability = getDriverAvailability(driver.ID, date);
      if (availability.length === 0 || availability.some(a => a.Status === "Available")) {
        availableDrivers.push(driver);
      }
    });
    return availableDrivers;
  } catch (error) {
    Logger.log("Erro em getAvailableDriversForDate: " + error.message);
    throw error;
  }
}
