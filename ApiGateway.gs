/**
 * Gateway RPC do frontend e endpoint HTTP para integrações externas.
 */

function apiCall(service, method, payload) {
  try {
    const request = payload || {};
    const publicCall = service === "AuthService" && method === "login";

    try {
      if (!publicCall && !getCurrentSessionUser()) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      let data;
      const operation = `${service}.${method}`;

      switch (operation) {
        case "AuthService.login":
          data = doLogin(
            String(request.username || "").trim(),
            String(request.password || "").trim()
          );
          if (!data || data.success === false) throw new Error("Usuário ou senha inválidos.");
          break;
        case "AuthService.logout":
          data = doLogout();
          break;
        case "SessionService.getCurrentUser":
          const currentUser = getCurrentSessionUser();
          if (!currentUser) {
            throw new Error("Sessão expirada. Faça login novamente.");
          }
          data = sanitizeUserForClient_(currentUser);
          break;
        case "DashboardService.getDashboardData":
          data = getDashboardData(request.month, request.year);
          break;
        case "DashboardService.getDashboardSummary":
          data = getDashboardSummary();
          break;
        case "DashboardService.getRecentNonBoardingNotices":
          data = getRecentNonBoardingNotices(request.limit || 5);
          break;
        case "StudentService.getAll":
          data = getAllStudents();
          break;
        case "StudentService.deactivate":
          data = deactivateStudent(Number(request.id));
          break;
        case "RouteService.getAll":
          data = getAllRoutes();
          break;
        case "RouteService.deactivate":
          data = deactivateRoute(Number(request.id));
          break;
        case "SystemStatusService.getOverallStatus":
          data = getOverallSystemStatus();
          break;
        case "ReportService.generateMonthlySavingsReport":
          data = generateMonthlySavingsReport(request.month, request.year);
          break;
        case "GeminiIntegrationService.generateRouteChangeCommunication":
          requireTransportManagementRole_(getCurrentSessionUser());
          data = generateSavingsSummary(request);
          break;
        default:
          throw new Error(`Operação de API não permitida: ${operation}`);
      }

      return {
        ok: true,
        data: toClientSafe_(data)
      };
    } catch (apiError) {
      error(apiError.message, `${service}.${method}`);
      return {
        ok: false,
        error: {
          message: apiError.message || "Erro interno do servidor."
        }
      };
    }
  } catch (error) {
    Logger.log("Erro em apiCall: " + error.message);
    throw error;
  }
}

