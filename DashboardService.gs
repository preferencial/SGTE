/**
 * Consolida os principais indicadores operacionais do SGTE.
 * As leituras são resilientes para permitir que o dashboard carregue mesmo
 * quando uma planilha ou integração opcional ainda não estiver configurada.
 */

function getDashboardSummary() {
  const snapshot = loadDashboardSnapshot_();
  return buildDashboardSummary_(snapshot);
}

function getRecentNonBoardingNotices(limit) {
  try {
    const notices = safeDashboardRead_("avisos de não embarque", getAllNonBoardingNotices, []);
    return sortDashboardRecords_(notices, ["CreatedAt", "NoticeDate"])
      .slice(0, Number(limit) || 5);
  } catch (error) {
    Logger.log("Erro em getRecentNonBoardingNotices: " + error.message);
    throw error;
  }
}

function getOptimizationStatusSummary() {
  const jobs = safeDashboardRead_("fila de otimização", function() {
    return getAllRecords("JOB_QUEUE");
  }, []);

  return buildOptimizationSummary_(jobs);
}

function getDashboardData(month, year) {
  try {
    const now = new Date();
    const reportMonth = Number(month) || now.getMonth() + 1;
    const reportYear = Number(year) || now.getFullYear();
    const snapshot = loadDashboardSnapshot_();
    const warnings = snapshot.warnings.slice();

    const monthlyReport = safeDashboardRead_("relatório mensal", function() {
      return generateMonthlySavingsReport(reportMonth, reportYear);
    }, {
      data: {
        month: reportMonth,
        year: reportYear,
        totalTimeSaved: 0,
        totalFuelSaved: 0,
        optimizationCount: 0
      },
      summary: "Ainda não há dados de economia consolidados para este período.",
      chartData: {
        labels: ["Duração original", "Duração otimizada"],
        datasets: [{
          label: "Tempo médio de rota (minutos)",
          data: [0, 0],
          backgroundColor: ["#d7dfdb", "#2f7d57"]
        }]
      }
    }, warnings);

    return {
      summary: buildDashboardSummary_(snapshot),
      operationalHealth: buildOperationalHealth_(snapshot),
      monthlyReport: monthlyReport,
      recentNotices: enrichDashboardNotices_(snapshot.notices, snapshot.students).slice(0, 5),
      optimizationStatus: buildOptimizationSummary_(snapshot.jobs),
      recentActivity: buildRecentActivity_(snapshot),
      alerts: buildDashboardAlerts_(snapshot),
      systemStatus: safeDashboardRead_("status do sistema", getOverallSystemStatus, {
        overallStatus: "WARNING",
        details: ["Status detalhado temporariamente indisponível."]
      }, warnings),
      generatedAt: new Date().toISOString(),
      warnings: warnings
    };
  } catch (error) {
    Logger.log("Erro em getDashboardData: " + error.message);
    throw error;
  }
}

function loadDashboardSnapshot_() {
  const warnings = [];

  return {
    students: safeDashboardRead_("estudantes", getAllStudents, [], warnings),
    routes: safeDashboardRead_("rotas", getAllRoutes, [], warnings),
    vehicles: safeDashboardRead_("veículos", getAllVehicles, [], warnings),
    drivers: safeDashboardRead_("motoristas", getAllDrivers, [], warnings),
    trips: safeDashboardRead_("viagens", getAllTrips, [], warnings),
    notices: safeDashboardRead_("avisos de não embarque", getAllNonBoardingNotices, [], warnings),
    jobs: safeDashboardRead_("fila de otimização", function() {
      return getAllRecords("JOB_QUEUE");
    }, [], warnings),
    warnings: warnings
  };
}

function buildDashboardSummary_(snapshot) {
  try {
    const activeRoutes = snapshot.routes.filter(function(route) {
      return dashboardStatusMatches_(route.Status, ["active", "ativo", "ativa", "em operacao"]);
    }).length;
    const availableVehicles = snapshot.vehicles.filter(function(vehicle) {
      return dashboardStatusMatches_(vehicle.Status, ["available", "disponível", "disponivel", "ativo", "ativa"]);
    }).length;
    const availableDrivers = snapshot.drivers.filter(function(driver) {
      return dashboardStatusMatches_(driver.Status, ["available", "disponível", "disponivel", "ativo", "ativa"]);
    }).length;
    const pendingNotices = snapshot.notices.filter(function(notice) {
      return !notice.Status || dashboardStatusMatches_(notice.Status, ["pending", "pendente", "aberto"]);
    }).length;
    const pendingOptimizations = snapshot.jobs.filter(function(job) {
      return dashboardStatusMatches_(job.Status, ["pending", "processing", "pendente", "processando"]);
    }).length;

    return {
      totalStudents: snapshot.students.length,
      totalRoutes: snapshot.routes.length,
      activeRoutes: activeRoutes,
      totalVehicles: snapshot.vehicles.length,
      availableVehicles: availableVehicles,
      totalDrivers: snapshot.drivers.length,
      availableDrivers: availableDrivers,
      totalTrips: snapshot.trips.length,
      pendingNotices: pendingNotices,
      pendingOptimizations: pendingOptimizations,
      routeOccupancy: calculateRouteOccupancy_(snapshot.routes)
    };
  } catch (error) {
    Logger.log("Erro em buildDashboardSummary_: " + error.message);
    throw error;
  }
}

