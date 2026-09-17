// StudentEmergencyContactService.gs
/**
 * @overview Gerencia os contatos de emergência dos estudantes no SGTE.
 *           Crucial para situações de emergência durante o transporte escolar.
 * @module StudentEmergencyContactService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de contato de emergência.
 */

function getEmergencyContacts(studentId) {
  try {
    const allContacts = DataService.getAllRecords("EMERGENCY_CONTACTS");
    const normalizedStudentId = String(studentId == null ? '' : studentId).trim();
    return allContacts.filter(contact => String(contact.StudentID == null ? '' : contact.StudentID).trim() === normalizedStudentId);
  } catch (error) {
    Logger.log("Erro em getEmergencyContacts: " + error.message);
    throw error;
  }
}

function addEmergencyContact(contactData) {
  // contactData deve incluir StudentID, Name, Relationship, Phone, Priority
  return DataService.createRecord("EMERGENCY_CONTACTS", contactData);
}

function updateEmergencyContact(contactId, updates) {
  return DataService.updateRecord("EMERGENCY_CONTACTS", contactId, updates);
}

function removeEmergencyContact(contactId) {
  return DataService.deleteRecord("EMERGENCY_CONTACTS", contactId);
}
