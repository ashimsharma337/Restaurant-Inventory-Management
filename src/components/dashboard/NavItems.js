export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    roles: ['general-manager', 'kitchen-manager', 'supervisor'],
  },
  {
    label: 'Products',
    path: '/dashboard/products',
    roles: ['general-manager', 'kitchen-manager'],
  },
  {
    label: 'Orders',
    path: '/dashboard/orders',
    roles: ['general-manager', 'supervisor'],
  },
  {
    label: 'Users',
    path: '/dashboard/users',
    roles: ['general-manager'],
  },
];
