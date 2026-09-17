// UserService.gs
/**
 * @overview Fornece operações CRUD para a entidade 'Usuário' na Google Planilha do SGTE.
 *           Inclui métodos para criar, ler, atualizar e desativar registros de usuários.
 * @module UserService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de usuário.
 */

function getUserById(userId) {
  try {
    return getRecordById("USERS", Number(userId));
  } catch (error) {
    Logger.log("Erro em getUserById: " + error.message);
    throw error;
  }
}

function getUserByUsername(username) {
  try {
    const normalized = String(username || "").trim().toLowerCase();
    return getAllRecords("USERS").find(user =>
      String(user.Username || "").trim().toLowerCase() === normalized
    ) || null;
  } catch (error) {
    Logger.log("Erro em getUserByUsername: " + error.message);
    throw error;
  }
}

function createUser(userData) {
  if (getUserByUsername(userData.Username)) {
    throw new Error("Já existe um usuário com esse nome.");
  }
  return createRecord("USERS", userData);
}

function updateUser(userId, userData) {
  try {
    const updates = Object.assign({}, userData);
    delete updates.ID;
    return updateRecord("USERS", Number(userId), updates);
  } catch (error) {
    Logger.log("Erro em updateUser: " + error.message);
    throw error;
  }
}

function deactivateUser(userId) {
  try {
    return updateRecord("USERS", Number(userId), { Status: "Inactive" });
  } catch (error) {
    Logger.log("Erro em deactivateUser: " + error.message);
    throw error;
  }
}

function getAllUsers() {
  return getAllRecords("USERS");
}
