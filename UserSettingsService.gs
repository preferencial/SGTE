// UserSettingsService.gs
/**
 * @overview Gerencia as configurações personalizadas de cada usuário no SGTE.
 *           Permite que os usuários configurem preferências como idioma, tema, etc.
 * @module UserSettingsService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de configurações de usuário.
 */

function getUserSettings(userId) {
  const settings = DataService.getRecordById("USER_SETTINGS", userId);
  if (!settings) {
    // Retornar configurações padrão se não houver configurações personalizadas
    return { userId: userId, language: "pt-BR", theme: "light" };
  }
  return settings;
}

function updateUserSettings(userId, settingsData) {
  return DataService.updateRecord("USER_SETTINGS", userId, settingsData);
}

function getLanguage(userId) {
  const settings = getUserSettings(userId);
  return settings.language;
}
