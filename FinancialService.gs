// FinancialService.gs
/**
 * @overview Gerencia aspectos financeiros do SGTE, como custos de rota, pagamentos a transportadoras e orçamentos.
 * @module FinancialService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema financeiro.
 * @requires RouteService.gs para obter dados de rotas.
 */

function recordRouteCost(routeId, date, costType, amount, description = "") {
  const costData = {
    RouteID: routeId,
    Date: date,
    CostType: costType, // e.g., "Fuel", "Maintenance", "DriverSalary"
    Amount: amount,
    Description: description,
    CreatedAt: new Date()
  };
  return DataService.createRecord("ROUTE_COSTS", costData);
}

function getCostsByRouteAndMonth(routeId, month, year) {
  try {
    const allCosts = DataService.getAllRecords("ROUTE_COSTS");
    const normalizedRouteId = String(routeId == null ? '' : routeId).trim();
    return allCosts.filter(cost => {
      const costDate = new Date(cost.Date);
      return String(cost.RouteID == null ? '' : cost.RouteID).trim() === normalizedRouteId &&
        costDate.getMonth() + 1 === month && costDate.getFullYear() === year;
    });
  } catch (error) {
    Logger.log("Erro em getCostsByRouteAndMonth: " + error.message);
    throw error;
  }
}

function calculateTotalMonthlyCost(month, year) {
  try {
    const allCosts = DataService.getAllRecords("ROUTE_COSTS");
    return allCosts.reduce((total, cost) => {
      const costDate = new Date(cost.Date);
      if (costDate.getMonth() + 1 === month && costDate.getFullYear() === year) {
        return total + cost.Amount;
      }
      return total;
    }, 0);
  } catch (error) {
    Logger.log("Erro em calculateTotalMonthlyCost: " + error.message);
    throw error;
  }
}
