/**
 * SchemaGlobalsCompat.gs — Preferencial - SGTE
 *
 * Restaura a API global legada de schema que existia antes de SchemaService.gs
 * ser regenerado dentro de uma IIFE (var SchemaService = (function(){...})()).
 *
 * Arquivos legados (DataService.gs, Logger.gs, ServiceCompatibility.gs) ainda
 * chamam getSchema/getSchemas/validateData/createMissingSheets_ como funcoes
 * globais. A IIFE deixou de exporta-las no escopo global, gerando
 * "ReferenceError: getSchemas is not defined". Estes shims delegam ao
 * SchemaService canonico, sem duplicar logica de schema.
 */

function getSchema(entityName) {
  return SchemaService.getSchema(entityName);
}

function getSchemas(options) {
  return SchemaService.getSchemas(options);
}

/**
 * Validacao minima de campos obrigatorios (porte original do SchemaService).
 * Mantida em texto plano, sem hashing de credenciais.
 */
function validateData(entityName, data) {
  try {
    const schema = getSchema(entityName);
    if (!schema) {
      throw new Error('Schema not found for entity: ' + entityName);
    }
    (schema.required || []).forEach(function(field) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        throw new Error('Missing required field: ' + field + ' for entity: ' + entityName);
      }
    });
    return true;
  } catch (error) {
    Logger.log("Erro em validateData: " + error.message);
    throw error;
  }
}

function createMissingSheets_(options) {
  return SchemaService.ensureAllSheets(options || {});
}
