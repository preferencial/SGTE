// ErrorHandler.gs
/**
 * @overview Centraliza o tratamento de erros do sistema SGTE, registrando exceções e fornecendo feedback adequado ao usuário ou ao log.
 * @module ErrorHandler
 * @requires Logger.gs para registro de erros.
 */

function handleError(error, context = "") {
  try {
    Logger.error(`Erro: ${error.message}`, context);
    // Dependendo do ambiente (frontend/backend), pode-se retornar uma mensagem de erro diferente
    if (typeof HtmlService !== 'undefined') {
      // Se estiver no contexto de um script que serve HTML
      return HtmlService.createHtmlOutput(`<p>Ocorreu um erro inesperado: ${error.message}</p><p>Por favor, tente novamente ou entre em contato com o suporte.</p>`);
    } else {
      // Se estiver em um contexto de backend (e.g., gatilho de tempo)
      throw error; // Re-lança o erro para que o Apps Script o registre
    }
  } catch (error) {
    Logger.log("Erro em handleError: " + error.message);
    throw error;
  }
}

function wrapFunction(func, context = "") {
  return function() {
    try {
      return func.apply(this, arguments);
    } catch (e) {
      return handleError(e, context);
    }
  };
}
