// NotificationTemplateService.gs
/**
 * @overview Gerencia os templates de notificação utilizados pelo SGTE.
 *           Permite a criação, edição e recuperação de templates para diferentes tipos de notificações (e-mail, SMS, etc.).
 * @module NotificationTemplateService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de template de notificação.
 */

function getTemplate(templateName) {
  try {
    const allTemplates = DataService.getAllRecords("NOTIFICATION_TEMPLATES");
    return allTemplates.find(template => template.Name === templateName);
  } catch (error) {
    Logger.log("Erro em getTemplate: " + error.message);
    throw error;
  }
}

function createTemplate(templateData) {
  // templateData deve incluir Name, Subject, Body, Type (e.g., EMAIL, SMS)
  return DataService.createRecord("NOTIFICATION_TEMPLATES", templateData);
}

function updateTemplate(templateId, updates) {
  return DataService.updateRecord("NOTIFICATION_TEMPLATES", templateId, updates);
}

function deleteTemplate(templateId) {
  return DataService.deleteRecord("NOTIFICATION_TEMPLATES", templateId);
}

function renderTemplate(templateName, data) {
  try {
    const template = getTemplate(templateName);
    if (!template) {
      Logger.error(`Template de notificação não encontrado: ${templateName}`);
      return null;
    }

    let renderedSubject = template.Subject;
    let renderedBody = template.Body;

    // Substituir placeholders no assunto e corpo do template
    for (const key in data) {
      const placeholder = `{${key}}`;
      const value = data[key];
      renderedSubject = renderedSubject.replace(new RegExp(placeholder, 'g'), value);
      renderedBody = renderedBody.replace(new RegExp(placeholder, 'g'), value);
    }

    return { subject: renderedSubject, body: renderedBody };
  } catch (error) {
    Logger.log("Erro em renderTemplate: " + error.message);
    throw error;
  }
}
