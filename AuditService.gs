// AuditService.gs
/**
 * @overview Registra todas as ações importantes realizadas no sistema SGTE para fins de auditoria e conformidade com a LGPD [1].
 * @module AuditService
 * @requires DataService.gs para operações de escrita na planilha de logs de auditoria.
 * @requires SchemaService.gs para validação de esquema de logs de auditoria.
 * @requires ConfigService.gs para obter o nome da planilha de logs de auditoria.
 */

function logAudit(userId, action, entity, entityId = null, details = "") {
  const auditEntry = {
    Timestamp: new Date(),
    UserID: userId,
    Action: action,
    Entity: entity,
    EntityID: entityId,
    Details: details
  };
  
  try {
    // Usar DataService para gravar o log na planilha de logs de auditoria
    const sheet = SpreadsheetApp.openById(ConfigService.getSpreadsheetId()).getSheetByName(ConfigService.getSheetName("AUDIT_LOGS"));
    if (sheet) {
      const schema = SchemaService.getSchema("AUDIT_LOGS");
      const headers = schema.headers;
      const rowData = headers.map(header => auditEntry[header] !== undefined ? auditEntry[header] : "");
      sheet.appendRow(rowData);
    } else {
      console.error(`[ERROR] Falha ao gravar log de auditoria na planilha: Planilha ${ConfigService.getSheetName("AUDIT_LOGS")} não encontrada.`);
    }
  } catch (e) {
    console.error(`[ERROR] Falha ao gravar log de auditoria: ${e.message}. Log original: ${JSON.stringify(auditEntry)}`);
  }
}

function logLoginSuccess(userId) {
  logAudit(userId, "LOGIN_SUCCESS", "User", userId, "Usuário logado com sucesso.");
}

function logLoginFailure(username) {
  logAudit(null, "LOGIN_FAILURE", "User", null, `Tentativa de login falhou para o usuário: ${username}.`);
}

function logStudentCreation(userId, studentId) {
  logAudit(userId, "CREATE", "Student", studentId, `Estudante com ID ${studentId} criado.`);
}

function logRouteUpdate(userId, routeId) {
  logAudit(userId, "UPDATE", "Route", routeId, `Rota com ID ${routeId} atualizada.`);
}
