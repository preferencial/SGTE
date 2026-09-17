// ConfigService.gs
/**
 * @overview Centraliza as configurações do sistema SGTE, como SPREADSHEETS_ID, nomes de planilhas, limites de cotas e outras variáveis de ambiente.
 *           Fornece métodos para acessar essas configurações de forma consistente.
 * @module ConfigService
 */

const SPREADSHEETS_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEETS_ID');
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

const CONFIG = {
  SPREADSHEET_ID: SPREADSHEETS_ID, // ID da planilha principal do sistema
  SHEET_NAMES: {
    USERS: 'Usuarios',
    STUDENTS: 'Estudantes',
    SCHOOLS: 'Escolas',
    ROUTES: 'Rotas',
    TRIPS: 'Viagens',
    ATTENDANCE: 'Frequencia',
    NON_BOARDING_NOTICES: 'AvisosNaoEmbarque',
    JOB_QUEUE: 'FilaDeTrabalho',
    OPTIMIZATION_RESULTS: 'ResultadosOtimizacao',
    LOGS: 'Logs',
    EVENTS: 'Eventos',
    VEHICLES: 'Veiculos',
    DRIVERS: 'Motoristas',
    STOP_POINTS: 'PontosDeParada',
    AUDIT_LOGS: 'LogsAuditoria',
    DRIVER_AVAILABILITY: 'DisponibilidadeMotoristas',
    ROUTE_COSTS: 'CustosRotas',
    GEOFENCES: 'Geocercas',
    NOTIFICATION_SETTINGS: 'PreferenciasNotificacao',
    NOTIFICATION_TEMPLATES: 'TemplatesNotificacao',
    ROUTE_HISTORY: 'HistoricoRotas',
    ROUTE_INCIDENTS: 'IncidentesRotas',
    ROUTE_OPTIMIZATION_HISTORY: 'HistoricoOtimizacoes',
    OPTIMIZATION_CONFIG: 'ConfiguracaoOtimizacao',
    OPTIMIZATION_LOGS: 'LogsOtimizacao',
    ROUTE_SCHEDULES: 'AgendaRotas',
    STUDENT_GROUPS: 'GruposEstudantes',
    EMERGENCY_CONTACTS: 'ContatosEmergencia',
    STUDENT_HISTORY: 'HistoricoEstudantes',
    STUDENT_HEALTH: 'SaudeEstudantes',
    STUDENT_PICKUP_DROPOFF: 'EmbarqueDesembarque',
    TRANSPORT_REQUESTS: 'SolicitacoesTransporte',
    VEHICLE_MAINTENANCE: 'ManutencaoVeiculos',
    USER_SETTINGS: 'PreferenciasUsuarios',
    USER_ACTIVITY: 'AtividadesUsuarios'
  },
  // Outras configurações, como limites, URLs de APIs externas, etc.
  // Integrações externas nunca recebem um valor de exemplo. O deployment deve
  // configurar a URL real nas propriedades do script antes de habilitar jobs.
  COLAB_NOTEBOOK_URL: PropertiesService.getScriptProperties().getProperty('COLAB_NOTEBOOK_URL') || '',
  GOOGLE_MAPS_API_KEY: PropertiesService.getScriptProperties().getProperty('GOOGLE_MAPS_API_KEY') || '',
  GEMINI_API_KEY: GEMINI_API_KEY
};

function getConfig(key) {
  // Retorna uma configuração específica ou todo o objeto CONFIG
  if (key) {
    return CONFIG[key];
  }
  return CONFIG;
}

function getSpreadsheetId() {
  return CONFIG.SPREADSHEET_ID;
}

function getSheetName(entity) {
  return CONFIG.SHEET_NAMES[entity.toUpperCase()];
}

function getGeminiApiKey() {
  return CONFIG.GEMINI_API_KEY;
}

function getGoogleMapsApiKey() {
  return String(CONFIG.GOOGLE_MAPS_API_KEY || '');
}
