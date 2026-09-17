// HtmlServiceUtils.gs
/**
 * @overview Contém funções utilitárias para renderização de templates HTML, inclusão de arquivos e passagem de dados do Apps Script para o frontend no SGTE.
 * @module HtmlServiceUtils
 * @requires HtmlService (serviço nativo do Apps Script).
 */

function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    Logger.log("Erro em include: " + error.message);
    throw error;
  }
}

/**
 * Compacta dados estáticos para uso em data URLs (como logos base64)
 * Remove todos os espaços em branco para otimizar o tamanho
 */
function includeInlineData(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent().replace(/\s+/g, '');
}

function renderHtmlTemplate(templateName, data) {
  try {
    const template = HtmlService.createTemplateFromFile(templateName);
    template.data = data || {};
    return template.evaluate()
                   .setTitle("SGTE")
                   .setFaviconUrl("https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png");
  } catch (error) {
    Logger.log("Erro em renderHtmlTemplate: " + error.message);
    throw error;
  }
}

function renderAuthenticatedTemplate(pageName, data, user, routeName) {
  try {
    const page = evaluateTemplateParts_(pageName, data || {});
    const layout = HtmlService.createTemplateFromFile("Layout");

    layout.pageHead = page.head;
    layout.pageContent = page.body;
    layout.pageTitle = page.title || pageName;
    layout.currentRoute = routeName || pageName;
    layout.routeParameters = data || {};
    layout.currentUser = sanitizeUserForClient_(user);
    layout.scriptUrl = getScriptUrl();

    return layout.evaluate()
                 .setTitle(`SGTE - ${layout.pageTitle}`)
                 .setFaviconUrl("https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png");
  } catch (error) {
    Logger.log("Erro em renderAuthenticatedTemplate: " + error.message);
    throw error;
  }
}

function renderPartialTemplate(pageName, data) {
  return evaluateTemplateParts_(pageName, data || {}).body;
}

function evaluateTemplateParts_(templateName, data) {
  try {
    const template = HtmlService.createTemplateFromFile(templateName);
    template.data = data || {};
    const html = template.evaluate().getContent();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

    return {
      title: titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : templateName,
      head: sanitizePageHead_(headMatch ? headMatch[1] : ""),
      body: sanitizePageBody_(bodyMatch ? bodyMatch[1] : html)
    };
  } catch (error) {
    Logger.log("Erro em evaluateTemplateParts_: " + error.message);
    throw error;
  }
}

function sanitizePageHead_(head) {
  try {
    return head
      .replace(/<base\b[^>]*>/gi, "")
      .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
      .replace(/<meta\b[^>]*name=["']viewport["'][^>]*>/gi, "")
      .replace(/<link\b[^>]*materialize[^>]*>/gi, "")
      .replace(/<link\b[^>]*fonts\.googleapis\.com\/icon[^>]*>/gi, "")
      .trim();
  } catch (error) {
    Logger.log("Erro em sanitizePageHead_: " + error.message);
    throw error;
  }
}

function sanitizePageBody_(body) {
  try {
    return body
      .replace(/<script\b[^>]*src=["'][^"']*materialize[^"']*["'][^>]*><\/script>/gi, "")
      .trim();
  } catch (error) {
    Logger.log("Erro em sanitizePageBody_: " + error.message);
    throw error;
  }
}

function sanitizeUserForClient_(user) {
  if (!user) {
    return null;
  }

  return {
    ID: user.ID,
    Username: user.Username,
    Role: user.Role
  };
}

function getScriptUrl() {
  try {
    return ScriptApp.getService().getUrl();
  } catch (error) {
    Logger.log("Erro em getScriptUrl: " + error.message);
    throw error;
  }
}
