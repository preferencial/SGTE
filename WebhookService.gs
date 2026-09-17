// WebhookService.gs
/**
 * @overview Gerencia o recebimento e processamento de webhooks no SGTE.
 *           Pode ser usado para receber atualizações de sistemas externos ou callbacks do Google Colab.
 * @module WebhookService
 * @requires Logger.gs para registro de operações.
 * @requires RouteOptimizationCallback.gs para processar callbacks de otimização.
 */

function handleWebhookRequest(e) {
  try {
    // Esta função atua como um endpoint genérico para webhooks.
    // O roteamento para o serviço correto é feito com base nos parâmetros ou no corpo da requisição.
    const payload = JSON.parse(e.postData.contents);
    const webhookType = e.parameter.type || payload.type;

    info(`Webhook recebido do tipo: ${webhookType}`);

    try {
      switch (webhookType) {
        case "COLAB_OPTIMIZATION_CALLBACK":
          // Encaminha para o serviço de callback de otimização
          return handleRouteOptimizationCallback(e);
        // Adicionar outros tipos de webhook aqui
        default:
          warn(`Tipo de webhook desconhecido: ${webhookType}`);
          return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Tipo de webhook desconhecido." })).setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    } catch (webhookError) {
      error(`Erro ao processar webhook do tipo ${webhookType}: ${webhookError.message}`);
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: webhookError.message })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log("Erro em handleWebhookRequest: " + error.message);
    throw error;
  }
}
