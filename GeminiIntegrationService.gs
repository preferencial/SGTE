// GeminiIntegrationService.gs
/**
 * @overview Utiliza a GEMINI_API_KEY (configurada nas variáveis de ambiente do Apps Script) para interagir com a API Gemini,
 *           gerando o pequeno relatório de economia de tempo e combustível com base nos dados fornecidos.
 * @module GeminiIntegrationService
 * @requires ConfigService.gs para obter a GEMINI_API_KEY.
 * @requires UrlFetchApp (serviço nativo do Apps Script para fazer requisições HTTP).
 * @requires Logger.gs para registro de operações.
 */

// FROTA-07: modelo lido da property do script, nunca hardcoded; cai no padrão local.
// Substitui o antigo 'gemini-pro' (endpoint v1beta descontinuado).
function sgteModel_() {
  try {
    return PropertiesService.getScriptProperties().getProperty('GEMINI_MODEL') || 'gemini-2.0-flash';
  } catch (e) {
    LoggerService.info('SGTE/FROTA-07 property indisponível: ' + e.message);
    return 'gemini-2.0-flash';
  }
}

function generateSavingsSummary(reportData) {
  // FROTA-05: rate limit, dedup e quota antes de chamar o provedor
  var _rl05 = AiRateLimitService.check('sgteReport', JSON.stringify(reportData));
  if (_rl05.dedupHit) return _rl05.cached;
  const routeChange = Boolean(reportData && (
    reportData.routeName || reportData.originalDuration || reportData.optimizedDuration ||
    reportData.affectedFamilies || reportData.changeDescription
  ));
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    warn("GEMINI_API_KEY não configurada.", "GeminiIntegrationService");
    return routeChange
      ? buildRouteChangeFallback_(reportData)
      : "Resumo por IA indisponível porque a chave do Gemini não está configurada.";
  }

  const prompt = routeChange
    ? buildRouteChangePrompt_(reportData)
    : buildMonthlySavingsPrompt_(reportData);

  try {
    const response = fetchGeminiComRetentativa_("https://generativelanguage.googleapis.com/v1beta/models/" + sgteModel_() + ":generateContent?key=" + apiKey, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(PromptContextBuilder.buildGeminiPayload(prompt))
    });

    const jsonResponse = JSON.parse(response.getContentText());
    // FROTA-XX: extração defensiva com GeminiResponseNormalizer
    const text = GeminiResponseNormalizer.extractText(jsonResponse);
    if (text) {
      return routeChange ? normalizeRouteChangeSummary_(parseGeminiJson_(text)) : text;
    } else {
      error("Resposta da API Gemini sem candidatos válidos.", "GeminiIntegrationService");
      return "Não foi possível gerar o relatório de economia: Resposta inválida da API Gemini.";
    }
  } catch (e) {
    error(`Erro ao chamar a API Gemini: ${e.message}`, "GeminiIntegrationService");
    return routeChange
      ? buildRouteChangeFallback_(reportData)
      : `Não foi possível gerar o relatório de economia: ${e.message}`;
  }
}

function buildMonthlySavingsPrompt_(reportData) {
  // FROTA-02: passa apenas métricas agregadas pela lista positiva
  var built = PromptContextBuilder.build('savings.monthly', {
    month:          reportData.month,
    year:           reportData.year,
    totalTimeSaved: reportData.totalTimeSaved,
    totalFuelSaved: reportData.totalFuelSaved
  });
  PromptContextBuilder.logAudit('savings.monthly', built.droppedKeys);
  var ctx = built.context;

  return 'Com base nos seguintes dados de economia de transporte escolar para o mês de ' +
    (ctx.month || '') + '/' + (ctx.year || '') + ':\n' +
    '  - Tempo total economizado: ' + (ctx.totalTimeSaved || 0) + ' minutos\n' +
    '  - Combustível total economizado: ' + (ctx.totalFuelSaved || 0) + ' litros\n\n' +
    'Gere um pequeno relatório conciso (aproximadamente 100-150 palavras) ' +
    'destacando os benefícios e o impacto dessas economias para o sistema de transporte escolar.';
}

