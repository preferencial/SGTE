// GeoService.gs
/**
 * @overview Fornece funções para manipulação de dados geoespaciais no SGTE, como validação de coordenadas e cálculo de distâncias básicas.
 *           Pode ser usado para pré-processamento antes da otimização no Colab.
 * @module GeoService
 */

function isValidCoordinate(latitude, longitude) {
  // Validação básica de coordenadas
  return (latitude >= -90 && latitude <= 90) && (longitude >= -180 && longitude <= 180);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em quilômetros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance; // Distância em km
}

function toRad(Value) {
  return Value * Math.PI / 180;
}
