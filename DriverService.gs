// DriverService.gs
/**
 * @overview Gerencia as operações CRUD para a entidade 'Motorista' no SGTE.
 *           Inclui informações de contato, licença e histórico.
 * @module DriverService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de motorista.
 */

function getDriverById(driverId) {
  return DataService.getRecordById("DRIVERS", driverId);
}

function createDriver(driverData) {
  // Validações adicionais específicas para motorista, se necessário
  return DataService.createRecord("DRIVERS", driverData);
}

function updateDriver(driverId, driverData) {
  // Validações adicionais específicas para motorista, se necessário
  return DataService.updateRecord("DRIVERS", driverId, driverData);
}

function deactivateDriver(driverId) {
  // Implementar lógica de desativação (soft delete) ou exclusão
  return DataService.updateRecord("DRIVERS", driverId, { Status: "Inactive" });
}

function getAllDrivers() {
  return DataService.getAllRecords("DRIVERS");
}

function getAvailableDrivers() {
  try {
    const allDrivers = DataService.getAllRecords("DRIVERS");
    return allDrivers.filter(function(driver) {
      const status = String(driver.Status || '').trim().toLowerCase();
      return ['available', 'active', 'ativo', 'disponivel', 'disponível'].indexOf(status) !== -1;
    });
  } catch (error) {
    Logger.log("Erro em getAvailableDrivers: " + error.message);
    throw error;
  }
}
