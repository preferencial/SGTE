// Logger.gs
/**
 * @overview Fornece um serviço de log centralizado para registrar eventos do sistema, erros e atividades importantes no SGTE.
 *           Os logs são armazenados em uma planilha dedicada.
 * @module Logger
 * @requires DataService.gs para operações de escrita na planilha de logs.
 * @requires SchemaService.gs para validação de esquema de logs.
 * @requires ConfigService.gs para obter o nome da planilha de logs.
 */

function log(message, level = "INFO", context = "") {
  const logEntry = {
    Timestamp: new Date(),
    Level: level,
    Message: message,
    Context: context
  };
  
  try {
    // Usar DataService para gravar o log na planilha de logs
    // Precisa garantir que DataService.createRecord não chame Logger.log recursivamente
    const spreadsheetId = getSpreadsheetId();
    const sheet = spreadsheetId
      ? SpreadsheetApp.openById(spreadsheetId).getSheetByName(getSheetName("LOGS"))
      : null;
    if (sheet) {
      const schema = getSchema("LOGS");
      const headers = schema.headers;
      const rowData = headers.map(header => logEntry[header] !== undefined ? logEntry[header] : "");
      sheet.appendRow(rowData);
    } else {
      // Fallback para log do Apps Script se a planilha de logs não estiver disponível
      console.log(`[${level}] ${new Date().toISOString()} - ${message} (Context: ${context})`);
    }
  } catch (e) {
    // Se houver um erro ao gravar o log na planilha, usar o log padrão do Apps Script
    console.error(`[ERROR] Falha ao gravar log na planilha: ${e.message}. Log original: [${level}] ${new Date().toISOString()} - ${message} (Context: ${context})`);
  }
}

function info(message, context = "") {
  log(message, "INFO", context);
}

function warn(message, context = "") {
  log(message, "WARN", context);
}

function error(message, context = "") {
  log(message, "ERROR", context);
}
