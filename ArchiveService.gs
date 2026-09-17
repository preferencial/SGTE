// ArchiveService.gs
/**
 * @overview Move dados antigos de planilhas ativas para planilhas de arquivo histórico no Google Drive, conforme as políticas de retenção de dados [1].
 * @module ArchiveService
 * @requires SpreadsheetApp (serviço nativo do Apps Script).
 * @requires DriveApp (serviço nativo do Apps Script).
 * @requires ConfigService.gs para obter nomes de planilhas e IDs de pastas.
 * @requires Logger.gs para registro de operações.
 */

function archiveRecords(entityName, recordsToArchive) {
  try {
    try {
      try {
        if (!recordsToArchive || recordsToArchive.length === 0) {
          LoggerService.info(`Nenhum registro para arquivar para a entidade ${entityName}.`);
          return;
        }

        const sourceSheetName = ConfigService.getSheetName(entityName);
        const archiveFolderName = "SGTE_Arquivos"; // Pode ser configurado em ConfigService
        const archiveSpreadsheetName = `${sourceSheetName}_Arquivo`;

        let archiveFolder = DriveApp.getFoldersByName(archiveFolderName).next();
        if (!archiveFolder) {
          archiveFolder = DriveApp.createFolder(archiveFolderName);
          LoggerService.info(`Pasta de arquivo '${archiveFolderName}' criada.`);
        }

        let archiveSpreadsheet = SpreadsheetApp.getActiveSpreadsheet(); // Assume que o arquivo de arquivo está na mesma planilha por simplicidade
        // Em um cenário mais robusto, criaria uma nova planilha ou buscaria uma existente na pasta de arquivo.
        // Para este exemplo, vamos criar uma nova aba na planilha principal para o arquivo.
  
        let archiveSheet = archiveSpreadsheet.getSheetByName(archiveSpreadsheetName);
        if (!archiveSheet) {
          archiveSheet = archiveSpreadsheet.insertSheet(archiveSpreadsheetName);
          const schema = SchemaService.getSchema(entityName);
          archiveSheet.getRange(1, 1, 1, schema.headers.length).setValues([schema.headers]).setFontWeight("bold");
          archiveSheet.setFrozenRows(1);
          LoggerService.info(`Planilha de arquivo '${archiveSpreadsheetName}' criada.`);
        }

        const schema = SchemaService.getSchema(entityName);
        const headers = schema.headers;
        const rowsToAppend = recordsToArchive.map(record => {
          return headers.map(header => record[header] !== undefined ? record[header] : "");
        });

        archiveSheet.getRange(archiveSheet.getLastRow() + 1, 1, rowsToAppend.length, rowsToAppend[0].length).setValues(rowsToAppend);
        LoggerService.info(`${recordsToArchive.length} registros arquivados da entidade ${entityName} para ${archiveSpreadsheetName}.`);
      } catch (error) {
        Logger.log("Erro em archiveRecords: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em archiveRecords: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em archiveRecords: " + error.message);
    throw error;
  }
}
