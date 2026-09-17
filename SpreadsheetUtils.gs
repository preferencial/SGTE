// SpreadsheetUtils.gs
/**
 * @overview Funções utilitárias específicas para manipulação de planilhas no SGTE que não se encaixam no DataService.gs genérico.
 * @module SpreadsheetUtils
 * @requires SpreadsheetApp (serviço nativo do Apps Script).
 * @requires ConfigService.gs para obter o ID da planilha principal.
 */

function getActiveSpreadsheet() {
  try {
    return SpreadsheetApp.openById(ConfigService.getSpreadsheetId());
  } catch (error) {
    Logger.log("Erro em getActiveSpreadsheet: " + error.message);
    throw error;
  }
}

function applyConditionalFormatting(sheetName, rangeA1, rule) {
  try {
    const sheet = getActiveSpreadsheet().getSheetByName(sheetName);
    if (sheet) {
      const range = sheet.getRange(rangeA1);
      const rules = sheet.getConditionalFormatRules();
      rules.push(rule);
      sheet.setConditionalFormatRules(rules);
    }
  } catch (error) {
    Logger.log("Erro em applyConditionalFormatting: " + error.message);
    throw error;
  }
}

function protectRange(sheetName, rangeA1, description, warningOnly = false) {
  try {
    const sheet = getActiveSpreadsheet().getSheetByName(sheetName);
    if (sheet) {
      const protection = sheet.getRange(rangeA1).protect();
      protection.setDescription(description);
      if (warningOnly) {
        protection.setWarningOnly(true);
      } else {
        protection.removeEditors(protection.getEditors());
        protection.addEditor(Session.getActiveUser().getEmail()); // Apenas o usuário ativo pode editar
      }
    }
  } catch (error) {
    Logger.log("Erro em protectRange: " + error.message);
    throw error;
  }
}

function clearSheetContent_(sheetName) {
  const sheet = getActiveSpreadsheet().getSheetByName(sheetName);
  if (sheet) {
    sheet.clearContents();
    sheet.clearFormats();
    sheet.clearDataValidations();
  }
}
