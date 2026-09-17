// GoogleMapsService.gs
/**
 * @overview Fornece funções para interagir com a API do Google Maps no SGTE, como geocodificação de endereços e cálculo de direções.
 * @module GoogleMapsService
 * @requires Logger.gs para registro de operações.
 */

function geocodeAddress(address) {
  try {
    const response = Maps.geocode(address);
    if (response.status === "OK" && response.results.length > 0) {
      const location = response.results[0].geometry.location;
      return { latitude: location.lat, longitude: location.lng };
    }
    Logger.warn(`Geocodificação falhou para o endereço: ${address}. Status: ${response.status}`);
    return null;
  } catch (e) {
    Logger.error(`Erro na geocodificação do endereço ${address}: ${e.message}`);
    return null;
  }
}

function getDirections(origin, destination, waypoints = []) {
  try {
    const directions = Maps.newDirectionFinder()
      .setOrigin(origin)
      .setDestination(destination)
      .setMode(Maps.DirectionFinder.Mode.DRIVING);

    waypoints.forEach(waypoint => directions.addWaypoint(waypoint));

    const response = directions.getDirections();

    if (response.status === "OK" && response.routes.length > 0) {
      const route = response.routes[0];
      const leg = route.legs[0]; // Simplificado para uma única perna
      return {
        distance: leg.distance.value, // em metros
        duration: leg.duration.value, // em segundos
        steps: leg.steps.map(step => step.html_instructions)
      };
    }
    Logger.warn(`Obtenção de direções falhou. Status: ${response.status}`);
    return null;
  } catch (e) {
    Logger.error(`Erro ao obter direções: ${e.message}`);
    return null;
  }
}
