// SessionService.gs
/**
 * @overview Gerencia as sessões de usuário no SGTE, incluindo a criação de tokens de sessão, validação de sessões ativas e encerramento de sessões.
 *           Os tokens de sessão são armazenados de forma segura (por exemplo, em propriedades de script ou cache).
 * @module SessionService
 * @requires CacheService (serviço nativo do Apps Script para cache).
 * @requires PropertiesService (serviço nativo do Apps Script para propriedades de script).
 */

const CURRENT_SESSION_KEY = "SGTE_CURRENT_SESSION";
const SESSION_TTL_SECONDS = 21600;

function createSession(userId) {
  try {
    const user = getUserById(Number(userId));
    if (!user) {
      throw new Error("Não foi possível criar a sessão: usuário inexistente.");
    }

    const session = {
      userId: user.ID,
      user: sanitizeUserForClient_(user),
      createdAt: new Date().toISOString()
    };

    CacheService.getUserCache().put(
      CURRENT_SESSION_KEY,
      JSON.stringify(session),
      SESSION_TTL_SECONDS
    );
    return session;
  } catch (error) {
    Logger.log("Erro em createSession: " + error.message);
    throw error;
  }
}

function getSession() {
  try {
    try {
      const serialized = CacheService.getUserCache().get(CURRENT_SESSION_KEY);
      if (!serialized) {
        return null;
      }

      try {
        return JSON.parse(serialized);
      } catch (parseError) {
        invalidateSession();
        return null;
      }
    } catch (error) {
      Logger.log("Erro em getSession: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em getSession: " + error.message);
    throw error;
  }
}

function invalidateSession() {
  CacheService.getUserCache().remove(CURRENT_SESSION_KEY);
}

function getCurrentSessionUser() {
  try {
    const session = getSession();
    if (!session || !session.userId) {
      return null;
    }

    const user = getUserById(Number(session.userId));
    const status = user ? String(user.Status || user.Ativo || "").trim().toLowerCase() : "";
    const inactive = status === "inactive" || status === "inativo" ||
      status === "false" || status === "0" || status === "nao" || status === "não";
    if (!user || inactive) {
      invalidateSession();
      return null;
    }
    return user;
  } catch (error) {
    Logger.log("Erro em getCurrentSessionUser: " + error.message);
    throw error;
  }
}
