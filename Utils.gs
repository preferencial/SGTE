// Utils.gs
/**
 * @overview Funções utilitárias diversas que não se encaixam em outros serviços específicos no SGTE.
 * @module Utils
 */

function formatDate(date) {
  try {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  } catch (error) {
    Logger.log("Erro em formatDate: " + error.message);
    throw error;
  }
}

function generateUniqueId() {
  return Utilities.getUuid();
}

function capitalizeFirstLetter(string) {
  try {
    return string.charAt(0).toUpperCase() + string.slice(1);
  } catch (error) {
    Logger.log("Erro em capitalizeFirstLetter: " + error.message);
    throw error;
  }
}

function parseJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    Logger.error(`Erro ao fazer parse de JSON: ${e.message}. String: ${jsonString}`);
    return null;
  }
}

function stringifyJson(object) {
  try {
    return JSON.stringify(object);
  } catch (e) {
    Logger.error(`Erro ao stringify JSON: ${e.message}. Objeto: ${object}`);
    return null;
  }
}
