// AnalyticsService.gs
/**
 * @overview Fornece funções para coletar, processar e analisar dados para gerar insights e métricas de desempenho no SGTE.
 * @module AnalyticsService
 * @requires ReportDataService.gs para obter dados brutos.
 * @requires Logger.gs para registro de operações.
 */

function getStudentAttendanceRate(studentId, month, year) {
  try {
    const attendanceRecords = ReportDataService.getStudentAttendanceSummary(month, year);
    const normalizedStudentId = String(studentId == null ? '' : studentId).trim();
    const studentAttendance = attendanceRecords.filter(record => String(record.StudentID == null ? '' : record.StudentID).trim() === normalizedStudentId);
    const totalDays = new Date(year, month, 0).getDate(); // Número de dias no mês
    const presentDays = studentAttendance.filter(record => record.Status === "Present").length;
    return (presentDays / totalDays) * 100;
  } catch (error) {
    Logger.log("Erro em getStudentAttendanceRate: " + error.message);
    throw error;
  }
}

function getRoutePerformanceSummary(routeId, month, year) {
  try {
    const optimizationResults = OptimizationResultService.getOptimizationResultsByRouteId(routeId);
    const trips = TripService.getTripsByRouteAndDate(routeId, new Date(year, month - 1, 1)); // Primeiro dia do mês

    let totalOriginalDuration = 0;
    let totalOptimizedDuration = 0;
    let totalOriginalDistance = 0;
    let totalOptimizedDistance = 0;

    optimizationResults.forEach(result => {
      totalOriginalDuration += result.OriginalDuration || 0;
      totalOptimizedDuration += result.OptimizedDuration || 0;
      totalOriginalDistance += result.OriginalDistance || 0;
      totalOptimizedDistance += result.OptimizedDistance || 0;
    });

    return {
      routeId: routeId,
      totalOriginalDuration: totalOriginalDuration,
      totalOptimizedDuration: totalOptimizedDuration,
      totalOriginalDistance: totalOriginalDistance,
      totalOptimizedDistance: totalOptimizedDistance,
      averageOccupancy: RouteMetricsService.calculateRouteOccupancy(routeId) // Exemplo
    };
  } catch (error) {
    Logger.log("Erro em getRoutePerformanceSummary: " + error.message);
    throw error;
  }
}

function getOverallSystemPerformance(month, year) {
  try {
    const allRoutes = RouteService.getAllRoutes();
    let totalTimeSaved = 0;
    let totalFuelSaved = 0;

    allRoutes.forEach(route => {
      const routeResults = OptimizationResultService.getOptimizationResultsByRouteId(route.ID);
      routeResults.forEach(result => {
        const optDate = new Date(result.OptimizationDate);
        if (optDate.getMonth() + 1 === month && optDate.getFullYear() === year) {
          totalTimeSaved += result.TimeSaved || 0;
          totalFuelSaved += result.FuelSaved || 0;
        }
      });
    });

    return {
      month: month,
      year: year,
      totalTimeSaved: totalTimeSaved,
      totalFuelSaved: totalFuelSaved,
      totalStudents: StudentService.getAllStudents().length,
      totalRoutes: allRoutes.length
    };
  } catch (error) {
    Logger.log("Erro em getOverallSystemPerformance: " + error.message);
    throw error;
  }
}
