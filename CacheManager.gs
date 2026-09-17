// CacheManager.gs
/**
 * @overview Gerencia o cache de dados no SGTE para melhorar o desempenho do sistema, reduzindo acessos repetitivos à planilha.
 * @module CacheManager
 * @requires CacheService (serviço nativo do Apps Script).
 * @requires Logger.gs para registro de operações.
 */

function getFromCache(key) {
  try {
    const cache = CacheService.getScriptCache();
    const value = cache.get(key);
    if (value) {
      Logger.info(`Cache Hit para a chave: ${key}`);
      return JSON.parse(value);
    }
    Logger.info(`Cache Miss para a chave: ${key}`);
    return null;
  } catch (error) {
    Logger.log("Erro em getFromCache: " + error.message);
    throw error;
  }
}

function putInCache(key, value, expirationInSeconds = 3600) {
  try {
    const cache = CacheService.getScriptCache();
    cache.put(key, JSON.stringify(value), expirationInSeconds);
    Logger.info(`Valor armazenado em cache para a chave: ${key} com expiração de ${expirationInSeconds} segundos.`);
  } catch (error) {
    Logger.log("Erro em putInCache: " + error.message);
    throw error;
  }
}

function removeFromCache(key) {
  try {
    const cache = CacheService.getScriptCache();
    cache.remove(key);
    Logger.info(`Valor removido do cache para a chave: ${key}`);
  } catch (error) {
    Logger.log("Erro em removeFromCache: " + error.message);
    throw error;
  }
}

function clearAllCache() {
  try {
    const cache = CacheService.getScriptCache();
    cache.removeAll();
    Logger.info("Todo o cache foi limpo.");
  } catch (error) {
    Logger.log("Erro em clearAllCache: " + error.message);
    throw error;
  }
}
