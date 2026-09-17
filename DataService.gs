// DataService.gs
/**
 * @overview Fornece uma interface genérica para operações CRUD em qualquer planilha do SGTE, abstraindo a interação direta com o SpreadsheetApp.
 *           Aplica validações de esquema e tratamento de erros.
 * @module DataService
 * @requires SchemaService.gs para validação de dados.
 * @requires ConfigService.gs para obter o ID da planilha principal.
 * @requires Logger.gs para registro de operações.
 */

function getSpreadsheet() {
  try {
    const spreadsheetId = getSpreadsheetId();
    if (!spreadsheetId) {
      throw new Error("A propriedade SPREADSHEETS_ID não está configurada.");
    }
    return SpreadsheetApp.openById(spreadsheetId);
  } catch (error) {
    Logger.log("Erro em getSpreadsheet: " + error.message);
    throw error;
  }
}

function getSheet(entityName) {
  const schema = getSchema(entityName);
  if (!schema || !schema.sheetName) {
    throw new Error(`Entidade sem planilha configurada: ${entityName}`);
  }
  const sheet = getSpreadsheet().getSheetByName(schema.sheetName);
  if (!sheet) {
    ensureEntitySheetForEntity_(entityName);
    return getSpreadsheet().getSheetByName(schema.sheetName);
  }
  return sheet;
}

/** Cria a aba de domínio sob demanda, sempre usando o schema canônico. */
function ensureEntitySheetForEntity_(entityName) {
  if (typeof SchemaService === 'undefined' || typeof SchemaService.ensureSheet !== 'function') {
    throw new Error('SchemaService indisponível para criar a entidade: ' + entityName);
  }
  const schema = SchemaService.getSchema(entityName);
  SchemaService.ensureSheet(schema, {});
  return schema.sheetName;
}

