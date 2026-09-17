// EventService.gs
/**
 * @overview Gerencia eventos do calendário escolar que afetam o transporte no SGTE, como feriados, dias de reposição e eventos extracurriculares [1].
 * @module EventService
 * @requires DataService.gs para operações genéricas de planilha.
 * @requires SchemaService.gs para validação de esquema de evento.
 * @requires RouteService.gs para ajustar rotas conforme eventos.
 */

function getEventById(eventId) {
  return DataService.getRecordById("EVENTS", eventId);
}

function createEvent(eventData) {
  // eventData deve conter EventType, EventDate, Description, AffectsRoutes
  const newEvent = DataService.createRecord("EVENTS", eventData);
  if (newEvent.AffectsRoutes) {
    // Lógica para ajustar rotas ou notificar sobre o evento
    Logger.info(`Evento ${newEvent.EventType} em ${newEvent.EventDate} afeta rotas. Ações adicionais podem ser necessárias.`);
  }
  return newEvent;
}

function updateEvent(eventId, eventData) {
  const updatedEvent = DataService.updateRecord("EVENTS", eventId, eventData);
  if (updatedEvent && updatedEvent.AffectsRoutes) {
    // Lógica para ajustar rotas ou notificar sobre a atualização do evento
    Logger.info(`Evento ${updatedEvent.EventType} em ${updatedEvent.EventDate} foi atualizado e afeta rotas.`);
  }
  return updatedEvent;
}

function deleteEvent(eventId) {
  return DataService.deleteRecord("EVENTS", eventId);
}

function getAllEvents() {
  return DataService.getAllRecords("EVENTS");
}

function getEventsByDate(date) {
  try {
    const allEvents = DataService.getAllRecords("EVENTS");
    return allEvents.filter(event => {
      const eventDate = new Date(event.EventDate);
      return eventDate.toDateString() === date.toDateString();
    });
  } catch (error) {
    Logger.log("Erro em getEventsByDate: " + error.message);
    throw error;
  }
}

function isTransportAffectedByEvent(date) {
  try {
    const eventsToday = getEventsByDate(date);
    return eventsToday.some(event => event.AffectsRoutes);
  } catch (error) {
    Logger.log("Erro em isTransportAffectedByEvent: " + error.message);
    throw error;
  }
}
