// UserManagementService.gs
/**
 * @overview Gerencia as operações de alto nível relacionadas a usuários no SGTE, como criação, edição e exclusão de usuários, incluindo a atribuição de papéis.
 * @module UserManagementService
 * @requires UserService.gs para operações CRUD de usuários.
 * @requires UserRoleService.gs para atribuição de papéis.
 * @requires AuditService.gs para registro de auditoria.
 * @requires Logger.gs para registro de operações.
 */

function createUser(username, password, role) {
  try {
    Logger.info(`Criando usuário: ${username} com papel: ${role}`);
    const newUser = UserService.createUser({ Username: username, Password: password, Role: role });
    AuditService.logAudit(Session.getActiveUser().getEmail(), "CREATE_USER", "User", newUser.ID, `Usuário ${username} criado com papel ${role}.`);
    return newUser;
  } catch (error) {
    Logger.log("Erro em createUser: " + error.message);
    throw error;
  }
}

function updateUser(userId, updates) {
  try {
    Logger.info(`Atualizando usuário: ${userId}`);
    const updatedUser = UserService.updateUser(userId, updates);
    AuditService.logAudit(Session.getActiveUser().getEmail(), "UPDATE_USER", "User", userId, `Usuário ${userId} atualizado.`);
    return updatedUser;
  } catch (error) {
    Logger.log("Erro em updateUser: " + error.message);
    throw error;
  }
}

function deleteUser(userId) {
  try {
    Logger.info(`Deletando usuário: ${userId}`);
    const deleted = UserService.deactivateUser(userId); // Assumindo desativação lógica
    if (deleted) {
      AuditService.logAudit(Session.getActiveUser().getEmail(), "DELETE_USER", "User", userId, `Usuário ${userId} desativado.`);
    }
    return deleted;
  } catch (error) {
    Logger.log("Erro em deleteUser: " + error.message);
    throw error;
  }
}

function assignRole(userId, role) {
  try {
    Logger.info(`Atribuindo papel ${role} ao usuário ${userId}.`);
    const updatedUser = UserRoleService.assignRoleToUser(userId, role);
    AuditService.logAudit(Session.getActiveUser().getEmail(), "ASSIGN_ROLE", "User", userId, `Papel ${role} atribuído ao usuário ${userId}.`);
    return updatedUser;
  } catch (error) {
    Logger.log("Erro em assignRole: " + error.message);
    throw error;
  }
}

function listAllUsers() {
  return UserService.getAllUsers();
}
