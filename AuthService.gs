// AuthService.gs
/**
 * @overview Gerencia o processo de autenticação de usuários no Sistema de Gestão de Transporte Escolar (SGTE).
 *           Verifica credenciais (usuário e senha em texto plano) contra a planilha de usuários, cria e valida sessões de usuário.
 * @module AuthService
 * @requires UserService.gs para acesso aos dados de usuário.
 * @requires SessionService.gs para gerenciar sessões de usuário.
 */

function doLogin(username, password) {
  try {
    const normalizedUsername = String(username || "").trim();
    const suppliedPassword = String(password || "");

    if (!normalizedUsername || !suppliedPassword) {
      return { success: false, message: "Informe usuário e senha." };
    }

    const user = getUserByUsername(normalizedUsername);
    const storedPassword = user ? String(user.Password || user.Senha || "") : "";
    const status = user ? String(user.Status || user.Ativo || "").trim().toLowerCase() : "";
    const inactive = status === "inactive" || status === "inativo" ||
      status === "false" || status === "0" || status === "nao" || status === "não";
    if (!user || storedPassword !== suppliedPassword || inactive) {
      warn(`Falha de login para o usuário ${normalizedUsername}.`, "AuthService.doLogin");
      return { success: false, message: "Usuário ou senha inválidos." };
    }

    createSession(user.ID);
    info(`Login realizado por ${normalizedUsername}.`, "AuthService.doLogin");
    return {
      success: true,
      user: sanitizeUserForClient_(user)
    };
  } catch (error) {
    Logger.log("Erro em doLogin: " + error.message);
    throw error;
  }
}

function doLogout() {
  invalidateSession();
  return { success: true };
}

function isAuthenticated() {
  return Boolean(getCurrentSessionUser());
}
