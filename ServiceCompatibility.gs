/**
 * Fachadas compatíveis com o padrão Service.metodo usado nos módulos legados.
 * As implementações continuam sendo as funções globais do Apps Script.
 * Métodos utilizam delegação em tempo de execução para evitar dependência de ordem de carga.
 */

var ConfigService = {
  getConfig: function() { return getConfig(); },
  getSpreadsheetId: function() { return getSpreadsheetId(); },
  getSheetName: function(name) { return getSheetName(name); },
  getGeminiApiKey: function() { return getGeminiApiKey(); },
  getGoogleMapsApiKey: function() { return getGoogleMapsApiKey(); }
};

var DataService = {
  getSpreadsheet: function() { return getSpreadsheet(); },
  getSheet: function(sheetName) { return getSheet(sheetName); },
  getNextId: function(sheetName) { return getNextId(sheetName); },
  createRecord: function(sheetName, recordData) { return createRecord(sheetName, recordData); },
  getRecordById: function(sheetName, id) { return getRecordById(sheetName, id); },
  getAllRecords: function(sheetName) { return getAllRecords(sheetName); },
  updateRecord: function(sheetName, id, updateData) { return updateRecord(sheetName, id, updateData); },
  deleteRecord: function(sheetName, id) { return deleteRecord(sheetName, id); },
  getIdentifierHeader: function(sheetName) { return getIdentifierHeader_(sheetName); }
};

var HtmlServiceUtils = {
  include: function(filename) { return include(filename); },
  renderTemplate: function(filename, data) { return renderHtmlTemplate(filename, data); },
  renderAuthenticatedTemplate: function(filename, data) { return renderAuthenticatedTemplate(filename, data); },
  getScriptUrl: function() { return getScriptUrl(); }
};

var AuthService = {
  doLogin: function(username, password) { return doLogin(username, password); },
  doLogout: function() { return doLogout(); },
  isAuthenticated: function() { return isAuthenticated(); }
};

var SessionService = {
  createSession: function(userId) { return createSession(userId); },
  getSession: function() { return getSession(); },
  invalidateSession: function() { return invalidateSession(); },
  getCurrentSessionUser: function() { return getCurrentSessionUser(); }
};

var StudentService = {
  getStudentById: function(id) { return getStudentById(id); },
  createStudent: function(data) { return createStudent(data); },
  updateStudent: function(id, data) { return updateStudent(id, data); },
  deactivateStudent: function(id) { return deactivateStudent(id); },
  getAllStudents: function() { return getAllStudents(); },
  getStudentsByRoute: function(routeId) { return getStudentsByRoute(routeId); }
};

var RouteService = {
  getRouteById: function(id) { return getRouteById(id); },
  createRoute: function(data) { return createRoute(data); },
  updateRoute: function(id, data) { return updateRoute(id, data); },
  deactivateRoute: function(id) { return deactivateRoute(id); },
  getAllRoutes: function() { return getAllRoutes(); },
  getRoutesByVehicle: function(vehicleId) { return getRoutesByVehicle(vehicleId); }
};

var DriverService = {
  getDriverById: function(id) { return getDriverById(id); },
  createDriver: function(data) { return createDriver(data); },
  updateDriver: function(id, data) { return updateDriver(id, data); },
  deactivateDriver: function(id) { return deactivateDriver(id); },
  getAllDrivers: function() { return getAllDrivers(); },
  getAvailableDrivers: function() { return getAvailableDrivers(); }
};

var VehicleService = {
  getVehicleById: function(id) { return getVehicleById(id); },
  createVehicle: function(data) { return createVehicle(data); },
  updateVehicle: function(id, data) { return updateVehicle(id, data); },
  deactivateVehicle: function(id) { return deactivateVehicle(id); },
  getAllVehicles: function() { return getAllVehicles(); },
  getAvailableVehicles: function() { return getAvailableVehicles(); }
};

var NonBoardingNoticeService = {
  createNonBoardingNotice: function(data) { return createNonBoardingNotice(data); },
  getNonBoardingNoticeById: function(id) { return getNonBoardingNoticeById(id); },
  getNonBoardingNoticesByStudent: function(studentId) { return getNonBoardingNoticesByStudent(studentId); },
  updateNonBoardingNotice: function(id, data) { return updateNonBoardingNotice(id, data); },
  getAllNonBoardingNotices: function() { return getAllNonBoardingNotices(); }
};

var JobQueueService = {
  enqueueJob: function(type, payload) { return enqueueJob(type, payload); },
  getJobById: function(id) { return getJobById(id); },
  updateJobStatus: function(id, status, result, error) { return updateJobStatus(id, status, result, error); },
  getPendingJobs: function() { return getPendingJobs(); },
  processJobQueue: function() { return processJobQueue(); }
};

var OptimizationResultService = {
  saveOptimizationResult: function(data) { return saveOptimizationResult(data); },
  getOptimizationResultByJobId: function(jobId) { return getOptimizationResultByJobId(jobId); },
  getOptimizationResultsByRouteId: function(routeId) { return getOptimizationResultsByRouteId(routeId); },
  getOptimizationResultsByMonth: function(month, year) { return getOptimizationResultsByMonth(month, year); }
};

var GeminiIntegrationService = {
  generateSavingsSummary: function(reportData) { return generateSavingsSummary(reportData); },
  generateRouteChangeCommunication: function(reportData) { return generateSavingsSummary(reportData); }
};

var ReportService = {
  generateMonthlySavingsReport: function(reportData) { return generateMonthlySavingsReport(reportData); },
  generateTimeComparisonChartData: function(routeId) { return generateTimeComparisonChartData(routeId); }
};

var DashboardService = {
  getDashboardSummary: function() { return getDashboardSummary(); },
  getRecentNonBoardingNotices: function(limit) { return getRecentNonBoardingNotices(limit); },
  getOptimizationStatusSummary: function() { return getOptimizationStatusSummary(); },
  getDashboardData: function() { return getDashboardData(); }
};
