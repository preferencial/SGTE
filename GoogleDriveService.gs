// GoogleDriveService.gs
/**
 * @overview Fornece funções para interagir com o Google Drive no SGTE, como criar pastas, mover arquivos e gerenciar permissões.
 * @module GoogleDriveService
 * @requires DriveApp (serviço nativo do Apps Script).
 * @requires Logger.gs para registro de operações.
 */

function createFolder(folderName) {
  try {
    const folder = DriveApp.createFolder(folderName);
    Logger.info(`Pasta do Drive criada: ${folderName}`);
    return folder;
  } catch (e) {
    Logger.error(`Erro ao criar pasta no Drive: ${e.message}`);
    return null;
  }
}

function getFolderByName(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return null;
}

function moveFileToFolder(fileId, folderId) {
  try {
    const file = DriveApp.getFileById(fileId);
    const folder = DriveApp.getFolderById(folderId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file); // Remove do root se estava lá
    Logger.info(`Arquivo ${file.getName()} movido para a pasta ${folder.getName()}.`);
    return true;
  } catch (e) {
    Logger.error(`Erro ao mover arquivo no Drive: ${e.message}`);
    return false;
  }
}

function shareFile(fileId, email, role = "viewer") {
  try {
    const file = DriveApp.getFileById(fileId);
    if (role === "editor") {
      file.addEditor(email);
    } else {
      file.addViewer(email);
    }
    Logger.info(`Arquivo ${file.getName()} compartilhado com ${email} como ${role}.`);
    return true;
  } catch (e) {
    Logger.error(`Erro ao compartilhar arquivo no Drive: ${e.message}`);
    return false;
  }
}
