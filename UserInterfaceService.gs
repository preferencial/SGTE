// UserInterfaceService.gs
/**
 * @overview Fornece funções para interagir com a interface do usuário no SGTE, como exibir mensagens, redirecionar páginas e manipular elementos HTML.
 * @module UserInterfaceService
 * @requires HtmlServiceUtils.gs para renderização de templates HTML.
 */

function showMessage(type, message) {
  // Implementação para exibir uma mensagem (sucesso, erro, info) na UI
  // Pode ser um modal, um toast, ou uma div específica na página
  return renderHtmlTemplate("MessageModal", { type: type, message: message });
}

function redirectTo(pageName) {
  // Implementação para redirecionar o usuário para outra página HTML
  return renderHtmlTemplate(pageName);
}

function updateElement(elementId, content) {
  // Implementação para atualizar o conteúdo de um elemento HTML específico
  // Isso geralmente é feito via google.script.run no frontend
  return { elementId: elementId, content: content };
}

function showLoadingSpinner() {
  // Exibe um spinner de carregamento
  return renderHtmlTemplate("LoadingSpinner");
}

function hideLoadingSpinner() {
  // Esconde o spinner de carregamento
  // Isso geralmente é feito via google.script.run no frontend
  return { action: "hideLoadingSpinner" };
}
