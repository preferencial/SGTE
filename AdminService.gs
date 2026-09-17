// AdminService.gs
/**
 * @overview Fornece funcionalidades administrativas no SGTE, como gerenciamento de usuários, redefinição de senhas (em texto plano, conforme solicitado), e acesso a logs do sistema.
 * @module AdminService
 * @requires UserService.gs para gerenciamento de usuários.
 * @requires Logger.gs para acesso a logs.
 */

function resetUserPassword(userId, newPassword) {
  // Implementação para redefinir a senha de um usuário
  // Nota: A senha será armazenada em texto plano conforme o requisito do projeto.
  // Em um ambiente de produção, esta funcionalidade deveria usar hashing forte como ARGON2ID.
  Logger.warn(`Redefinição de senha para o usuário ${userId}. Senha em texto plano.`);
  return UserService.updateUser(userId, { Password: newPassword });
}

function listAllUsersForAdmin() {
  // Retorna uma lista completa de usuários para a interface administrativa
  return UserService.getAllUsers();
}

function viewSystemLogs(level = "INFO", limit = 100) {
  try {
    // Retorna os logs do sistema, com opções de filtro por nível e limite
    const allLogs = DataService.getAllRecords("LOGS");
    return allLogs.filter(log => log.Level === level).slice(0, limit);
  } catch (error) {
    Logger.log("Erro em viewSystemLogs: " + error.message);
    throw error;
  }
}

function createUserAccount(username, password, role) {
  // Cria uma nova conta de usuário com a senha em texto plano
  Logger.info(`Criando nova conta de usuário para ${username} com a role ${role}. Senha em texto plano.`);
  return UserService.createUser({ Username: username, Password: password, Role: role });
}
