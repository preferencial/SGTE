// StudentContactService.gs
/**
 * @overview Gerencia os contatos dos estudantes, incluindo informações de contato da família e outros contatos relevantes.
 * @module StudentContactService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de estudante (onde os dados de contato estão).
 */

function getStudentContactInfo(studentId) {
  const student = StudentService.getStudentById(studentId);
  if (student) {
    return {
      familyContactName: student.FamilyContact,
      familyContactPhone: student.FamilyPhone,
      // Adicionar outros campos de contato se existirem no esquema do estudante
    };
  }
  return null;
}

function updateStudentContactInfo(studentId, contactData) {
  // contactData pode incluir FamilyContact, FamilyPhone, etc.
  return StudentService.updateStudent(studentId, contactData);
}

function getStudentsByContactPhone(phoneNumber) {
  try {
    const allStudents = StudentService.getAllStudents();
    return allStudents.filter(student => student.FamilyPhone === phoneNumber);
  } catch (error) {
    Logger.log("Erro em getStudentsByContactPhone: " + error.message);
    throw error;
  }
}
