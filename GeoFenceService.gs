// GeoFenceService.gs
/**
 * @overview Gerencia geocercas (geofences) para monitoramento de áreas geográficas no SGTE.
 *           Pode ser usado para verificar se estudantes estão dentro de áreas de embarque/desembarque ou se veículos estão em rotas designadas.
 * @module GeoFenceService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de geocerca.
 * @requires GeoService.gs para cálculos geoespaciais.
 */

function createGeoFence(fenceData) {
  // fenceData deve incluir Name, Type (Circle, Polygon), Coordinates, Radius (se Circle)
  return DataService.createRecord("GEOFENCES", fenceData);
}

function getGeoFenceById(fenceId) {
  return DataService.getRecordById("GEOFENCES", fenceId);
}

function isPointInGeoFence(latitude, longitude, fenceId) {
  const fence = getGeoFenceById(fenceId);
  if (!fence) {
    Logger.warn(`Geocerca ${fenceId} não encontrada.`);
    return false;
  }

  // Lógica de verificação de ponto em polígono ou círculo
  // Para simplicidade, apenas um exemplo de círculo:
  if (fence.Type === "Circle" && fence.Coordinates && fence.Radius) {
    const centerLat = fence.Coordinates[0].latitude;
    const centerLng = fence.Coordinates[0].longitude;
    const distance = GeoService.calculateDistance(latitude, longitude, centerLat, centerLng);
    return distance <= fence.Radius; // Raio em km
  }
  Logger.warn(`Tipo de geocerca não suportado ou dados incompletos para ${fenceId}.`);
  return false;
}

function getAllGeoFences() {
  return DataService.getAllRecords("GEOFENCES");
}
