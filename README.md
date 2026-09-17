# Arquitetura do Sistema de Gestão de Transporte Escolar (SGTE)

Este documento detalha a arquitetura proposta para o Sistema de Gestão de Transporte Escolar (SGTE), conforme os requisitos fornecidos. O sistema será construído sobre a plataforma Google Workspace, utilizando Google Apps Script (`.gs`) para a lógica de negócio determinística e Google Colab (`.py`) para processamento analítico e otimização geoespacial. Todos os dados serão persistidos em uma Google Planilha centralizada, cujo `SPREADSHEETS_ID` será configurado como variável de ambiente.

## Visão Geral da Arquitetura

A arquitetura do SGTE é dividida em três camadas principais, seguindo o padrão híbrido JavaScript-Python descrito no artigo científico fornecido [1]:

1.  **Camada de Apresentação (Frontend):** Composta por arquivos `.html` que fornecem a interface do usuário para interação com o sistema. Inclui formulários de login, dashboards, interfaces de gerenciamento de estudantes e rotas, e formulários para registro de avisos de não embarque.
2.  **Camada de Lógica de Negócio (Backend - Google Apps Script):** Implementada em arquivos `.gs`, esta camada é responsável pela lógica transacional, validação de dados, autenticação (com senhas em texto plano, conforme solicitado pelo usuário, mas com a ressalva de que o artigo sugere `ARGON2ID` para segurança aprimorada), operações CRUD na Google Planilha, e orquestração de tarefas assíncronas, incluindo a integração com o Google Colab para otimização de rotas.
3.  **Camada de Processamento Analítico (Google Colab - Python):** Um notebook `.py` que executa algoritmos de otimização de rotas e gera relatórios de economia de tempo e combustível. Esta camada é acionada assincronamente pelo Apps Script.

Todos os componentes serão armazenados na pasta raiz do projeto para facilitar a gestão e implantação.

## Componentes do Google Apps Script (.gs) - 40 Arquivos

Os arquivos `.gs` contêm a lógica de backend do sistema. Cada arquivo é projetado para uma funcionalidade específica, promovendo modularidade e manutenibilidade. A autenticação de usuários será realizada com senhas em texto plano, conforme a solicitação inicial do usuário, e os dados de login serão armazenados na Google Planilha.

### 1. `AuthService.gs`
*   **Funcionalidade Principal:** Gerencia o processo de autenticação de usuários. Verifica credenciais (usuário e senha em texto plano) contra a planilha de usuários, cria e valida sessões de usuário.
*   **Integrações:** `UserService.gs` (para acesso aos dados de usuário), `SessionService.gs` (para gerenciar sessões).

### 2. `UserService.gs`
*   **Funcionalidade Principal:** Fornece operações CRUD para a entidade 'Usuário' na Google Planilha. Inclui métodos para criar, ler, atualizar e desativar registros de usuários.
*   **Integrações:** `DataService.gs` (para operações genéricas de planilha), `SchemaService.gs` (para validação de esquema de usuário).

### 3. `SessionService.gs`
*   **Funcionalidade Principal:** Gerencia as sessões de usuário, incluindo a criação de tokens de sessão, validação de sessões ativas e encerramento de sessões. Os tokens de sessão são armazenados de forma segura (por exemplo, em propriedades de script ou cache).
*   **Integrações:** `CacheService` (serviço nativo do Apps Script para cache), `PropertiesService` (serviço nativo do Apps Script para propriedades de script).

### 4. `ConfigService.gs`
*   **Funcionalidade Principal:** Centraliza as configurações do sistema, como `SPREADSHEETS_ID`, nomes de planilhas, limites de cotas e outras variáveis de ambiente. Fornece métodos para acessar essas configurações de forma consistente.
*   **Integrações:** Nenhuma direta, serve como base para outros serviços.

