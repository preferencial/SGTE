/**
 * AuthHelpers.gs — Rotinas Reutilizáveis De Autenticação (Prompt 18)
 *
 * Implementa 11 rotinas padrão de autenticação baseadas em token para a frota.
 * Todas as rotinas são idempotentes e seguem o padrão: token em ScriptProperties,
 * nunca em cache de usuário, e nunca em propriedades específicas de usuário.
 *
 * Este arquivo é parte da padronização de autenticação em toda a frota.
 */

const SGTE_AUTH_CONFIG_ = {
  SESSION_KEY_PREFIX: 'SGTE_SESSION_',
  SESSION_TTL_SECONDS: 21600,
  TOKEN_LENGTH: 32
};

function ensureUsuariosSheet_() {
  try {
    const ss = (typeof getBoundSpreadsheet_ === 'function')
      ? getBoundSpreadsheet_()
      : SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Usuarios');
    if (!sheet) {
      sheet = ss.insertSheet('Usuarios');
      sheet.getRange(1, 1, 1, 8).setValues([
        ['ID', 'Username', 'Password', 'PasswordHash', 'Role', 'Nome', 'Email', 'Status']
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    }
    return sheet;
  } catch (error) {
    Logger.log("Erro em ensureUsuariosSheet_: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}

function seedSyntheticAdminUsers_() {
  try {
    try {
      const sheet = ensureUsuariosSheet_();
      const data = sheet.getDataRange().getValues();
      const existingUsernames = data.slice(1).map(row => String(row[1]).toLowerCase());
  
      const toAdd = [];
      for (let i = 1; i <= 15; i++) {
        const username = `admin${String(i).padStart(2, '0')}`;
        if (!existingUsernames.includes(username)) {
          toAdd.push([
            Utilities.getUuid(),
            username,
            'admin123',
            '',
            'Admin',
            `Administrador ${i}`,
            `${username}@synthetic.local`,
            'Active'
          ]);
        }
      }
  
      if (toAdd.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, toAdd.length, 8).setValues(toAdd);
      }
      return { added: toAdd.length, total: 15 };
    } catch (error) {
      Logger.log("Erro em seedSyntheticAdminUsers_: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  } catch (error) {
    Logger.log("Erro em seedSyntheticAdminUsers_: " + error.message);
    throw error;
  }
}

function readUsuariosRows_() {
  try {
    try {
      const sheet = ensureUsuariosSheet_();
      const data = sheet.getDataRange().getValues();
      return { headers: data[0], rows: data.slice(1) };
    } catch (error) {
      Logger.log("Erro em readUsuariosRows_: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em readUsuariosRows_: " + error.message);
    throw error;
  }
}

function findPlaintextUser_(username) {
  try {
    const normalized = String(username).toLowerCase().trim();
    const { headers, rows } = readUsuariosRows_();
  
    const headerMap = {};
    headers.forEach((h, i) => {
      headerMap[String(h).toLowerCase().trim()] = i;
    });
  
    const iId = headerMap['id'];
    const iUser = headerMap['username'];
    const iPass = headerMap['password'];
    const iRole = headerMap['role'];
    const iNome = headerMap['nome'];
    const iEmail = headerMap['email'];
    const iStatus = headerMap['status'];
  
    for (const row of rows) {
      if (String(row[iUser]).toLowerCase().trim() === normalized) {
        const status = iStatus !== undefined ? String(row[iStatus]).toLowerCase() : 'active';
        return {
          id: String(row[iId] || row[iUser]),
          username: String(row[iUser]),
          password: String(row[iPass] || ''),
          role: String(row[iRole] || 'Admin'),
          nome: iNome !== undefined ? String(row[iNome]) : String(row[iUser]),
          email: iEmail !== undefined ? String(row[iEmail]) : '',
          active: status === 'active' || status === 'ativo' || status === ''
        };
      }
    }
    return null;
  } catch (error) {
    Logger.log("Erro em findPlaintextUser_: " + error.message);
    throw error;
  }
}

function loginWithToken(username, password) {
  try {
    try {
      try {
        try {
          if (!username || username.trim().length === 0) {
            return { success: false, message: 'Usuário não pode estar vazio.' };
          }
          if (!password || password.length === 0) {
            return { success: false, message: 'Senha não pode estar vazia.' };
          }
    
          const user = findPlaintextUser_(username);
          if (!user) {
            return { success: false, message: 'Credenciais inválidas.' };
          }
    
          if (!user.active) {
            return { success: false, message: 'Usuário inativo.' };
          }
    
          if (user.password !== password) {
            return { success: false, message: 'Credenciais inválidas.' };
          }
    
          const token = Utilities.getUuid().replace(/-/g, '');
          const session = {
            userId: user.id,
            username: user.username,
            role: user.role,
            nome: user.nome,
            email: user.email,
            issuedAt: Date.now(),
            expiresAt: Date.now() + (SGTE_AUTH_CONFIG_.SESSION_TTL_SECONDS * 1000)
          };
    
          PropertiesService.getScriptProperties().setProperty(
            SGTE_AUTH_CONFIG_.SESSION_KEY_PREFIX + token,
            JSON.stringify(session)
          );
    
          return {
            success: true,
            token: token,
            user: { id: user.id, username: user.username, nome: user.nome, email: user.email, role: user.role },
            redirectUrl: ScriptApp.getService().getUrl() + '?page=app#tok=' + encodeURIComponent(token),
            message: 'Login realizado com sucesso.'
          };
        } catch (error) {
          return { success: false, message: String(error.message || error) };
        }
      } catch (error) {
        Logger.log("Erro em loginWithToken: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em loginWithToken: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em loginWithToken: " + error.message);
    throw error;
  }
}

function isAuthenticatedByToken(tok) {
  try {
    try {
      try {
        if (!tok) return false;
        const key = SGTE_AUTH_CONFIG_.SESSION_KEY_PREFIX + tok;
        const raw = PropertiesService.getScriptProperties().getProperty(key);
        if (!raw) return false;
  
        try {
          const session = JSON.parse(raw);
          if (!session.expiresAt || session.expiresAt <= Date.now()) {
            PropertiesService.getScriptProperties().deleteProperty(key);
            return false;
          }
          return true;
        } catch (e) {
          PropertiesService.getScriptProperties().deleteProperty(key);
          return false;
        }
      } catch (error) {
        Logger.log("Erro em isAuthenticatedByToken: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em isAuthenticatedByToken: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em isAuthenticatedByToken: " + error.message);
    throw error;
  }
}

function getSessionUser(tok) {
  try {
    try {
      if (!tok) return null;
      const key = SGTE_AUTH_CONFIG_.SESSION_KEY_PREFIX + tok;
      const raw = PropertiesService.getScriptProperties().getProperty(key);
      if (!raw) return null;
  
      try {
        const session = JSON.parse(raw);
        if (!session.expiresAt || session.expiresAt <= Date.now()) {
          PropertiesService.getScriptProperties().deleteProperty(key);
          return null;
        }
        return {
          userId: session.userId,
          username: session.username,
          role: session.role,
          nome: session.nome || session.username,
          email: session.email || ''
        };
      } catch (e) {
        PropertiesService.getScriptProperties().deleteProperty(key);
        return null;
      }
    } catch (error) {
      Logger.log("Erro em getSessionUser: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em getSessionUser: " + error.message);
    throw error;
  }
}

function logoutWithToken(tok) {
  try {
    try {
      try {
        if (tok) {
          const key = SGTE_AUTH_CONFIG_.SESSION_KEY_PREFIX + tok;
          PropertiesService.getScriptProperties().deleteProperty(key);
        }
        return { success: true, message: 'Sessão encerrada.' };
      } catch (error) {
        Logger.log("Erro em logoutWithToken: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em logoutWithToken: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em logoutWithToken: " + error.message);
    throw error;
  }
}

function buildAuthenticatedRedirectUrl_(tok) {
  return ScriptApp.getService().getUrl() + '?page=app#tok=' + encodeURIComponent(tok);
}

function resolveAuthTokenFromPayload_(payloadOrToken) {
  if (typeof payloadOrToken === 'string') {
    return payloadOrToken || null;
  }
  if (typeof payloadOrToken === 'object' && payloadOrToken !== null) {
    return payloadOrToken._authToken || payloadOrToken.tok || null;
  }
  return null;
}

function requireAuthenticatedPrincipal_(payloadOrToken) {
  const token = resolveAuthTokenFromPayload_(payloadOrToken);
  if (!token) {
    throw new Error('Sua sessão terminou. Entre novamente.');
  }
  const session = getSessionUser(token);
  if (!session) {
    throw new Error('Sua sessão terminou. Entre novamente.');
  }
  return session;
}