function buildOperationalHealth_(snapshot) {
  try {
    const summary = buildDashboardSummary_(snapshot);
    const optimization = buildOptimizationSummary_(snapshot.jobs);
    const routeAvailability = dashboardPercentage_(summary.activeRoutes, summary.totalRoutes);
    const fleetAvailability = dashboardPercentage_(summary.availableVehicles, summary.totalVehicles);
    const teamAvailability = dashboardPercentage_(summary.availableDrivers, summary.totalDrivers);
    const optimizationSuccess = dashboardPercentage_(optimization.completed, optimization.total);
    const occupancyBalance = summary.routeOccupancy > 100
      ? Math.max(0, 200 - summary.routeOccupancy)
      : Math.min(100, summary.routeOccupancy || 0);

    const measurable = [
      summary.totalRoutes ? routeAvailability : null,
      summary.totalVehicles ? fleetAvailability : null,
      summary.totalDrivers ? teamAvailability : null,
      optimization.total ? optimizationSuccess : null,
      summary.totalRoutes ? occupancyBalance : null
    ].filter(function(value) {
      return value !== null;
    });

    const score = measurable.length
      ? Math.round(measurable.reduce(function(total, value) { return total + value; }, 0) / measurable.length)
      : 0;

    return {
      score: score,
      label: score >= 85 ? "Operação estável" : score >= 65 ? "Atenção moderada" : "Requer atenção",
      metrics: [
        { label: "Rotas ativas", value: routeAvailability, detail: summary.activeRoutes + " de " + summary.totalRoutes },
        { label: "Frota disponível", value: fleetAvailability, detail: summary.availableVehicles + " de " + summary.totalVehicles },
        { label: "Motoristas disponíveis", value: teamAvailability, detail: summary.availableDrivers + " de " + summary.totalDrivers },
        { label: "Otimizações concluídas", value: optimizationSuccess, detail: optimization.completed + " de " + optimization.total }
      ]
    };
  } catch (error) {
    Logger.log("Erro em buildOperationalHealth_: " + error.message);
    throw error;
  }
}

function buildOptimizationSummary_(jobs) {
  try {
    const summary = {
      completed: 0,
      processing: 0,
      failed: 0,
      pending: 0,
      total: jobs.length
    };

    jobs.forEach(function(job) {
      const status = dashboardNormalize_(job.Status);
      if (["completed", "concluido", "concluído"].indexOf(status) !== -1) summary.completed++;
      else if (["processing", "processando", "em andamento"].indexOf(status) !== -1) summary.processing++;
      else if (["failed", "falhou", "erro"].indexOf(status) !== -1) summary.failed++;
      else if (["pending", "pendente", ""].indexOf(status) !== -1) summary.pending++;
    });

    return summary;
  } catch (error) {
    Logger.log("Erro em buildOptimizationSummary_: " + error.message);
    throw error;
  }
}

function buildDashboardAlerts_(snapshot) {
  try {
    const summary = buildDashboardSummary_(snapshot);
    const optimization = buildOptimizationSummary_(snapshot.jobs);
    const alerts = [];

    if (summary.pendingNotices > 0) {
      alerts.push({
        severity: "warning",
        icon: "person_off",
        title: summary.pendingNotices + " aviso(s) de não embarque pendente(s)",
        description: "Revise os avisos antes da próxima janela de operação.",
        route: "NonBoardingNoticeForm"
      });
    }

    if (optimization.failed > 0) {
      alerts.push({
        severity: "danger",
        icon: "error_outline",
        title: optimization.failed + " otimização(ões) com falha",
        description: "Há tarefas que precisam de análise ou reprocessamento.",
        route: "RouteOptimizationReport"
      });
    }

    if (summary.totalRoutes && summary.activeRoutes < summary.totalRoutes) {
      alerts.push({
        severity: "info",
        icon: "alt_route",
        title: (summary.totalRoutes - summary.activeRoutes) + " rota(s) fora de operação",
        description: "Confira status, veículo e motorista vinculados.",
        route: "RouteList"
      });
    }

    if (summary.totalVehicles && summary.availableVehicles < summary.totalVehicles) {
      alerts.push({
        severity: "info",
        icon: "build_circle",
        title: (summary.totalVehicles - summary.availableVehicles) + " veículo(s) indisponível(is)",
        description: "Valide manutenção e disponibilidade da frota.",
        route: "VehicleList"
      });
    }

    if (!alerts.length) {
      alerts.push({
        severity: "success",
        icon: "check_circle",
        title: "Nenhum alerta operacional crítico",
        description: "Os indicadores monitorados estão dentro do esperado.",
        route: "dashboard"
      });
    }

    return alerts.slice(0, 4);
  } catch (error) {
    Logger.log("Erro em buildDashboardAlerts_: " + error.message);
    throw error;
  }
}

