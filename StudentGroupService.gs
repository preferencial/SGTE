// StudentGroupService.gs
/**
 * @overview Gerencia o agrupamento de estudantes no SGTE, facilitando a organização para o planejamento de rotas ou outras atividades.
 * @module StudentGroupService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de grupo de estudantes.
 * @requires StudentService.gs para obter dados de estudantes.
 */

function createStudentGroup(groupName, studentIds) {
  try {
    const groupData = {
      GroupName: groupName,
      StudentIDs: JSON.stringify(studentIds), // Armazenar IDs como string JSON
      CreatedAt: new Date()
    };
    return DataService.createRecord("STUDENT_GROUPS", groupData);
  } catch (error) {
    Logger.log("Erro em createStudentGroup: " + error.message);
    throw error;
  }
}

function getStudentGroupById(groupId) {
  try {
    const group = DataService.getRecordById("STUDENT_GROUPS", groupId);
    if (group && group.StudentIDs) {
      group.StudentIDs = JSON.parse(group.StudentIDs);
    }
    return group;
  } catch (error) {
    Logger.log("Erro em getStudentGroupById: " + error.message);
    throw error;
  }
}

function addStudentToGroup(groupId, studentId) {
  try {
    const group = getStudentGroupById(groupId);
    if (group) {
      if (!group.StudentIDs.includes(studentId)) {
        group.StudentIDs.push(studentId);
        return DataService.updateRecord("STUDENT_GROUPS", groupId, { StudentIDs: JSON.stringify(group.StudentIDs) });
      }
    }
    return false;
  } catch (error) {
    Logger.log("Erro em addStudentToGroup: " + error.message);
    throw error;
  }
}

function removeStudentFromGroup(groupId, studentId) {
  try {
    const group = getStudentGroupById(groupId);
    if (group) {
      const index = group.StudentIDs.indexOf(studentId);
      if (index > -1) {
        group.StudentIDs.splice(index, 1);
        return DataService.updateRecord("STUDENT_GROUPS", groupId, { StudentIDs: JSON.stringify(group.StudentIDs) });
      }
    }
    return false;
  } catch (error) {
    Logger.log("Erro em removeStudentFromGroup: " + error.message);
    throw error;
  }
}

function getStudentsInGroup(groupId) {
  const group = getStudentGroupById(groupId);
  if (group && group.StudentIDs) {
    return group.StudentIDs.map(id => StudentService.getStudentById(id));
  }
  return [];
}