### 5. `SchemaService.gs`
*   **Funcionalidade Principal:** Define os esquemas de dados para todas as entidades do sistema (Usuários, Estudantes, Rotas, Avisos, etc.). Inclui validação de tipos de dados, campos obrigatórios e mecanismos de autorrecuperação da estrutura da planilha [1].
*   **Integrações:** `DataService.gs` (para aplicar validações e autorrecuperação).

### 6. `DataService.gs`
*   **Funcionalidade Principal:** Fornece uma interface genérica para operações CRUD em qualquer planilha, abstraindo a interação direta com o `SpreadsheetApp`. Aplica validações de esquema e tratamento de erros.
*   **Integrações:** `SchemaService.gs` (para validação de dados), `Logger.gs` (para registro de operações).

### 7. `StudentService.gs`
*   **Funcionalidade Principal:** Gerencia as operações CRUD para a entidade 'Estudante'. Inclui métodos para cadastrar, consultar, atualizar e desativar estudantes, com suas informações geoespaciais e de acessibilidade.
*   **Integrações:** `DataService.gs`, `SchemaService.gs`, `RouteService.gs` (para vincular estudantes a rotas).

### 8. `RouteService.gs`
*   **Funcionalidade Principal:** Gerencia as operações CRUD para a entidade 'Rota'. Inclui métodos para criar, consultar, atualizar e desativar rotas, com detalhes sobre veículos, capacidade e pontos de parada.
*   **Integrações:** `DataService.gs`, `SchemaService.gs`, `StudentService.gs` (para associar estudantes a rotas).

### 9. `NonBoardingNoticeService.gs`
*   **Funcionalidade Principal:** Permite que as famílias registrem avisos de não embarque de estudantes. Registra a data, estudante, motivo e status do aviso. Aciona o processo de otimização de rota quando um aviso é registrado.
*   **Integrações:** `DataService.gs`, `SchemaService.gs`, `JobQueueService.gs` (para enfileirar tarefas de otimização).

### 10. `OptimizationTriggerService.gs`
*   **Funcionalidade Principal:** Contém a lógica para determinar quando e como acionar a otimização de rotas. Diferencia entre avisos de não embarque (otimização de ida e volta) e não embarques não avisados (otimização apenas de volta).
*   **Integrações:** `NonBoardingNoticeService.gs`, `JobQueueService.gs`.

### 11. `JobQueueService.gs`
*   **Funcionalidade Principal:** Gerencia a fila de tarefas assíncronas, como otimização de rotas. Enfileira jobs, atualiza seus status (PENDING, PROCESSING, COMPLETED, FAILED) e gerencia o payload para o Google Colab [1].
*   **Integrações:** `DataService.gs`, `SchemaService.gs`, `ColabIntegrationService.gs`.

### 12. `ColabIntegrationService.gs`
*   **Funcionalidade Principal:** Responsável por invocar o notebook Python no Google Colab para executar as tarefas de otimização. Passa os dados necessários e recebe os resultados da otimização.
*   **Integrações:** `UrlFetchApp` (serviço nativo do Apps Script para fazer requisições HTTP), `JobQueueService.gs` (para atualizar o status do job).

### 13. `ReportService.gs`
*   **Funcionalidade Principal:** Gera relatórios diversos, incluindo o relatório mensal de economia de tempo e combustível. Coleta dados de viagens e otimizações para calcular as métricas.
*   **Integrações:** `DataService.gs`, `OptimizationResultService.gs`, `GeminiIntegrationService.gs`.

### 14. `GeminiIntegrationService.gs`
*   **Funcionalidade Principal:** Utiliza a `GEMINI_API_KEY` (configurada nas variáveis de ambiente do Apps Script) para interagir com a API Gemini, gerando o pequeno relatório de economia de tempo e combustível com base nos dados fornecidos.
*   **Integrações:** `UrlFetchApp`, `ConfigService.gs`.

