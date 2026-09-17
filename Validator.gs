// Validator.gs
/**
 * @overview Contém funções genéricas de validação de dados que podem ser reutilizadas por diferentes serviços no SGTE.
 * @module Validator
 */

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isNumeric(value) {
  try {
    if (value === null || value === undefined) return false;
    if (typeof value !== 'number' && typeof value !== 'string') return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    const normalized = typeof value === 'number' ? value : Number(value.trim());
    return isFinite(normalized);
  } catch (error) {
    Logger.log("Erro em isNumeric: " + error.message);
    throw error;
  }
}

function isPositiveNumber(value) {
  try {
    if (!isNumeric(value)) return false;
    const normalized = typeof value === 'number' ? value : Number(value.trim());
    return normalized > 0;
  } catch (error) {
    Logger.log("Erro em isPositiveNumber: " + error.message);
    throw error;
  }
}

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

function isDate(value) {
  return value instanceof Date && !isNaN(value);
}

function isBoolean(value) {
  return typeof value === 'boolean';
}

function isNotEmpty(value) {
  return value !== null && value !== undefined && value !== '';
}
