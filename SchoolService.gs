// SchoolService.gs
/**
 * @overview Gerencia as informações das escolas no SGTE, incluindo seus endereços e dados de contato.
 *           Essencial para vincular estudantes às suas respectivas instituições de ensino.
 * @module SchoolService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de escola.
 */

function getSchoolById(schoolId) {
  return DataService.getRecordById("SCHOOLS", schoolId);
}

function createSchool(schoolData) {
  // schoolData deve incluir Name, Address, ContactPerson, ContactPhone
  return DataService.createRecord("SCHOOLS", schoolData);
}

function updateSchool(schoolId, schoolData) {
  return DataService.updateRecord("SCHOOLS", schoolId, schoolData);
}

function deleteSchool(schoolId) {
  return DataService.deleteRecord("SCHOOLS", schoolId);
}

function getAllSchools() {
  return DataService.getAllRecords("SCHOOLS");
}
