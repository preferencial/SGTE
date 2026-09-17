// ReportDataService.gs
/**
 * @overview Coleta e prepara dados brutos para a geração de relatórios no SGTE.
 *           Abstrai a complexidade de buscar dados de múltiplas fontes para os relatórios.
 * @module ReportDataService
 * @requires OptimizationResultService.gs para resultados de otimização.
 * @requires TripService.gs para dados de viagens.
 * @requires StudentAttendanceService.gs para dados de frequência.
 */

function getRawDataForMonthlySavings(month, year) {
  const optimizationResults = OptimizationResultService.getOptimizationResultsByMonth(month, year);
  // Poderia incluir dados de viagens reais para comparar com otimizações
  return optimizationResults;
}

function getRawDataForTimeComparison() {
  const trips = DataService.getAllRecords('TRIPS');
  const results = DataService.getAllRecords('OPTIMIZATION_RESULTS');
  const values = { noSgte: [], withNotice: [], withoutNotice: [] };
  const numberFrom_ = function(record, names) {
    for (let i = 0; i < names.length; i++) {
      const value = Number(record[names[i]]);
      if (isFinite(value) && value > 0) return value;
    }
    return null;
  };
  trips.forEach(function(trip) {
    const duration = numberFrom_(trip, ['ActualDuration', 'ActualDurationMinutes', 'Duration', 'DurationMinutes', 'TravelTimeMinutes']);
    if (!duration) return;
    const hasOptimization = String(trip.OptimizationJobID || trip.OptimizationResultID || '').trim() !== '';
    const notice = String(trip.Notice || trip.WithNotice || '').toLowerCase();
    if (!hasOptimization) values.noSgte.push(duration);
    else if (notice === 'true' || notice === 'sim' || notice === '1') values.withNotice.push(duration);
    else values.withoutNotice.push(duration);
  });
  // Resultados de otimização são uma fonte real para o cenário otimizado quando
  // a viagem ainda não contém uma classificação explícita.
  results.forEach(function(result) {
    const optimized = Number(result.OptimizedDuration);
    if (isFinite(optimized) && optimized > 0 && !values.withoutNotice.length) values.withoutNotice.push(optimized);
  });
  const average_ = function(list) { return list.length ? list.reduce(function(a, b) { return a + b; }, 0) / list.length : null; };
  return {
    noSgte: average_(values.noSgte),
    withNotice: average_(values.withNotice),
    withoutNotice: average_(values.withoutNotice),
    dataAvailable: values.noSgte.length + values.withNotice.length + values.withoutNotice.length > 0,
    samples: { noSgte: values.noSgte.length, withNotice: values.withNotice.length, withoutNotice: values.withoutNotice.length }
  };
}

function getStudentAttendanceSummary(month, year) {
  try {
    // Coleta dados de frequência para um relatório de presença/ausência
    const allAttendance = DataService.getAllRecords("ATTENDANCE");
    return allAttendance.filter(record => {
      const attDate = new Date(record.AttendanceDate);
      return attDate.getMonth() + 1 === month && attDate.getFullYear() === year;
    });
  } catch (error) {
    Logger.log("Erro em getStudentAttendanceSummary: " + error.message);
    throw error;
  }
}