### 15. `OptimizationResultService.gs`
*   **Funcionalidade Principal:** Armazena e gerencia os resultados das otimizações de rota recebidos do Google Colab. Inclui as rotas recalculadas, tempos de viagem e outras métricas.
*   **Integrações:** `DataService.gs`, `SchemaService.gs`.

### 16. `DailyCleanupService.gs`
*   **Funcionalidade Principal:** Executa tarefas de manutenção diárias, como arquivamento de dados antigos e limpeza de registros temporários, para garantir a performance da planilha e evitar o limite de células [1].
*   **Integrações:** `ArchiveService.gs`, `DataService.gs`.

### 17. `ArchiveService.gs`
*   **Funcionalidade Principal:** Move dados antigos de planilhas ativas para planilhas de arquivo histórico no Google Drive, conforme as políticas de retenção de dados [1].
*   **Integrações:** `SpreadsheetApp`, `DriveApp` (serviços nativos do Apps Script).

### 18. `Logger.gs`
*   **Funcionalidade Principal:** Fornece um serviço de log centralizado para registrar eventos do sistema, erros e atividades importantes. Os logs são armazenados em uma planilha dedicada.
*   **Integrações:** `DataService.gs`, `SchemaService.gs`.

### 19. `EmailService.gs`
*   **Funcionalidade Principal:** Envia notificações por e-mail para usuários (famílias, transportadores, administradores) sobre avisos de não embarque, atualizações de rota ou relatórios.
*   **Integrações:** `MailApp` (serviço nativo do Apps Script).

### 20. `NotificationService.gs`
*   **Funcionalidade Principal:** Gerencia o envio de notificações para os usuários, podendo ser por e-mail, ou outras formas futuras. Abstrai a lógica de envio para diferentes canais.
*   **Integrações:** `EmailService.gs`.

### 21. `DashboardService.gs`
*   **Funcionalidade Principal:** Prepara os dados para exibição no dashboard principal, agregando informações sobre estudantes, rotas, avisos pendentes e status de otimização.
*   **Integrações:** `StudentService.gs`, `RouteService.gs`, `NonBoardingNoticeService.gs`, `JobQueueService.gs`.

### 22. `FormHandler.gs`
*   **Funcionalidade Principal:** Processa os dados submetidos por formulários HTML, validando-os e encaminhando-os para os serviços apropriados (e.g., `StudentService.gs`, `NonBoardingNoticeService.gs`).
*   **Integrações:** `StudentService.gs`, `NonBoardingNoticeService.gs`, `AuthService.gs`.

### 23. `HtmlServiceUtils.gs`
*   **Funcionalidade Principal:** Contém funções utilitárias para renderização de templates HTML, inclusão de arquivos e passagem de dados do Apps Script para o frontend.
*   **Integrações:** `HtmlService` (serviço nativo do Apps Script).

### 24. `Triggers.gs`
*   **Funcionalidade Principal:** Define e gerencia os gatilhos do Apps Script, como gatilhos de tempo (para `DailyCleanupService.gs`) e gatilhos de edição de planilha (para `OptimizationTriggerService.gs`).
*   **Integrações:** `ScriptApp` (serviço nativo do Apps Script).

### 25. `GeoService.gs`
*   **Funcionalidade Principal:** Fornece funções para manipulação de dados geoespaciais, como validação de coordenadas e cálculo de distâncias básicas. Pode ser usado para pré-processamento antes da otimização no Colab.
*   **Integrações:** Nenhuma direta, utilitário.

### 26. `Validator.gs`
*   **Funcionalidade Principal:** Contém funções genéricas de validação de dados que podem ser reutilizadas por diferentes serviços (e.g., validação de e-mail, CPF, datas).
*   **Integrações:** Nenhuma direta, utilitário.

### 27. `Utils.gs`
*   **Funcionalidade Principal:** Funções utilitárias diversas que não se encaixam em outros serviços específicos (e.g., formatação de datas, manipulação de strings).
*   **Integrações:** Nenhuma direta, utilitário.