function buildRecentActivity_(snapshot) {
  try {
    const activities = [];

    enrichDashboardNotices_(snapshot.notices, snapshot.students).forEach(function(notice) {
      activities.push({
        type: "notice",
        icon: "person_off",
        title: "Aviso de não embarque",
        description: notice.StudentName + ": " + (notice.Reason || "motivo não informado"),
        status: notice.Status || "Pendente",
        timestamp: dashboardTimestamp_(notice.CreatedAt || notice.NoticeDate),
        route: "NonBoardingNoticeForm"
      });
    });

    snapshot.jobs.forEach(function(job) {
      activities.push({
        type: "optimization",
        icon: "auto_awesome",
        title: "Otimização de rota",
        description: job.JobType || "Processamento de otimização",
        status: job.Status || "Pendente",
        timestamp: dashboardTimestamp_(job.CompletedAt || job.StartedAt || job.RequestedAt),
        route: "RouteOptimizationReport"
      });
    });

    snapshot.trips.forEach(function(trip) {
      activities.push({
        type: "trip",
        icon: "route",
        title: "Viagem registrada",
        description: "Rota " + (trip.RouteID || "não informada"),
        status: trip.Status || "Registrada",
        timestamp: dashboardTimestamp_(trip.StartTime || trip.CreatedAt),
        route: "TripList"
      });
    });

    return activities
      .filter(function(activity) { return activity.timestamp; })
      .sort(function(a, b) { return b.timestamp - a.timestamp; })
      .slice(0, 7)
      .map(function(activity) {
        activity.timestamp = new Date(activity.timestamp).toISOString();
        return activity;
      });
  } catch (error) {
    Logger.log("Erro em buildRecentActivity_: " + error.message);
    throw error;
  }
}

function enrichDashboardNotices_(notices, students) {
  try {
    const studentNames = {};
    students.forEach(function(student) {
      studentNames[String(student.ID)] = student.Name || ("Estudante " + student.ID);
    });

    return sortDashboardRecords_(notices, ["CreatedAt", "NoticeDate"]).map(function(notice) {
      const enriched = {};
      Object.keys(notice).forEach(function(key) { enriched[key] = notice[key]; });
      enriched.StudentName = studentNames[String(notice.StudentID)] || ("Estudante " + (notice.StudentID || "não informado"));
      return enriched;
    });
  } catch (error) {
    Logger.log("Erro em enrichDashboardNotices_: " + error.message);
    throw error;
  }
}

function calculateRouteOccupancy_(routes) {
  try {
    let capacity = 0;
    let students = 0;

    routes.forEach(function(route) {
      capacity += Number(route.Capacity) || 0;
      students += Number(route.CurrentStudents) || 0;
    });

    return dashboardPercentage_(students, capacity);
  } catch (error) {
    Logger.log("Erro em calculateRouteOccupancy_: " + error.message);
    throw error;
  }
}

function dashboardPercentage_(value, total) {
  try {
    if (!Number(total)) return 0;
    return Math.max(0, Math.round((Number(value) / Number(total)) * 100));
  } catch (error) {
    Logger.log("Erro em dashboardPercentage_: " + error.message);
    throw error;
  }
}

function dashboardStatusMatches_(status, accepted) {
  return accepted.indexOf(dashboardNormalize_(status)) !== -1;
}

function dashboardNormalize_(value) {
  try {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  } catch (error) {
    Logger.log("Erro em dashboardNormalize_: " + error.message);
    throw error;
  }
}

function dashboardTimestamp_(value) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return isNaN(timestamp) ? 0 : timestamp;
}

function sortDashboardRecords_(records, dateFields) {
  try {
    return (records || []).slice().sort(function(a, b) {
      const dateA = dateFields.reduce(function(timestamp, field) {
        return timestamp || dashboardTimestamp_(a[field]);
      }, 0);
      const dateB = dateFields.reduce(function(timestamp, field) {
        return timestamp || dashboardTimestamp_(b[field]);
      }, 0);
      return dateB - dateA;
    });
  } catch (error) {
    Logger.log("Erro em sortDashboardRecords_: " + error.message);
    throw error;
  }
}

function safeDashboardRead_(label, operation, fallback, warnings) {
  try {
    const result = operation();
    return result === undefined || result === null ? fallback : result;
  } catch (readError) {
    LoggerService.error("[DashboardService] Falha ao carregar " + label + ": " + readError.message);
    if (warnings) warnings.push("Não foi possível carregar " + label + ".");
    return fallback;
  }
}
