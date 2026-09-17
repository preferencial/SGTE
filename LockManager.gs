// LockManager.gs
/**
 * @overview Gerencia bloqueios para operações críticas no SGTE, garantindo que apenas uma instância de uma função seja executada por vez, evitando conflitos de dados.
 * @module LockManager
 * @requires LockService (serviço nativo do Apps Script).
 * @requires Logger.gs para registro de operações.
 */

function acquireLock(lockName, timeout = 30000) {
  try {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(timeout); // Espera pelo bloqueio por até 'timeout' milissegundos
      Logger.info(`Bloqueio '${lockName}' adquirido.`);
      return lock;
    } catch (e) {
      Logger.error(`Não foi possível adquirir o bloqueio '${lockName}' dentro do tempo limite: ${e.message}`);
      throw new Error(`Não foi possível adquirir o bloqueio '${lockName}'.`);
    }
  } catch (error) {
    Logger.log("Erro em acquireLock: " + error.message);
    throw error;
  }
}

function releaseLock(lock) {
  if (lock) {
    lock.releaseLock();
    Logger.info("Bloqueio liberado.");
  }
}

function withLock(lockName, func, timeout = 30000) {
  let lock = null;
  try {
    lock = acquireLock(lockName, timeout);
    return func();
  } finally {
    releaseLock(lock);
  }
}