### 28. `AdminService.gs`
*   **Funcionalidade Principal:** Fornece funcionalidades administrativas, como gerenciamento de usuários, redefinição de senhas (em texto plano, conforme solicitado), e acesso a logs do sistema.
*   **Integrações:** `UserService.gs`, `Logger.gs`.

### 29. `EventService.gs`
*   **Funcionalidade Principal:** Gerencia eventos do calendário escolar que afetam o transporte, como feriados, dias de reposição e eventos extracurriculares [1].
*   **Integrações:** `DataService.gs`, `SchemaService.gs`, `RouteService.gs`.

### 30. `VehicleService.gs`
*   **Funcionalidade Principal:** Gerencia as operações CRUD para a entidade 'Veículo'. Inclui informações sobre tipo de veículo, capacidade, adaptabilidade e status.
*   **Integrações:** `DataService.gs`, `SchemaService.gs`.

### 31. `DriverService.gs`
*   **Funcionalidade Principal:** Gerencia as operações CRUD para a entidade 'Motorista'. Inclui informações de contato, licença e histórico.
*   **Integrações:** `DataService.gs`, `SchemaService.gs`.

### 32. `StopPointService.gs`
*   **Funcionalidade Principal:** Gerencia os pontos de parada das rotas, incluindo coordenadas e ordem na rota.
*   **Integrações:** `DataService.gs`, `SchemaService.gs`, `RouteService.gs`.

### 33. `AuditService.gs`
*   **Funcionalidade Principal:** Registra todas as ações importantes realizadas no sistema para fins de auditoria e conformidade com a LGPD [1].
*   **Integrações:** `DataService.gs`, `SchemaService.gs`.

### 34. `CacheManager.gs`
*   **Funcionalidade Principal:** Gerencia o cache de dados para melhorar o desempenho do sistema, reduzindo acessos repetitivos à planilha.
*   **Integrações:** `CacheService` (serviço nativo do Apps Script).

### 35. `LockManager.gs`
*   **Funcionalidade Principal:** Gerencia bloqueios para operações críticas, garantindo que apenas uma instância de uma função seja executada por vez, evitando conflitos de dados.
*   **Integrações:** `LockService` (serviço nativo do Apps Script).

### 36. `ErrorHandler.gs`
*   **Funcionalidade Principal:** Centraliza o tratamento de erros do sistema, registrando exceções e fornecendo feedback adequado ao usuário ou ao log.
*   **Integrações:** `Logger.gs`.

### 37. `ReportGenerator.gs`
*   **Funcionalidade Principal:** Funções auxiliares para formatar e gerar os relatórios de forma estruturada, antes de serem processados pelo Gemini ou exibidos.
*   **Integrações:** `ReportService.gs`.

### 38. `RouteOptimizationCallback.gs`
*   **Funcionalidade Principal:** Função de callback que é invocada pelo Google Colab após a conclusão de uma tarefa de otimização de rota, para processar os resultados.
*   **Integrações:** `OptimizationResultService.gs`, `JobQueueService.gs`.

### 39. `ApiGateway.gs`
*   **Funcionalidade Principal:** Atua como um ponto de entrada unificado para as requisições do frontend, roteando-as para os serviços de backend apropriados.
*   **Integrações:** Todos os serviços de backend que expõem funcionalidades para o frontend.

### 40. `SpreadsheetUtils.gs`
*   **Funcionalidade Principal:** Funções utilitárias específicas para manipulação de planilhas que não se encaixam no `DataService.gs` genérico (e.g., formatação condicional, proteção de células).
*   **Integrações:** `SpreadsheetApp`.

## Componentes HTML (.html) - 34 Arquivos

Os arquivos `.html` representam a interface do usuário do SGTE. Eles serão servidos pelo Google Apps Script e interagirão com as funções `.gs` via `google.script.run`.

