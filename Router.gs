/**
 * Centraliza o roteamento HTTP e aplica o layout global às páginas autenticadas.
 */

const PUBLIC_ROUTES = {
  login: "Login",
  loginpage: "Login"
};

const AUTHENTICATED_ROUTES = {
  index: "Index",
  indexpage: "Index",
  dashboard: "Dashboard",
  analyticsdashboard: "AnalyticsDashboard",
  datavalidationreport: "DataValidationReport",
  driverform: "DriverForm",
  driverlist: "DriverList",
  financialreport: "FinancialReport",
  monthlysavingsreport: "MonthlySavingsReport",
  nonboardingnoticeform: "NonBoardingNoticeForm",
  notificationtemplateform: "NotificationTemplateForm",
  notificationtemplates: "NotificationTemplates",
  permissionsmanagement: "PermissionsManagement",
  reportlist: "ReportList",
  routeform: "RouteForm",
  routelist: "RouteList",
  routemonitoring: "RouteMonitoring",
  routeoptimizationconfigform: "RouteOptimizationConfigForm",
  routeoptimizationreport: "RouteOptimizationReport",
  routeperformancereport: "RoutePerformanceReport",
  routeschedule: "RouteSchedule",
  routetriplist: "RouteTripList",
  schoolform: "SchoolForm",
  schoollist: "SchoolList",
  settings: "Settings",
  stoppointform: "StopPointForm",
  stoppointlist: "StopPointList",
  studentattendancereport: "StudentAttendanceReport",
  studentemergencycontactform: "StudentEmergencyContactForm",
  studentform: "StudentForm",
  studentgroupform: "StudentGroupForm",
  studentgrouplist: "StudentGroupList",
  studenthealthform: "StudentHealthForm",
  studentlist: "StudentList",
  studentpickupdropoffform: "StudentPickupDropoffForm",
  studentpickupdropofflist: "StudentPickupDropoffList",
  studentrouteassignment: "StudentRouteAssignment",
  studenttransportrequestform: "StudentTransportRequestForm",
  systemhealthcheck: "SystemHealthCheck",
  systemstatus: "SystemStatus",
  tripform: "TripForm",
  triplist: "TripList",
  useractivitylog: "UserActivityLog",
  userform: "UserForm",
  userlist: "UserList",
  userprofile: "UserProfile",
  usersettings: "UserSettings",
  vehicleform: "VehicleForm",
  vehiclelist: "VehicleList",
  webhookconfiguration: "WebhookConfiguration"
};

function doGet(e) {
  // FLEET_FRAGMENT_BOOTSTRAP: o token fica no fragmento (#tok=), que não é
  // enviado ao servidor. O shell valida o token antes de chamar qualquer API.
  var fleetBootstrapPage = e && e.parameter && String(e.parameter.page || '') === 'app';
  var fleetBootstrapToken = e && e.parameter && e.parameter.tok;
  if (fleetBootstrapPage && !fleetBootstrapToken) {
    var fleetTemplates = ['Index', 'index', 'Dashboard'];
    for (var fleetI = 0; fleetI < fleetTemplates.length; fleetI++) {
      try {
        var fleetTemplate = HtmlService.createTemplateFromFile(fleetTemplates[fleetI]);
        fleetTemplate.authToken = '';
        fleetTemplate.tok = '';
        fleetTemplate.sessionUser = {};
        fleetTemplate.data = { scriptUrl: ScriptApp.getService().getUrl() };
        return fleetTemplate.evaluate()
          .setTitle('Preferencial - SGTE')
          .addMetaTag('viewport', 'width=device-width, initial-scale=1');
      } catch (fleetTemplateError) {}
    }
    return HtmlService.createHtmlOutput('Aplicação indisponível.');
  }
  try {
    const parameters = e && e.parameter ? e.parameter : {};
    const tok = parameters.tok || '';

    if (isLegacyRpcRequest_(e)) {
      return handleLegacyGet_(e);
    }

    const requestedAction = String(parameters.action || parameters.page || '').trim();
    const routeKey = normalizeRoute_(requestedAction);

    if (PUBLIC_ROUTES[routeKey]) {
      return renderHtmlTemplate(PUBLIC_ROUTES[routeKey], { scriptUrl: getScriptUrl() });
    }

    const tokenUser = tok && typeof isAuthenticatedByToken === 'function' && isAuthenticatedByToken(tok)
      ? (getSessionUser(tok) || { username: 'usuario', role: 'USER' })
      : null;
    const user = tokenUser || getCurrentSessionUser();

    if (!user) {
      return renderHtmlTemplate('Login', { scriptUrl: getScriptUrl() });
    }

    const effectiveRoute = (!routeKey || routeKey === 'app') ? 'dashboard' : routeKey;
    const pageName = AUTHENTICATED_ROUTES[effectiveRoute];
    if (!pageName) {
      return renderHtmlTemplate('ErrorPage', { message: 'A página solicitada não existe.' });
    }

    parameters.authToken = tok;
    return renderAuthenticatedTemplate(pageName, parameters, user, effectiveRoute);
  } catch (error) {
    Logger.log("Erro em doGet: " + error.message);
    throw error;
  }
}


function normalizeRoute_(route) {
  try {
    return String(route || "")
      .replace(/Page$/i, "")
      .replace(/[^a-z0-9]/gi, "")
      .toLowerCase();
  } catch (error) {
    Logger.log("Erro em normalizeRoute_: " + error.message);
    throw error;
  }
}

function isLegacyRpcRequest_(request) {
  return request && request.action && !request.parameter;
}

function handleLegacyGet_(request) {
  try {
    const action = normalizeRoute_(request.action);
    const user = getCurrentSessionUser();
    let result;

    if (!user) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    switch (action) {
      case "dashboard":
        result = getDashboardSummary();
        break;
      case "getmonthlysavingsreport":
        result = generateMonthlySavingsReport(Number(request.month), Number(request.year));
        break;
      case "getrecentnonboardingnotices":
        result = getRecentNonBoardingNotices(Number(request.limit) || 5);
        break;
      case "getstudents":
        result = getAllStudents();
        break;
      case "getroutes":
        result = getAllRoutes();
        break;
      case "getdrivers":
        result = getAllDrivers();
        break;
      case "getvehicles":
        result = getAllVehicles();
        break;
      case "getschools":
        result = getAllSchools();
        break;
      case "gettrips":
        result = getAllTrips();
        break;
      case "getallusers":
        if (String(user.Role || "").toLowerCase() !== "admin") {
          throw new Error("Acesso permitido apenas para administradores.");
        }
        result = getAllUsers().map(sanitizeUserForClient_);
        break;
      case "getuserprofile":
        result = sanitizeUserForClient_(user);
        break;
      case "getsystemstatus":
        result = getOverallSystemStatus();
        break;
      case "runsystemhealthcheck":
        result = performFullHealthCheck();
        break;
      default:
        if (AUTHENTICATED_ROUTES[action]) {
          result = renderPartialTemplate(AUTHENTICATED_ROUTES[action], request);
          break;
        }
        throw new Error(`Ação de leitura não suportada: ${request.action}`);
    }

    return toClientSafe_(result);
  } catch (error) {
    Logger.log("Erro em handleLegacyGet_: " + error.message);
    throw error;
  }
}
