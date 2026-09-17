// DataValidationService.gs
/**
 * @overview Fornece funções para aplicar regras de validação de dados em planilhas do SGTE, garantindo a integridade e consistência dos dados.
 * @module DataValidationService
 * @requires SpreadsheetApp (serviço nativo do Apps Script).
 * @requires ConfigService.gs para obter o ID da planilha.
 * @requires SchemaService.gs para obter esquemas de dados.
 */

function applyDataValidationRules(entityName) {
  try {
    const sheet = SpreadsheetApp.openById(ConfigService.getSpreadsheetId()).getSheetByName(ConfigService.getSheetName(entityName));
    if (!sheet) {
      Logger.warn(`Planilha ${entityName} não encontrada para aplicar validação de dados.`);
      return;
    }

    const schema = SchemaService.getSchema(entityName);
    const headers = schema.headers;

    // Exemplo: Aplicar validação para campos de tipo 'number' ou 'date'
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const type = schema.types[header];
      const range = sheet.getRange(2, i + 1, sheet.getMaxRows() - 1, 1); // Ignora o cabeçalho

      if (type === "number") {
        const rule = SpreadsheetApp.newDataValidation().requireNumber().setAllowInvalid(false).build();
        range.setDataValidation(rule);
      } else if (type === "date") {
        const rule = SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build();
        range.setDataValidation(rule);
      } else if (type === "boolean") {
        const rule = SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build();
        range.setDataValidation(rule);
      }
      // Adicionar mais tipos de validação conforme necessário (e.g., dropdowns para roles)
    }
    Logger.info(`Regras de validação de dados aplicadas para a entidade ${entityName}.`);
  } catch (error) {
    Logger.log("Erro em applyDataValidationRules: " + error.message);
    throw error;
  }
}

function applyAllDataValidationRules() {
  const schemas = SchemaService.getSchemas();
  for (const entityName in schemas) {
    applyDataValidationRules(entityName);
  }
}