### 1. `Index.html`
*   **Funcionalidade Principal:** Página inicial do sistema, que pode redirecionar para o login ou para o dashboard se o usuário já estiver autenticado.
*   **Integrações:** `AuthService.gs` (para verificar status de autenticação).

### 2. `Login.html`
*   **Funcionalidade Principal:** Formulário de login para que os usuários acessem o sistema. Coleta nome de usuário e senha (em texto plano).
*   **Integrações:** `AuthService.gs` (para autenticar credenciais).

### 3. `Dashboard.html`
*   **Funcionalidade Principal:** Visão geral do sistema para usuários autenticados, exibindo estatísticas, avisos recentes e status de otimizações.
*   **Integrações:** `DashboardService.gs` (para obter dados do dashboard).

### 4. `StudentList.html`
*   **Funcionalidade Principal:** Exibe uma lista de estudantes cadastrados, com opções de busca, filtro e paginação.
*   **Integrações:** `StudentService.gs` (para obter dados de estudantes).

### 5. `StudentForm.html`
*   **Funcionalidade Principal:** Formulário para cadastrar novos estudantes ou editar informações de estudantes existentes.
*   **Integrações:** `StudentService.gs` (para salvar/atualizar dados de estudantes).

### 6. `RouteList.html`
*   **Funcionalidade Principal:** Exibe uma lista de rotas de transporte, com detalhes e opções de gerenciamento.
*   **Integrações:** `RouteService.gs` (para obter dados de rotas).

### 7. `RouteForm.html`
*   **Funcionalidade Principal:** Formulário para criar novas rotas ou editar rotas existentes.
*   **Integrações:** `RouteService.gs` (para salvar/atualizar dados de rotas).

### 8. `NonBoardingNoticeForm.html`
*   **Funcionalidade Principal:** Formulário para famílias registrarem avisos de não embarque de estudantes.
*   **Integrações:** `NonBoardingNoticeService.gs` (para registrar avisos).

### 9. `NonBoardingNoticeList.html`
*   **Funcionalidade Principal:** Exibe uma lista de avisos de não embarque registrados, com status e detalhes.
*   **Integrações:** `NonBoardingNoticeService.gs` (para obter dados de avisos).

### 10. `ReportViewer.html`
*   **Funcionalidade Principal:** Exibe os relatórios gerados pelo sistema, como o relatório de economia de tempo e combustível.
*   **Integrações:** `ReportService.gs` (para obter conteúdo do relatório).

### 11. `UserList.html`
*   **Funcionalidade Principal:** Interface administrativa para listar e gerenciar usuários do sistema.
*   **Integrações:** `UserService.gs` (para obter dados de usuários).

### 12. `UserForm.html`
*   **Funcionalidade Principal:** Formulário administrativo para criar ou editar usuários, incluindo suas credenciais (usuário e senha em texto plano).
*   **Integrações:** `UserService.gs` (para salvar/atualizar dados de usuários).

### 13. `Settings.html`
*   **Funcionalidade Principal:** Página para configurações gerais do sistema, acessível por administradores.
*   **Integrações:** `ConfigService.gs` (para ler/atualizar configurações).

### 14. `Header.html`
*   **Funcionalidade Principal:** Componente reutilizável para o cabeçalho de todas as páginas, contendo o título do sistema e links de navegação.
*   **Integrações:** Nenhuma direta, componente de UI.

### 15. `Sidebar.html`
*   **Funcionalidade Principal:** Componente reutilizável para a barra lateral de navegação, com links para as diferentes seções do sistema.
*   **Integrações:** Nenhuma direta, componente de UI.

### 16. `Footer.html`
*   **Funcionalidade Principal:** Componente reutilizável para o rodapé das páginas, contendo informações de copyright ou contato.
*   **Integrações:** Nenhuma direta, componente de UI.

### 17. `LoadingSpinner.html`
*   **Funcionalidade Principal:** Componente visual para indicar que uma operação está em andamento.
*   **Integrações:** Nenhuma direta, componente de UI.

