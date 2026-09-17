// StudentPickupDropoffService.gs
/**
 * @overview Gerencia os pontos de embarque e desembarque específicos para cada estudante no SGTE.
 *           Permite definir e atualizar os locais onde os estudantes são pegos e deixados.
 * @module StudentPickupDropoffService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de ponto de embarque/desembarque.
 * @requires StudentService.gs para obter dados de estudantes.
 */

function getStudentPickupDropoffPoints(studentId) {
  try {
    const allPoints = DataService.getAllRecords("STUDENT_PICKUP_DROPOFF");
    const normalizedStudentId = String(studentId == null ? '' : studentId).trim();
    return allPoints.filter(point => String(point.StudentID == null ? '' : point.StudentID).trim() === normalizedStudentId);
  } catch (error) {
    Logger.log("Erro em getStudentPickupDropoffPoints: " + error.message);
    throw error;
  }
}

function addStudentPickupDropoffPoint(pointData) {
  // pointData deve incluir StudentID, Type (Pickup/Dropoff), Latitude, Longitude, Address, IsPrimary
  return DataService.createRecord("STUDENT_PICKUP_DROPOFF", pointData);
}

function updateStudentPickupDropoffPoint(pointId, updates) {
  return DataService.updateRecord("STUDENT_PICKUP_DROPOFF", pointId, updates);
}

function removeStudentPickupDropoffPoint(pointId) {
  return DataService.deleteRecord("STUDENT_PICKUP_DROPOFF", pointId);
}
