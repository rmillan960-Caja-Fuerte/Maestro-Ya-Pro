
export const PERMISSIONS = {
  // Clients
  VIEW_CLIENTS: 'view_clients',
  CREATE_CLIENTS: 'create_clients',
  EDIT_CLIENTS: 'edit_clients',
  DELETE_CLIENTS: 'delete_clients',
  
  // Masters
  VIEW_MASTERS: 'view_masters',
  CREATE_MASTERS: 'create_masters',
  EDIT_MASTERS: 'edit_masters',
  DELETE_MASTERS: 'delete_masters',
  VERIFY_MASTERS: 'verify_masters',
  PAY_MASTERS: 'pay_masters',
  
  // Work Orders
  VIEW_WORK_ORDERS: 'view_work_orders',
  CREATE_WORK_ORDERS: 'create_work_orders',
  EDIT_WORK_ORDERS: 'edit_work_orders',
  DELETE_WORK_ORDERS: 'delete_work_orders',
  APPROVE_QUOTES: 'approve_quotes',
  ASSIGN_MASTERS: 'assign_masters',
  CHANGE_STATUS: 'change_status',
  
  // Finances
  VIEW_FINANCES: 'view_finances',
  CREATE_TRANSACTIONS: 'create_transactions',
  EDIT_TRANSACTIONS: 'edit_transactions',
  DELETE_TRANSACTIONS: 'delete_transactions',
  APPROVE_PAYMENTS: 'approve_payments',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  
  // Settings
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_CATALOG: 'manage_catalog',
  MANAGE_TEMPLATES: 'manage_templates',
  MANAGE_INTEGRATIONS: 'manage_integrations',
  
  // System
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_BACKUPS: 'manage_backups',
  ACCESS_API: 'access_api'
};

export const ROLES = {
  OWNER: {
    name: 'Owner',
    permissions: Object.values(PERMISSIONS)
  },
  ADMIN: {
    name: 'Administrador',
    permissions: [
      ...Object.values(PERMISSIONS).filter(p => !p.includes('MANAGE_USERS'))
    ]
  },
  OPERATOR: {
    name: 'Operador',
    permissions: [
      PERMISSIONS.VIEW_CLIENTS,
      PERMISSIONS.CREATE_CLIENTS,
      PERMISSIONS.EDIT_CLIENTS,
      PERMISSIONS.VIEW_MASTERS,
      PERMISSIONS.VIEW_WORK_ORDERS,
      PERMISSIONS.CREATE_WORK_ORDERS,
      PERMISSIONS.EDIT_WORK_ORDERS,
      PERMISSIONS.ASSIGN_MASTERS,
      PERMISSIONS.CHANGE_STATUS,
      PERMISSIONS.VIEW_FINANCES
    ]
  },
  VIEWER: {
    name: 'Visualizador',
    permissions: [
      PERMISSIONS.VIEW_CLIENTS,
      PERMISSIONS.VIEW_MASTERS,
      PERMISSIONS.VIEW_WORK_ORDERS,
      PERMISSIONS.VIEW_FINANCES,
      PERMISSIONS.VIEW_REPORTS
    ]
  }
};

export function hasPermission(userPermissions: string[], required: string) {
  return userPermissions.includes(required);
}

export function hasAnyPermission(userPermissions: string[], required: string[]) {
  return required.some(p => userPermissions.includes(p));
}

export function hasAllPermissions(userPermissions: string[], required: string[]) {
  return required.every(p => userPermissions.includes(p));
}
