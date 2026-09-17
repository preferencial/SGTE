// UserRoleService.gs
/**
 * @overview Gerencia as roles (papéis) dos usuários no SGTE, permitindo controle de acesso baseado em permissões.
 * @module UserRoleService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de usuário.
 */

function getUserRole(userId) {
  const user = UserService.getUserById(userId);
  return user ? user.Role : null;
}

function isUserInRole(userId, role) {
  const userRole = getUserRole(userId);
  return userRole === role;
}

function assignRoleToUser(userId, newRole) {
  // Implementação para atribuir uma nova role a um usuário
  return UserService.updateUser(userId, { Role: newRole });
}

function getAllRoles() {
  // Em um sistema simples, as roles podem ser hardcoded ou vir de uma configuração
  return ["Admin", "Family", "Transporter"];
}
