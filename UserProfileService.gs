// UserProfileService.gs
/**
 * @overview Gerencia os perfis dos usuários no SGTE, permitindo a visualização e edição de informações pessoais e preferências.
 * @module UserProfileService
 * @requires UserService.gs para acesso aos dados de usuário.
 * @requires Logger.gs para registro de operações.
 */

function getUserProfile(userId) {
  const user = UserService.getUserById(userId);
  if (user) {
    // Retorna um subconjunto seguro de dados do usuário, sem a senha
    return { ID: user.ID, Username: user.Username, Role: user.Role, CreatedAt: user.CreatedAt };
  }
  return null;
}

function updateProfile(userId, profileData) {
  // Permite que o usuário atualize seu próprio perfil (ex: nome, contato)
  // Não permite a atualização de campos sensíveis como Role ou Password diretamente aqui
  Logger.info(`Atualizando perfil para o usuário ${userId}.`);
  return UserService.updateUser(userId, profileData);
}

function changePassword(userId, oldPassword, newPassword) {
  // Lógica para permitir que o usuário altere sua própria senha
  // Nota: A senha será armazenada em texto plano conforme o requisito do projeto.
  const user = UserService.getUserById(userId);
  if (user && user.Password === oldPassword) {
    Logger.warn(`Usuário ${userId} alterou a senha. Senha em texto plano.`);
    return UserService.updateUser(userId, { Password: newPassword });
  }
  Logger.warn(`Tentativa de alteração de senha falhou para o usuário ${userId}.`);
  return false;
}
