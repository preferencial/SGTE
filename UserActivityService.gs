// UserActivityService.gs
/**
 * @overview Registra e monitora a atividade dos usuários no SGTE para fins de auditoria e análise de uso.
 * @module UserActivityService
 * @requires DataService.gs para operações de escrita na planilha de atividades do usuário.
 * @requires SchemaService.gs para validação de esquema de atividade do usuário.
 */

function logUserActivity(userId, activityType, details = "") {
  const activityEntry = {
    Timestamp: new Date(),
    UserID: userId,
    ActivityType: activityType,
    Details: details
  };
  return DataService.createRecord("USER_ACTIVITY", activityEntry);
}

function getUserActivity(userId, limit = 100) {
  try {
    const allActivities = DataService.getAllRecords("USER_ACTIVITY");
    const normalizedUserId = String(userId == null ? '' : userId).trim();
    return allActivities.filter(activity => String(activity.UserID == null ? '' : activity.UserID).trim() === normalizedUserId).slice(0, limit);
  } catch (error) {
    Logger.log("Erro em getUserActivity: " + error.message);
    throw error;
  }
}

function getRecentActivities(limit = 100) {
  try {
    const allActivities = DataService.getAllRecords("USER_ACTIVITY");
    return allActivities.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp)).slice(0, limit);
  } catch (error) {
    Logger.log("Erro em getRecentActivities: " + error.message);
    throw error;
  }
}