function buildRouteChangePrompt_(reportData) {
  try {
    try {
      if (Number(reportData.affectedFamilies) > 0) {
        PromptContextBuilder.assertMinimumGroup(reportData.affectedFamilies, 'savings.route');
      }
      // FROTA-02: monta contexto com lista positiva — sem nomes nominais de alunos,
      // motoristas ou responsáveis. Apenas métricas calculadas e dados da rota.
      var built = PromptContextBuilder.build('savings.route', {
        routeName:         reportData.routeName,
        changeDescription: reportData.changeDescription,
        originalDuration:  reportData.originalDuration,
        optimizedDuration: reportData.optimizedDuration,
        originalDistance:  reportData.originalDistance,
        optimizedDistance: reportData.optimizedDistance,
        affectedFamilies:  reportData.affectedFamilies,
        effectiveDate:     reportData.effectiveDate,
        notes:             reportData.notes
      });
      PromptContextBuilder.logAudit('savings.route', built.droppedKeys);
      var ctx = built.context;

      return [
        "Você apoia a gestão de transporte escolar. A rota abaixo já foi calculada por um módulo geoespacial determinístico.",
        "A IA deve apenas explicar os resultados e redigir uma minuta de comunicado; não deve recalcular, aprovar ou declarar segura a rota.",
        "",
        "Dados calculados: " + JSON.stringify({
          rota:                ctx.routeName         || "não informada",
          alteracao:           ctx.changeDescription || "não informada",
          duracaoOriginalMin:  Number(ctx.originalDuration)  || 0,
          duracaoOtimizadaMin: Number(ctx.optimizedDuration) || 0,
          distanciaOriginalKm: Number(ctx.originalDistance)  || 0,
          distanciaOtimizadaKm:Number(ctx.optimizedDistance) || 0,
          familiasAfetadas:    Number(ctx.affectedFamilies)  || 0,
          inicioPrevisto:      ctx.effectiveDate     || "a confirmar",
          observacoes:         ctx.notes             || ""
        }),
        "",
        "Responda SOMENTE com JSON válido, sem markdown, no formato:",
        '{"impactSummary":"texto","familyNotice":"texto","validationChecklist":["item"],"limitations":["item"],"humanApprovalRequired":true}',
        "O resumo deve explicar diferenças e impactos sem inventar dados.",
        "O comunicado deve ser claro, acolhedor, informar que horários e pontos só valem após confirmação oficial e indicar canal de contato.",
        "O checklist deve exigir validação humana de segurança viária, capacidade do veículo, acessibilidade, tempos, pontos de parada e comunicação.",
        "Não afirme que a rota é segura, viável ou aprovada. Não envie mensagens."
      ].join("\n");
    } catch (error) {
      Logger.log("Erro em buildRouteChangePrompt_: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em buildRouteChangePrompt_: " + error.message);
    throw error;
  }
}

function parseGeminiJson_(text) {
  try {
    try {
      return JSON.parse(String(text || "").trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, ""));
    } catch (error) {
      Logger.log("Erro em parseGeminiJson_: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em parseGeminiJson_: " + error.message);
    throw error;
  }
}

function normalizeRouteChangeSummary_(data) {
  try {
    data = data && typeof data === "object" ? data : {};
    return {
      impactSummary: String(data.impactSummary || "A alteração deve ser revisada pela gestão antes da comunicação."),
      familyNotice: String(data.familyNotice || "Minuta indisponível. Confirme os dados da rota antes de comunicar as famílias."),
      validationChecklist: Array.isArray(data.validationChecklist) ? data.validationChecklist.slice(0, 8) : [],
      limitations: Array.isArray(data.limitations) ? data.limitations.slice(0, 6) : [],
      humanApprovalRequired: true,
      automaticallySent: false
    };
  } catch (error) {
    Logger.log("Erro em normalizeRouteChangeSummary_: " + error.message);
    throw error;
  }
}

function buildRouteChangeFallback_(reportData) {
  try {
    try {
      const routeName = String(reportData && reportData.routeName || "rota informada");
      return normalizeRouteChangeSummary_({
        impactSummary: "A alteração da " + routeName + " foi calculada pelo módulo geoespacial e aguarda validação operacional humana.",
        familyNotice: "Prezadas famílias, a gestão está avaliando uma possível alteração na " + routeName + ". Horários, pontos e data de início somente terão validade após confirmação oficial da escola. Em caso de dúvida, procure o canal habitual de atendimento.",
        validationChecklist: [
          "Validar segurança e viabilidade viária do percurso.",
          "Confirmar capacidade e disponibilidade do veículo.",
          "Revisar acessibilidade e pontos de embarque.",
          "Confirmar horários com motorista e monitoria.",
          "Aprovar a comunicação antes do envio."
        ],
        limitations: ["Texto local gerado sem Gemini; dados e condições de campo devem ser conferidos."]
      });
    } catch (error) {
      Logger.log("Erro em buildRouteChangeFallback_: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  } catch (error) {
    Logger.log("Erro em buildRouteChangeFallback_: " + error.message);
    throw error;
  }
}

/**
 * Wrapper de resiliência sobre UrlFetchApp.fetch para a API Gemini.
 * Força muteHttpExceptions internamente para inspecionar o código HTTP e
 * repete em falhas transitórias (HTTP 429/500/503 e exceções de rede) com
 * backoff exponencial. Em erro permanente (>=400 após as tentativas) lança
 * Error — preservando o tratamento de quem chama (try/catch que devolve a
 * mensagem amigável).
 *
 * @param {string} url
 * @param {Object} options Opções do UrlFetchApp.fetch (muteHttpExceptions é forçado).
 * @return {GoogleAppsScript.URL_Fetch.HTTPResponse} Resposta com código < 400.
 */
function fetchGeminiComRetentativa_(url, options) {
  const opcoes = {};
  for (const chave in options) {
    if (Object.prototype.hasOwnProperty.call(options, chave)) opcoes[chave] = options[chave];
  }
  opcoes.muteHttpExceptions = true;

  const MAX_TENTATIVAS = 3;
  let esperaMs = 700;
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    let resp;
    try {
      resp = UrlFetchApp.fetch(url, opcoes);
    } catch (e) {
      if (tentativa >= MAX_TENTATIVAS) throw e;
      Utilities.sleep(esperaMs);
      esperaMs *= 2;
      continue;
    }

    const codigo = resp.getResponseCode();
    const transitorio = (codigo === 429 || codigo === 500 || codigo === 503);
    if (transitorio && tentativa < MAX_TENTATIVAS) {
      Utilities.sleep(esperaMs);
      esperaMs *= 2;
      continue;
    }
    if (codigo >= 400) {
      throw new Error('Gemini HTTP ' + codigo + ': ' + resp.getContentText().slice(0, 300));
    }
    return resp;
  }
}
