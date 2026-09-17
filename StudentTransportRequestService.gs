// StudentTransportRequestService.gs
/**
 * @overview Gerencia as solicitações de transporte escolar para novos estudantes ou mudanças de endereço no SGTE.
 *           Permite registrar, aprovar e processar essas solicitações.
 * @module StudentTransportRequestService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de solicitação de transporte.
 * @requires StudentService.gs para criar ou atualizar estudantes.
 * @requires GeocodingService.gs para geocodificar endereços.
 */

function createTransportRequest(requestData) {
  // requestData deve incluir StudentName, Address, School, ContactInfo, RequestType (New, ChangeAddress)
  requestData.Status = "PENDING";
  requestData.CreatedAt = new Date();
  return DataService.createRecord("TRANSPORT_REQUESTS", requestData);
}

function getTransportRequestById(requestId) {
  return DataService.getRecordById("TRANSPORT_REQUESTS", requestId);
}

function approveTransportRequest(requestId) {
  const request = getTransportRequestById(requestId);
  if (request && request.Status === "PENDING") {
    // Geocodificar o endereço
    const geoCoords = GeocodingService.geocodeAddress(request.Address);
    if (!geoCoords) {
      Logger.error(`Não foi possível geocodificar o endereço para a solicitação ${requestId}.`);
      return { success: false, message: "Falha na geocodificação." };
    }

    // Criar ou atualizar o estudante
    const studentData = {
      Name: request.StudentName,
      Address: request.Address,
      School: request.School,
      FamilyContact: request.ContactInfo.name,
      FamilyPhone: request.ContactInfo.phone,
      Latitude: geoCoords.latitude,
      Longitude: geoCoords.longitude
    };

    let student;
    if (request.RequestType === "New") {
      student = StudentService.createStudent(studentData);
    } else if (request.RequestType === "ChangeAddress" && request.StudentID) {
      student = StudentService.updateStudent(request.StudentID, studentData);
    }

    if (student) {
      DataService.updateRecord("TRANSPORT_REQUESTS", requestId, { Status: "APPROVED", StudentID: student.ID, UpdatedAt: new Date() });
      Logger.info(`Solicitação de transporte ${requestId} aprovada. Estudante ${student.ID} criado/atualizado.`);
      return { success: true, studentId: student.ID };
    }
  }
  return { success: false, message: "Solicitação não encontrada ou não pendente." };
}

function rejectTransportRequest(requestId, reason) {
  return DataService.updateRecord("TRANSPORT_REQUESTS", requestId, { Status: "REJECTED", RejectionReason: reason, UpdatedAt: new Date() });
}

function getAllTransportRequests() {
  return DataService.getAllRecords("TRANSPORT_REQUESTS");
}
