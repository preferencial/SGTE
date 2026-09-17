// ConfigurationManager.gs
/**
 * @overview Gerencia configurações dinâmicas do sistema SGTE que podem ser alteradas em tempo de execução sem modificar o código.
 *           Armazena configurações em uma planilha dedicada ou em PropertiesService.
 * @module ConfigurationManager
 * @requires DataService.gs para operações genéricas de planilha (se as configurações forem armazenadas em planilha).
 * @requires PropertiesService (serviço nativo do Apps Script para propriedades de script).
 */

function getSystemSetting(key) {
  try {
    // Prioriza configurações de script, depois de planilha, depois valores padrão
    let value = PropertiesService.getScriptProperties().getProperty(key);
    if (value) return value;

    // Se as configurações forem armazenadas em uma planilha, descomente e implemente:
    // const settings = DataService.getAllRecords("SETTINGS");
    // const setting = settings.find(s => s.Key === key);
    // if (setting) return setting.Value;

    return null; // Retorna null se a configuração não for encontrada
  } catch (error) {
    Logger.log("Erro em getSystemSetting: " + error.message);
    throw error;
  }
}

function setSystemSetting(key, value) {
  try {
    // Armazena a configuração no PropertiesService
    PropertiesService.getScriptProperties().setProperty(key, value);
    // Se as configurações forem armazenadas em uma planilha, descomente e implemente:
    // DataService.updateRecord("SETTINGS", key, { Value: value });
  } catch (error) {
    Logger.log("Erro em setSystemSetting: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}

function initializeDefaultSettings() {
  // Define configurações padrão se elas não existirem
  if (!getSystemSetting("OPTIMIZATION_THRESHOLD_MINUTES")) {
    setSystemSetting("OPTIMIZATION_THRESHOLD_MINUTES", "15"); // Exemplo: tempo mínimo para otimização
  }
  if (!getSystemSetting("REPORT_EMAIL_RECIPIENT")) {
    setSystemSetting("REPORT_EMAIL_RECIPIENT", "admin@example.com");
  }
}
