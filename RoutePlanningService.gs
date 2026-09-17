// RoutePlanningService.gs
/**
 * @overview Gerencia o planejamento inicial e a criação de novas rotas no SGTE.
 *           Pode envolver a sugestão de rotas com base em grupos de estudantes e pontos de parada.
 * @module RoutePlanningService
 * @requires RouteService.gs para criar e gerenciar rotas.
 * @requires StudentService.gs para obter dados de estudantes.
 * @requires StopPointService.gs para gerenciar pontos de parada.
 * @requires GoogleMapsService.gs para cálculos geoespaciais.
 */

function suggestNewRoute(studentIds) {
  const ids = normalizePlanningStudentIds_(studentIds);
  const students = ids.map(function(id) {
    const student = StudentService.getStudentById(id);
    if (!student) throw new Error('Estudante não encontrado: ' + id);
    return student;
  });
  const stopPoints = buildPlanningStopPoints_(students);
  const metrics = calculatePlanningMetrics_(stopPoints);
  Logger.info('Sugestão de nova rota para ' + ids.length + ' estudantes.');
  return {
    routeName: 'Nova Rota Sugerida',
    students: ids,
    stopPoints: stopPoints,
    estimatedDistance: metrics.distanceKm,
    estimatedDuration: metrics.durationMinutes,
    dataAvailable: true
  };
}

function createPlannedRoute(routeName, vehicleId, driverId, studentIds, stopPointsData) {
  try {
    if (!String(routeName || '').trim()) throw new Error('Nome da rota é obrigatório.');
    if (!vehicleId) throw new Error('Veículo é obrigatório.');
    const ids = normalizePlanningStudentIds_(studentIds);
    const vehicle = VehicleService.getVehicleById(vehicleId);
    if (!vehicle) throw new Error('Veículo não encontrado: ' + vehicleId);
    const capacity = Number(vehicle.Capacity || vehicle.Seats || vehicle.Capacidade);
    if (!isFinite(capacity) || capacity <= 0) {
      throw new Error('Veículo sem capacidade configurada: ' + vehicleId);
    }
    if (ids.length > capacity) {
      throw new Error('A rota excede a capacidade do veículo (' + capacity + ').');
    }

    const students = ids.map(function(id) {
      const student = StudentService.getStudentById(id);
      if (!student) throw new Error('Estudante não encontrado: ' + id);
      return student;
    });
    const stopPoints = Array.isArray(stopPointsData) && stopPointsData.length
      ? stopPointsData.map(normalizePlanningStopPoint_)
      : buildPlanningStopPoints_(students);
    if (!stopPoints.length) throw new Error('Informe ao menos um ponto de parada com coordenadas.');
    const metrics = calculatePlanningMetrics_(stopPoints);

    const routeData = {
      RouteName: routeName,
      VehicleID: vehicleId,
      DriverID: driverId,
      Capacity: capacity,
      CurrentStudents: ids.length,
      Status: "Planned",
      StartTime: new Date(),
      EndTime: new Date(Date.now() + metrics.durationMinutes * 60000),
      Distance: metrics.distanceKm,
      Duration: metrics.durationMinutes
    };
    const newRoute = RouteService.createRoute(routeData);

    stopPoints.forEach(function(sp, index) {
      StopPointService.createStopPoint(Object.assign({ RouteID: newRoute.ID, Order: index + 1 }, sp));
    });

    ids.forEach(function(studentId) {
      StudentService.updateStudent(studentId, { RouteID: newRoute.ID });
    });

    Logger.info(`Rota planejada '${routeName}' criada com ID ${newRoute.ID}.`);
    return newRoute;
  } catch (error) {
    Logger.log("Erro em createPlannedRoute: " + error.message);
    throw error;
  }
}

function normalizePlanningStudentIds_(studentIds) {
  if (!Array.isArray(studentIds) || !studentIds.length) {
    throw new Error('Informe ao menos um estudante para planejar a rota.');
  }
  const ids = studentIds.map(function(id) { return String(id || '').trim(); }).filter(Boolean);
  if (ids.length !== studentIds.length || ids.length !== Array.from(new Set(ids)).length) {
    throw new Error('A lista de estudantes contém IDs inválidos ou duplicados.');
  }
  return ids;
}

function normalizePlanningStopPoint_(point) {
  const lat = Number(point && (point.Latitude !== undefined ? point.Latitude : point.latitude));
  const lng = Number(point && (point.Longitude !== undefined ? point.Longitude : point.longitude));
  if (!isFinite(lat) || !isFinite(lng) || !isValidCoordinate(lat, lng)) {
    throw new Error('Ponto de parada sem coordenadas válidas.');
  }
  return {
    Address: String(point.Address || point.address || '').trim(),
    Latitude: lat,
    Longitude: lng
  };
}

function buildPlanningStopPoints_(students) {
  return students.map(function(student) {
    return normalizePlanningStopPoint_({
      Address: student.Address || student.Endereco || ('Estudante ' + student.ID),
      Latitude: student.Latitude,
      Longitude: student.Longitude
    });
  });
}

function calculatePlanningMetrics_(stopPoints) {
  let distanceKm = 0;
  for (let i = 1; i < stopPoints.length; i++) {
    distanceKm += calculateDistance(
      stopPoints[i - 1].Latitude,
      stopPoints[i - 1].Longitude,
      stopPoints[i].Latitude,
      stopPoints[i].Longitude
    );
  }
  const config = typeof getOptimizationConfig === 'function' ? getOptimizationConfig() : null;
  const speed = Number(config && (config.averageSpeedKmH || config.AverageSpeedKmH || config.VelocidadeMediaKmH));
  if (!isFinite(speed) || speed <= 0) throw new Error('Velocidade média de planejamento não configurada.');
  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    durationMinutes: Math.max(0, Math.round((distanceKm / speed) * 60))
  };
}
