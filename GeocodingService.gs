// GeocodingService.gs
/**
 * @overview Serviço para realizar geocodificação de endereços e geocodificação reversa no SGTE.
 *           Utiliza a API do Google Maps para converter endereços em coordenadas e vice-versa.
 * @module GeocodingService
 * @requires GoogleMapsService.gs para interação com a API do Google Maps.
 * @requires Logger.gs para registro de operações.
 */

function geocodeAddress(address) {
  Logger.info(`Geocodificando endereço: ${address}`);
  return GoogleMapsService.geocodeAddress(address);
}

function reverseGeocodeCoordinates(latitude, longitude) {
  Logger.info(`Geocodificação reversa para coordenadas: ${latitude}, ${longitude}`);
  // Implementar função de geocodificação reversa no GoogleMapsService.gs se necessário
  // Por enquanto, retorna um placeholder
  return { address: "Endereço Desconhecido" };
}
