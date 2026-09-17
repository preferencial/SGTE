// FormHandler.gs
/**
 * @overview Processa os dados submetidos por formulários HTML no SGTE, validando-os e encaminhando-os para os serviços apropriados.
 * @module FormHandler
 * @requires StudentService.gs para lidar com dados de estudantes.
 * @requires NonBoardingNoticeService.gs para lidar com avisos de não embarque.
 * @requires AuthService.gs para lidar com dados de autenticação.
 * @requires Logger.gs para registro de operações.
 */

function handleFormSubmission(formName, formData) {
  LoggerService.info(`Processando submissão do formulário: ${formName}`);
  try {
    switch (formName) {
      case "loginForm":
        return AuthService.doLogin(formData.username, formData.password);
      case "studentForm":
        if (formData.id) {
          return StudentService.updateStudent(formData.id, formData);
        } else {
          return StudentService.createStudent(formData);
        }
      case "nonBoardingNoticeForm":
        return NonBoardingNoticeService.createNonBoardingNotice(formData);
      // Adicionar outros casos para diferentes formulários
      default:
        throw new Error(`Formulário desconhecido: ${formName}`);
    }
  } catch (e) {
    Logger.error(`Erro ao processar formulário ${formName}: ${e.message}`);
    return { success: false, message: e.message };
  }
}