function requireTransportManagementRole_(user) {
  try {
    const role = String(user && (user.Role || user.role || user.Perfil || user.perfil) || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const allowed = ["admin", "administrador", "gestor", "gestao", "coordenador", "coordenacao"];
    if (allowed.indexOf(role) === -1) {
      throw new Error("Apenas a gestão de transporte pode gerar comunicados de alteração de rota.");
    }
  } catch (error) {
    Logger.log("Erro em requireTransportManagementRole_: " + error.message);
    throw error;
  }
}

function doPost(e) {
  try {
    if (isLegacyRpcRequest_(e)) {
      return handleLegacyPost_(e);
    }

    const parameters = e && e.parameter ? e.parameter : {};
    const body = parseRequestBody_(e);
    const action = String(parameters.action || body.action || "");
    const webhookType = String(parameters.type || body.type || "");

    if (webhookType) {
      return handleWebhookRequest(e);
    }

    try {
      let result;
      if (action === "login") {
        result = doLogin(body.username, body.password);
      } else if (action === "logout") {
        result = doLogout();
      } else {
        throw new Error("Ação POST não encontrada.");
      }
      return jsonOutput_({ success: true, data: toClientSafe_(result) });
    } catch (postError) {
      error(postError.message, `doPost:${action}`);
      return jsonOutput_({ success: false, message: postError.message });
    }
  } catch (error) {
    Logger.log("Erro em doPost: " + error.message);
    throw error;
  }
}

/**
 * Handler para requisições GET (leitura de dados)
 */
function doGet(e) {
  try {
    const user = getCurrentSessionUser();
    const parameters = e && e.parameter ? e.parameter : {};
    const action = String(parameters.action || "").toLowerCase();

    // Requer autenticação para todas as operações GET
    if (!user) {
      return jsonOutput_({ 
        success: false, 
        message: "Sessão expirada. Faça login novamente." 
      });
    }

    let result;

    switch (action) {
      case "gettripbyid":
        const tripId = Number(parameters.id);
        if (!tripId) {
          throw new Error("ID da viagem é obrigatório");
        }
        result = getTripById(tripId);
        break;

      case "getroutemonitoringdata":
        const routeId = Number(parameters.routeId);
        if (!routeId) {
          throw new Error("ID da rota é obrigatório");
        }
        result = getRouteMonitoringDataSafe(routeId);
        break;

      default:
        throw new Error(`Ação GET não suportada: ${action}`);
    }

    return jsonOutput_({ 
      success: true, 
      data: toClientSafe_(result) 
    });

  } catch (error) {
    Logger.log("Erro em doGet: " + error.message);
    return jsonOutput_({ 
      success: false, 
      message: error.message || "Erro interno do servidor." 
    });
  }
}

/**
 * Função auxiliar para obter dados de monitoramento de rota com segurança
 */
function getRouteMonitoringDataSafe(routeId) {
  try {
    // Busca a rota
    const route = DataService.getRecordById("ROUTES", routeId);
    if (!route) {
      throw new Error("Rota não encontrada");
    }

    // Retorna dados de monitoramento
    return {
      routeId: routeId,
      routeName: route.Name || route.RouteName || "Desconhecida",
      status: route.Status || "Unknown",
      currentLocation: {
        latitude: route.CurrentLatitude || null,
        longitude: route.CurrentLongitude || null
      },
      eta: route.ETA || null,
      lastUpdate: route.UpdatedAt || route.LastUpdate || null
    };
  } catch (error) {
    Logger.log("Erro em getRouteMonitoringDataSafe: " + error.message);
    throw error;
  }
}

function handleLegacyPost_(request) {
  try {
    const user = getCurrentSessionUser();
    const action = normalizeRoute_(request.action);
    const payload = typeof request.postData === "string"
      ? JSON.parse(request.postData || "{}")
      : (request.postData || {});
    let result;

    if (action !== "login" && !user) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    switch (action) {
      case "login":
        result = doLogin(payload.username, payload.password);
        break;
      case "logout":
        result = doLogout();
        break;
      case "submitform":
        result = handleFormSubmission(payload.formName, payload.data);
        break;
      case "createstudent":
        result = createStudent(payload);
        break;
      case "updatestudent":
        result = updateStudent(Number(payload.id), payload);
        break;
      case "deactivatestudent":
        result = deactivateStudent(Number(payload.id));
        break;
      case "createroute":
        result = createRoute(payload);
        break;
      case "updateroute":
        result = updateRoute(Number(payload.id), payload);
        break;
      case "deactivateroute":
        result = deactivateRoute(Number(payload.id));
        break;
      case "registernonboardingnotice":
        result = createNonBoardingNotice(payload);
        break;
      case "createtrip":
        result = createTripRecord(payload);
        break;
      case "updatetrip":
        result = updateTripRecord(Number(payload.id), payload.data || payload);
        break;
      default:
        throw new Error(`Ação de escrita não suportada: ${request.action}`);
    }

    return toClientSafe_(result);
  } catch (error) {
    Logger.log("Erro em handleLegacyPost_: " + error.message);
    throw error;
  }
}

function parseRequestBody_(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return {};
    }

    try {
      return JSON.parse(e.postData.contents);
    } catch (parseError) {
      throw new Error("Corpo JSON inválido.");
    }
  } catch (error) {
    Logger.log("Erro em parseRequestBody_: " + error.message);
    throw error;
  }
}

function toClientSafe_(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(toClientSafe_);
  }
  if (value && typeof value === "object") {
    const safe = {};
    Object.keys(value).forEach(key => {
      safe[key] = toClientSafe_(value[key]);
    });
    return safe;
  }
  return value;
}

function jsonOutput_(payload) {
  try {
    try {
      return ContentService.createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
      Logger.log("Erro em jsonOutput_: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em jsonOutput_: " + error.message);
    throw error;
  }
}
