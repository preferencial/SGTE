// PermissionsService.gs
/**
 * @overview Gerencia as permissões de acesso a funcionalidades e dados no SGTE com base nos papéis dos usuários.
 * @module PermissionsService
 * @requires UserRoleService.gs para obter o papel do usuário.
 * @requires Logger.gs para registro de operações.
 */

const PERMISSIONS = {
  Admin: {
    canManageUsers: true,
    canManageRoutes: true,
    canViewAllReports: true,
    canTriggerOptimization: true,
    canAccessAuditLogs: true
  },
  Family: {
    canRegisterNonBoardingNotice: true,
    canViewOwnStudentInfo: true,
    canViewOwnStudentRoute: true,
    canViewLimitedReports: true
  },
  Transporter: {
    canViewAssignedRoutes: true,
    canUpdateRouteStatus: true,
    canViewStudentInfoOnRoute: true
  }
};

function hasPermission(userId, permissionKey) {
  const userRole = UserRoleService.getUserRole(userId);
  if (userRole && PERMISSIONS[userRole] && PERMISSIONS[userRole][permissionKey]) {
    return true;
  }
  Logger.warn(`Usuário ${userId} (Role: ${userRole}) tentou acessar funcionalidade sem permissão: ${permissionKey}`);
  return false;
}

function requirePermission(userId, permissionKey) {
  if (!hasPermission(userId, permissionKey)) {
    throw new Error("Acesso negado: Você não tem permissão para realizar esta ação.");
  }
}
