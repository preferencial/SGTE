/**
 * PromptContextBuilder.gs — Montador de contexto com privacidade por construção.
 *
 * FROTA-02: Privacidade por construção e minimização do prompt.
 *
 * CASOS DE USO declarados neste projeto (Preferencial - SGTE):
 *   - 'savings.monthly'  → mês, ano, totais agregados (sem nomes de alunos)
 *   - 'savings.route'    → métricas de rota calculadas (sem dados nominais)
 *   - 'themeDigest'      → manchetes públicas, tema, audiência
 *
 * IDENTIFICADORES PROIBIDOS (nunca chegam ao Gemini):
 *   email, nome, cpf, ra, matricula, id_externo, telefone, endereco,
 *   responsavel, turma_nominal, nota_livre, observacao_pessoal, student*
 */

var PromptContextBuilder = (function () {
  var MIN_GROUP_SIZE = 5;

  var ALLOWED_FIELDS = {
    'savings.monthly': ['month', 'year', 'totalTimeSaved', 'totalFuelSaved'],
    'savings.route':   [
      'routeName', 'changeDescription', 'originalDuration', 'optimizedDuration',
      'originalDistance', 'optimizedDistance', 'affectedFamilies',
      'effectiveDate', 'notes'
    ],
    'themeDigest':     ['theme', 'query', 'audience', 'headlines']
  };

  var PII_PATTERNS = [
    /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g,
    /\b\d{3}\.?\d{3}\.?\d{3}\-?\d{2}\b/g,
    /\b\d{7,12}\b/g,
    /\b[0-9]{10,11}\b/g,
    /\b(aluno|estudante|professor|responsavel)\s+[A-ZÀ-Ú][a-zà-ú]+/gi
  ];

  var BLOCKED_KEYS = [
    'email', 'nome', 'cpf', 'ra', 'matricula', 'id_externo', 'telefone',
    'endereco', 'responsavel_nome', 'turma_nominal', 'nota_livre',
    'observacao_pessoal', 'name', 'student_name', 'teacher_name',
    'studentName', 'driverName', 'driverEmail'
  ];

  function stripPii(text) {
    try {
      if (typeof text !== 'string') return text;
      var result = text;
      for (var i = 0; i < PII_PATTERNS.length; i++) {
        result = result.replace(PII_PATTERNS[i], '[OMITIDO]');
      }
      return result;
    } catch (error) {
      Logger.log("Erro em stripPii: " + error.message);
      throw error;
    }
  }

  function containsPii(text) {
    if (typeof text !== 'string') return false;
    for (var i = 0; i < PII_PATTERNS.length; i++) {
      PII_PATTERNS[i].lastIndex = 0;
      if (PII_PATTERNS[i].test(text)) return true;
    }
    return false;
  }

  function sanitizeValue(value, maxLen) {
    try {
      maxLen = maxLen || 500;
      if (typeof value === 'string') return stripPii(value).slice(0, maxLen);
      if (typeof value === 'number' || typeof value === 'boolean') return value;
      return null;
    } catch (error) {
      Logger.log("Erro em sanitizeValue: " + error.message);
      throw error;
    }
  }

  function build(useCase, rawData) {
    try {
      var allowed = ALLOWED_FIELDS[useCase];
      if (!allowed) throw new Error('PromptContextBuilder: caso de uso desconhecido "' + useCase + '".');

      rawData = rawData || {};
      var context = {};
      var droppedKeys = [];

      Object.keys(rawData).forEach(function (key) {
        var keyLower = key.toLowerCase();
        if (BLOCKED_KEYS.indexOf(keyLower) !== -1) { droppedKeys.push(key); return; }
        if (allowed.indexOf(key) === -1) { droppedKeys.push(key); return; }
        if (key === 'headlines' && Array.isArray(rawData[key])) {
          context[key] = rawData[key].map(function (item) {
            return { title: sanitizeValue(item.title, 300), source: sanitizeValue(item.source, 100) };
          });
          return;
        }
        context[key] = sanitizeValue(rawData[key]);
      });

      return { context: context, droppedKeys: droppedKeys };
    } catch (error) {
      Logger.log("Erro em build: " + error.message);
      throw error;
    }
  }

  function assertMinimumGroup(groupSize, useCase) {
    try {
      var size = Number(groupSize);
      if (!isFinite(size) || size < MIN_GROUP_SIZE) {
        throw new Error('PromptContextBuilder [' + useCase + ']: grupo abaixo do limiar mínimo de ' +
          MIN_GROUP_SIZE + '.');
      }
      return size;
    } catch (error) {
      Logger.log("Erro em assertMinimumGroup: " + error.message);
      throw error;
    }
  }

  function buildGeminiPayload(prompt, generationConfig) {
    try {
      var safePrompt = stripPii(String(prompt == null ? '' : prompt));
      if (containsPii(safePrompt)) {
        throw new Error('PromptContextBuilder: identificador detectado no payload final.');
      }
      return {
        contents: [{ role: 'user', parts: [{ text: safePrompt }] }],
        generationConfig: generationConfig || {}
      };
    } catch (error) {
      Logger.log("Erro em buildGeminiPayload: " + error.message);
      throw error;
    }
  }

  function logAudit(useCase, droppedKeys) {
    try {
      if (droppedKeys.length === 0) return;
      Logger.log('PromptContextBuilder [' + useCase + ']: ' +
        droppedKeys.length + ' campo(s) omitido(s) — chaves: ' +
        droppedKeys.join(', ') + ' (valores não registrados).');
    } catch (error) {
      Logger.log("Erro em logAudit: " + error.message);
      throw error;
    }
  }

  return {
    build: build,
    stripPii: stripPii,
    containsPii: containsPii,
    assertMinimumGroup: assertMinimumGroup,
    buildGeminiPayload: buildGeminiPayload,
    logAudit: logAudit
  };
})();
