// RouteHistoryService.gs
/**
 * @overview Gerencia o histórico de alterações e versões das rotas no SGTE.
 *           Permite rastrear modificações e reverter para versões anteriores, se necessário.
 * @module RouteHistoryService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de histórico de rota.
 */

function logRouteChange(routeId, userId, changeDetails) {
  try {
    const historyEntry = {
      RouteID: routeId,
      UserID: userId,
      Timestamp: new Date(),
      ChangeDetails: JSON.stringify(changeDetails)
    };
    return DataService.createRecord("ROUTE_HISTORY", historyEntry);
  } catch (error) {
    Logger.log("Erro em logRouteChange: " + error.message);
    throw error;
  }
}

function getRouteHistory(routeId) {
  const allHistory = DataService.getAllRecords("ROUTE_HISTORY");
  return allHistory.filter(entry => String(entry.RouteID) === String(routeId)).sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
}

function revertRouteToVersion(routeId, historyEntryId) {
  if (!routeId || !historyEntryId) throw new Error('Rota e versão são obrigatórias.');
  const history = DataService.getAllRecords('ROUTE_HISTORY');
  const entry = history.find(function(item) {
    return String(item.ID || item.HistoryID || item.RouteHistoryID || '') === String(historyEntryId) && String(item.RouteID) === String(routeId);
  });
  if (!entry) throw new Error('Versão de rota não encontrada.');
  let details;
  try { details = typeof entry.ChangeDetails === 'string' ? JSON.parse(entry.ChangeDetails) : entry.ChangeDetails; } catch (e) { throw new Error('Histórico de rota inválido.'); }
  const snapshot = details && (details.before || details.previous || details.snapshot);
  if (!snapshot || typeof snapshot !== 'object') throw new Error('Histórico sem snapshot reversível.');
  const updates = {};
  Object.keys(snapshot).forEach(function(key) {
    if (['ID', 'RouteID', 'CreatedAt', 'UpdatedAt'].indexOf(key) === -1) updates[key] = snapshot[key];
  });
  if (!Object.keys(updates).length) throw new Error('Histórico sem campos para restaurar.');
  const updated = RouteService.updateRoute(routeId, updates);
  if (!updated) throw new Error('Não foi possível restaurar a rota.');
  return { success: true, routeId: routeId, historyEntryId: historyEntryId };
}
