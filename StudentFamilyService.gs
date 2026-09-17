// StudentFamilyService.gs
/**
 * @overview Gerencia as informações de contato das famílias dos estudantes no SGTE.
 *           Facilita a comunicação e o registro de avisos de não embarque.
 * @module StudentFamilyService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de estudante (onde os dados da família estão).
 */

function getFamilyContactByStudentId(studentId) {
  const student = StudentService.getStudentById(studentId);
  if (student) {
    return { contactName: student.FamilyContact, contactPhone: student.FamilyPhone };
  }
  return null;
}

function updateFamilyContact(studentId, contactName, contactPhone) {
  return StudentService.updateStudent(studentId, { FamilyContact: contactName, FamilyPhone: contactPhone });
}

function getStudentsByFamilyContact(contactName, contactPhone) {
  try {
    const allStudents = StudentService.getAllStudents();
    return allStudents.filter(student => 
      student.FamilyContact === contactName && student.FamilyPhone === contactPhone
    );
  } catch (error) {
    Logger.log("Erro em getStudentsByFamilyContact: " + error.message);
    throw error;
  }
}