### 18. `Modal.html`
*   **Funcionalidade Principal:** Componente reutilizável para exibir caixas de diálogo modais (confirmações, alertas).
*   **Integrações:** Nenhuma direta, componente de UI.

### 19. `ErrorPage.html`
*   **Funcionalidade Principal:** Página genérica para exibir mensagens de erro ao usuário.
*   **Integrações:** `ErrorHandler.gs` (para exibir mensagens de erro).

### 20. `SuccessPage.html`
*   **Funcionalidade Principal:** Página genérica para exibir mensagens de sucesso após uma operação.
*   **Integrações:** Nenhuma direta, componente de UI.

### 21. `RouteMapViewer.html`
*   **Funcionalidade Principal:** Exibe as rotas no mapa, permitindo visualizar os pontos de parada e o trajeto. Pode exibir rotas otimizadas.
*   **Integrações:** `Google Maps API` (via JavaScript no frontend), `RouteService.gs`, `OptimizationResultService.gs`.

### 22. `StudentDetails.html`
*   **Funcionalidade Principal:** Exibe detalhes completos de um estudante específico, incluindo histórico de avisos e rotas associadas.
*   **Integrações:** `StudentService.gs`, `NonBoardingNoticeService.gs`.

### 23. `RouteDetails.html`
*   **Funcionalidade Principal:** Exibe detalhes completos de uma rota específica, incluindo estudantes associados e horários.
*   **Integrações:** `RouteService.gs`, `StudentService.gs`.

### 24. `AnalyticsDashboard.html`
*   **Funcionalidade Principal:** Dashboard com gráficos e estatísticas sobre o desempenho do transporte, incluindo os gráficos de tempo de viagem.
*   **Integrações:** `ReportService.gs` (para obter dados analíticos).

### 25. `VehicleList.html`
*   **Funcionalidade Principal:** Interface administrativa para listar e gerenciar veículos.
*   **Integrações:** `VehicleService.gs`.

### 26. `VehicleForm.html`
*   **Funcionalidade Principal:** Formulário administrativo para criar ou editar veículos.
*   **Integrações:** `VehicleService.gs`.

### 27. `DriverList.html`
*   **Funcionalidade Principal:** Interface administrativa para listar e gerenciar motoristas.
*   **Integrações:** `DriverService.gs`.

### 28. `DriverForm.html`
*   **Funcionalidade Principal:** Formulário administrativo para criar ou editar motoristas.
*   **Integrações:** `DriverService.gs`.

### 29. `StopPointList.html`
*   **Funcionalidade Principal:** Interface para listar e gerenciar pontos de parada.
*   **Integrações:** `StopPointService.gs`.

### 30. `StopPointForm.html`
*   **Funcionalidade Principal:** Formulário para criar ou editar pontos de parada.
*   **Integrações:** `StopPointService.gs`.

### 31. `EventList.html`
*   **Funcionalidade Principal:** Interface para listar e gerenciar eventos do calendário escolar.
*   **Integrações:** `EventService.gs`.

### 32. `EventForm.html`
*   **Funcionalidade Principal:** Formulário para criar ou editar eventos do calendário escolar.
*   **Integrações:** `EventService.gs`.

### 33. `AuditLogViewer.html`
*   **Funcionalidade Principal:** Interface administrativa para visualizar os logs de auditoria do sistema.
*   **Integrações:** `AuditService.gs`.

### 34. `Help.html`
*   **Funcionalidade Principal:** Página de ajuda ou FAQ para os usuários do sistema.
*   **Integrações:** Nenhuma direta, conteúdo estático.

## Notebook Python (.py) - 1 Arquivo

O arquivo `.py` será executado no Google Colab e é o coração da otimização geoespacial e da geração de relatórios avançados.

