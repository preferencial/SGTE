// RouteOptimizationConfigService.gs
/**
 * @overview Gerencia as configurações específicas para o motor de otimização de rotas no SGTE.
 *           Permite ajustar parâmetros como velocidade média, custos de combustível, etc.
 * @module RouteOptimizationConfigService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de configuração de otimização.
 */

function getOptimizationConfig() {
  // Retorna as configurações de otimização (pode ser de uma planilha ou hardcoded)
  const config = DataService.getAllRecords("OPTIMIZATION_CONFIG");
  if (config && config.length > 0) {
    return config[0]; // Assume uma única linha de configuração
  }
  return {
    averageSpeedKmH: 30,
    fuelCostPerLiter: 5.50,
    vehicleFuelEfficiencyKmPerLiter: 5,
    optimizationAlgorithm: "HybridHeuristic",
    // Outras configurações
  };
}

function updateOptimizationConfig(updates) {
  // Atualiza as configurações de otimização
  const currentConfig = getOptimizationConfig();
  if (currentConfig.ID) {
    return DataService.updateRecord("OPTIMIZATION_CONFIG", currentConfig.ID, updates);
  } else {
    // Se não houver, cria uma nova entrada de configuração
    return DataService.createRecord("OPTIMIZATION_CONFIG", updates);
  }
}