function getNextId(entityName) {
  try {
    try {
      const sheet = getSheet(entityName);
      const schema = getSchema(entityName);
      const idHeader = getIdentifierHeader_(schema);
      const headers = getSheetHeaders_(sheet, schema);
      const idColumnIndex = headers.indexOf(idHeader) + 1;
      const lastRow = sheet.getLastRow();
      if (lastRow < 2 || idColumnIndex < 1) return 1;

      const ids = sheet.getRange(2, idColumnIndex, lastRow - 1, 1).getValues();
      return ids.reduce(function(maxId, row) {
        const value = Number(row[0]);
        return isNaN(value) ? maxId : Math.max(maxId, value);
      }, 0) + 1;
    } catch (error) {
      Logger.log("Erro em getNextId: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em getNextId: " + error.message);
    throw error;
  }
}

function createRecord(entityName, data) {
  try {
    try {
      const sheet = getSheet(entityName);
      const schema = getSchema(entityName);
      const headers = getSheetHeaders_(sheet, schema);
      const record = Object.assign({}, schema.defaults || {}, data || {});

      if (schema.identifier === "ID" && record.ID === undefined) {
        record.ID = getNextId(entityName);
      }
      if (headers.indexOf("CreatedAt") !== -1 && record.CreatedAt === undefined) {
        record.CreatedAt = new Date();
      }
      if (headers.indexOf("UpdatedAt") !== -1) {
        record.UpdatedAt = new Date();
      }

      validateData(entityName, record);
      const rowData = headers.map(function(header) {
        return toSheetValue_(record[header]);
      });
      sheet.appendRow(rowData);
      info(`Registro criado em ${entityName}.`, "DataService.createRecord");
      return record;
    } catch (error) {
      Logger.log("Erro em createRecord: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  } catch (error) {
    Logger.log("Erro em createRecord: " + error.message);
    throw error;
  }
}

function getRecordById(entityName, id) {
  try {
    try {
      const sheet = getSheet(entityName);
      const schema = getSchema(entityName);
      const headers = getSheetHeaders_(sheet, schema);
      const idColumnIndex = headers.indexOf(getIdentifierHeader_(schema)) + 1;
      if (idColumnIndex < 1) {
        throw new Error(`Coluna identificadora ausente em ${entityName}.`);
      }

      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();

      for (let i = 1; i < values.length; i++) { // Começa da segunda linha para ignorar o cabeçalho
        if (sameIdentifier_(values[i][idColumnIndex - 1], id)) {
          const record = {};
          headers.forEach((header, index) => {
            record[header] = values[i][index];
          });
          return record;
        }
      }
      return null;
    } catch (error) {
      Logger.log("Erro em getRecordById: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em getRecordById: " + error.message);
    throw error;
  }
}

function getAllRecords(entityName) {
  try {
    try {
      const sheet = getSheet(entityName);
      const schema = getSchema(entityName);
      const headers = getSheetHeaders_(sheet, schema);

      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();

      if (values.length <= 1) return []; // Apenas cabeçalho ou planilha vazia

      const records = [];
      for (let i = 1; i < values.length; i++) {
        if (values[i].every(function(value) { return value === ""; })) continue;
        const record = {};
        headers.forEach((header, index) => {
          record[header] = values[i][index];
        });
        records.push(record);
      }
      return records;
    } catch (error) {
      Logger.log("Erro em getAllRecords: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em getAllRecords: " + error.message);
    throw error;
  }
}

function updateRecord(entityName, id, updates) {
  try {
    try {
      const sheet = getSheet(entityName);
      const schema = getSchema(entityName);
      const headers = getSheetHeaders_(sheet, schema);
      const idColumnIndex = headers.indexOf(getIdentifierHeader_(schema)) + 1;
      if (idColumnIndex < 1) {
        throw new Error(`Coluna identificadora ausente em ${entityName}.`);
      }

      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();

      for (let i = 1; i < values.length; i++) {
        if (sameIdentifier_(values[i][idColumnIndex - 1], id)) {
          const row = values[i];
          for (const key in updates) {
            const headerIndex = headers.indexOf(key);
            if (headerIndex !== -1) {
              row[headerIndex] = toSheetValue_(updates[key]);
            }
          }
          const updatedAtIndex = headers.indexOf("UpdatedAt");
          if (updatedAtIndex !== -1) {
            row[updatedAtIndex] = new Date();
          }
          sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
          info(`Registro atualizado em ${entityName}: ID ${id}.`, "DataService.updateRecord");
          return true;
        }
      }
      return false;
    } catch (error) {
      Logger.log("Erro em updateRecord: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  } catch (error) {
    Logger.log("Erro em updateRecord: " + error.message);
    throw error;
  }
}

function deleteRecord(entityName, id) {
  try {
    try {
      try {
        const sheet = getSheet(entityName);
        const schema = getSchema(entityName);
        const headers = getSheetHeaders_(sheet, schema);
        const idColumnIndex = headers.indexOf(getIdentifierHeader_(schema)) + 1;
        if (idColumnIndex < 1) {
          throw new Error(`Coluna identificadora ausente em ${entityName}.`);
        }

        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();

        for (let i = 1; i < values.length; i++) {
          if (sameIdentifier_(values[i][idColumnIndex - 1], id)) {
            sheet.deleteRow(i + 1); // +1 porque o índice da planilha é baseado em 1 e a primeira linha é o cabeçalho
            info(`Registro removido de ${entityName}: ID ${id}.`, "DataService.deleteRecord");
            return true;
          }
        }
        return false;
      } catch (error) {
        Logger.log("Erro em deleteRecord: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em deleteRecord: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em deleteRecord: " + error.message);
    throw error;
  }
}

function getIdentifierHeader_(schema) {
  try {
    if (schema.identifier) return schema.identifier;
    const explicitIdentifier = schema.headers.find(function(header) {
      return /ID$/.test(header);
    });
    if (!explicitIdentifier) {
      throw new Error("O esquema não possui uma coluna identificadora.");
    }
    return explicitIdentifier;
  } catch (error) {
    Logger.log("Erro em getIdentifierHeader_: " + error.message);
    throw error;
  }
}

function getSheetHeaders_(sheet, schema) {
  try {
    try {
      const lastColumn = sheet.getLastColumn();
      if (!lastColumn) return schema.headers.slice();
      const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);
      return headers.some(function(header) { return header.trim(); })
        ? headers
        : schema.headers.slice();
    } catch (error) {
      Logger.log("Erro em getSheetHeaders_: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em getSheetHeaders_: " + error.message);
    throw error;
  }
}

function sameIdentifier_(left, right) {
  return String(left) === String(right);
}

function toSheetValue_(value) {
  try {
    if (value === undefined || value === null) return "";
    if (value instanceof Date) return value;
    if (typeof value === "object") return JSON.stringify(value);
    return value;
  } catch (error) {
    Logger.log("Erro em toSheetValue_: " + error.message);
    throw error;
  }
}