### 1. `notebook.py`
*   **Funcionalidade Principal:** Contém a lógica para as duas otimizações de rota (com e sem aviso de não embarque) e para a geração dos gráficos comparativos de tempo de viagem. Também calcula a economia de tempo e combustível para o relatório mensal. Utiliza bibliotecas Python para geoprocessamento e otimização combinatória.
*   **Integrações:** Recebe dados de estudantes e rotas do Google Apps Script, utiliza APIs de mapeamento (e.g., Google Directions API) para cálculo de rotas, e envia os resultados da otimização e os dados para o relatório de volta para o Google Apps Script.
*   **Variáveis de Ambiente:** Acessa `GEMINI_API_KEY` para interagir com a API Gemini para geração de relatórios textuais, e `SPREADSHEETS_ID` para leitura/escrita de dados de otimização e resultados.

## Referências

[1] Pessoa Júnior, H. C., Castioni, R., & Nascentes, A. P. L. (2024). **Arquiteturas Híbridas de Nuvem na Geoinformática da Administração Pública: Uma Análise Abrangente do Ecossistema Determinístico-Generativo do TE-DF.** (Artigo fornecido pelo usuário).


---

## Mapeamento de Schema da Planilha (item 6 — pré-requisito para fixtures analíticos)

> **Status do catálogo AI:** vazio — apesar de o `SchemaService` ter o schema mais rico da frota (30+ entidades), nenhuma está exposta no `AI_FIXTURE_CATALOG` como fixture semântico.

### Abas declaradas no SchemaService (núcleo — tier: core)

| Aba (sheetName) | Entidade | Descrição |
|---|---|---|
| `Users` | USERS | Credenciais e papéis de acesso — `ID`, `Username`, `Password`, `Role`, `Status`, `Email`, `CreatedAt`, `UpdatedAt` |
| `Students` | STUDENTS | Cadastro operacional dos estudantes — `ID`, `Name`, `EnrollmentNumber`, `SchoolID`, `School`, `Address`, `Latitude`, `Longitude`, `AccessibilityNeeds`, `MedicalConditions`, `RouteID`, `FamilyContact`, `FamilyPhone`, `Status`, `CreatedAt`, `UpdatedAt` |
| `Schools` | SCHOOLS | Escolas atendidas — `ID`, `Name`, `Address`, `Latitude`, `Longitude`, `ContactPerson`, `ContactPhone`, `Status`, `CreatedAt`, `UpdatedAt` |
| `Drivers` | DRIVERS | Motoristas — `ID`, `Name`, `LicenseNumber`, `ContactPhone`, `Email`, `Status`, `CreatedAt`, `UpdatedAt` |
| `Vehicles` | VEHICLES | Frota disponível — `ID`, `LicensePlate`, `Model`, `Type`, `Capacity`, `FuelType`, `IsAccessible`, `Status`, `CreatedAt`, `UpdatedAt` |
| `Routes` | ROUTES | **Domínio analítico** — `ID`, `RouteName`, `VehicleID`, `DriverID`, `Capacity`, `CurrentStudents`, `Status`, `StartTime`, `EndTime`, `Distance`, `Duration`, `CurrentLatitude`, `CurrentLongitude`, `ETA`, `CreatedAt`, `UpdatedAt` |
| `Stop_Points` | STOP_POINTS | Sequência de paradas — `ID`, `RouteID`, `Address`, `Latitude`, `Longitude`, `Order`, `ArrivalTime`, `DepartureTime`, `CreatedAt`, `UpdatedAt` |
| `Trips` | TRIPS | **Domínio analítico** — `ID`, `RouteID`, `VehicleID`, `DriverID`, `TripDate`, `TripType`, `StartTime`, `EndTime`, `StudentsCount`, `Distance`, `Duration`, `Status`, `CreatedAt`, `UpdatedAt` |
| `Attendance` | ATTENDANCE | **Domínio analítico** — `ID`, `StudentID`, `RouteID`, `TripID`, `AttendanceDate`, `TripType`, `Status`, `IncidentDetails`, `RecordedBy`, `CreatedAt`, `UpdatedAt` |
| `Non_Boarding_Notices` | NON_BOARDING_NOTICES | **Domínio analítico** — `ID`, `StudentID`, `NoticeDate`, `TripType`, `Reason`, `Status`, `NotifiedBy`, `NotificationMethod`, `OptimizationTriggered`, `CreatedAt`, `UpdatedAt` |
| `Events` | EVENTS | Calendário de eventos — `ID`, `EventType`, `EventDate`, `EndDate`, `Description`, `AffectsRoutes`, `Status`, `CreatedAt`, `UpdatedAt` |
| `Job_Queue` | JOB_QUEUE | Fila assíncrona de otimização — `JobID`, `JobType`, `Status`, `Payload`, `Result`, `RequestedAt`, `StartedAt`, `CompletedAt`, `ErrorMessage`, `UpdatedAt` |
| `Optimization_Results` | OPTIMIZATION_RESULTS | **Domínio analítico** — `ResultID`, `JobID`, `RouteID`, `OriginalDuration`, `OptimizedDuration`, `OriginalDistance`, `OptimizedDistance`, `FuelSaved`, `TimeSaved`, `OptimizationDate`, `RouteData`, `CreatedAt` |
| `Logs` | LOGS | Infraestrutura — `Timestamp`, `Level`, `Message`, `Context` |
| `Audit_Logs` | AUDIT_LOGS | Infraestrutura — `Timestamp`, `UserID`, `Action`, `Entity`, `EntityID`, `Details` |

