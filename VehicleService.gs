// VehicleService.gs
/**
 * @overview Gerencia as operações CRUD para a entidade 'Veículo' no SGTE.
 *           Inclui informações sobre tipo de veículo, capacidade, adaptabilidade e status.
 * @module VehicleService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de veículo.
 */

function getVehicleById(vehicleId) {
  return DataService.getRecordById("VEHICLES", vehicleId);
}

function createVehicle(vehicleData) {
  // Validações adicionais específicas para veículo, se necessário
  return DataService.createRecord("VEHICLES", vehicleData);
}

function updateVehicle(vehicleId, vehicleData) {
  // Validações adicionais específicas para veículo, se necessário
  return DataService.updateRecord("VEHICLES", vehicleId, vehicleData);
}

function deactivateVehicle(vehicleId) {
  // Implementar lógica de desativação (soft delete) ou exclusão
  return DataService.updateRecord("VEHICLES", vehicleId, { Status: "Inactive" });
}

function getAllVehicles() {
  return DataService.getAllRecords("VEHICLES");
}

function getAvailableVehicles() {
  try {
    const allVehicles = DataService.getAllRecords("VEHICLES");
    return allVehicles.filter(function(vehicle) {
      const status = String(vehicle.Status || '').trim().toLowerCase();
      return ['available', 'available ', 'active', 'ativo', 'disponivel', 'disponível'].indexOf(status) !== -1;
    });
  } catch (error) {
    Logger.log("Erro em getAvailableVehicles: " + error.message);
    throw error;
  }
}
