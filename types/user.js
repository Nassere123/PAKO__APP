// Types pour les utilisateurs
export const UserTypes = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  DRIVER: 'driver',
};

export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
};

// Structure d'un utilisateur
export const UserStructure = {
  id: 'string',
  email: 'string',
  firstName: 'string',
  lastName: 'string',
  phone: 'string',
  address: 'object',
  type: 'string',
  status: 'string',
  createdAt: 'date',
  updatedAt: 'date',
};