### Abas de extensão (tier: optional — 15+ abas adicionais)

`Driver_Availability`, `Route_Costs`, `Geofences`, `Notification_Settings`, `Notification_Templates`, `Route_History`, `Route_Incidents`, `Route_Optimization_History`, `Optimization_Config`, `Optimization_Logs`, `Route_Schedules`, `Student_Groups`, `Emergency_Contacts`, `Student_History`, `Student_Health`, `Student_Pickup_Dropoff`, `Transport_Requests`, `Vehicle_Maintenance`, `User_Settings`, `User_Activity`.

### Semântica das colunas analíticas-chave

**`Routes`**:
- `CurrentLatitude/Longitude`, `ETA`: posição em tempo real e estimativa de chegada — dados operacionais vivos.
- `Distance` / `Duration`: baseline para cálculo de economia na otimização.

**`Attendance`**:
- `TripType`: `"ida"` | `"volta"` — distingue presença nos dois trajetos do dia.
- `Status`: `"present"` | `"absent"` | `"late"` — granularidade para análise de pontualidade.

**`Non_Boarding_Notices`**:
- `OptimizationTriggered`: booleano — indica se o aviso disparou re-otimização de rota.
- `Reason`: motivo do não embarque — dados para análise de padrões de ausência.

**`Optimization_Results`**:
- `FuelSaved` / `TimeSaved`: economia calculada pelo algoritmo — KPIs de eficiência.
- `RouteData`: JSON com a rota otimizada — necessário para visualização.

### Entidades pendentes de mapeamento analítico

| Entidade | Por que ainda não catalogada como fixture | O que precisa ser feito |
|---|---|---|
| `Routes` + `Stop_Points` | Schema completo mas sem dados de rota de exemplo | Criar 2 rotas contrastantes: rota eficiente (poucos pontos, baixo desvio) vs. ineficiente |
| `Students` + `Attendance` | Sem cenários de presença/ausência | Criar aluno com alta assiduidade vs. aluno com padrão de ausências às terças |
| `Non_Boarding_Notices` + `Optimization_Results` | Sem ciclo completo de aviso → otimização | Criar aviso que dispara otimização com economia calculada |
| `Trips` | Sem execuções de rota de exemplo | Criar 2–3 viagens de ida/volta por rota |

**Abas excluídas do catálogo analítico (correto):** `Users`, `Logs`, `Audit_Logs`, `Job_Queue`, `Notification_*`, `User_Settings/Activity`.
