import type { Route } from 'next';

export type AuthPortal = 'client' | 'admin' | 'driver';

export const ADMIN_ROUTE_PREFIXES = [
  '/dashboard',
  '/bookings',
  '/dispatch',
  '/verification',
  '/finance',
  '/trips',
  '/team',
  '/fleet',
  '/packages-admin',
  '/pricing',
  '/crm',
  '/analytics',
] as const;

export const CLIENT_PROTECTED_ROUTE_PREFIXES = ['/my-bookings', '/checkout'] as const;
export const DRIVER_PROTECTED_ROUTE_PREFIXES = ['/driver/app'] as const;

export function isAdminRole(role: string | null | undefined): boolean {
  return role === 'super_admin' || role === 'regional_admin';
}

export function isDriverRole(role: string | null | undefined): boolean {
  return role === 'driver';
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isAdminLoginPath(pathname: string): boolean {
  return pathname === '/dashboard/login' || pathname === '/admin';
}

export function isClientLoginPath(pathname: string): boolean {
  return pathname === '/login';
}

export function isRegisterPath(pathname: string): boolean {
  return pathname === '/register';
}

export function isDriverLoginPath(pathname: string): boolean {
  return pathname === '/driver/login' || pathname === '/driver';
}

export function isPublicAuthPath(pathname: string): boolean {
  return isAdminLoginPath(pathname) || isClientLoginPath(pathname) || isRegisterPath(pathname) || isDriverLoginPath(pathname);
}

export function isAdminPath(pathname: string): boolean {
  return ADMIN_ROUTE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

export function isAdminProtectedPath(pathname: string): boolean {
  return isAdminPath(pathname) && !isAdminLoginPath(pathname);
}

export function isClientProtectedPath(pathname: string): boolean {
  return CLIENT_PROTECTED_ROUTE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

export function isDriverProtectedPath(pathname: string): boolean {
  if (pathname === '/driver' || pathname === '/driver/login') {
    return false;
  }

  return DRIVER_PROTECTED_ROUTE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

export function getPortalLoginPath(portal: AuthPortal): Route {
  if (portal === 'admin') {
    return '/admin' as Route;
  }

  if (portal === 'driver') {
    return '/driver';
  }

  return '/login';
}

export function getPortalHomePath(portal: AuthPortal): Route {
  if (portal === 'admin') {
    return '/dashboard';
  }

  if (portal === 'driver') {
    return '/driver/app' as Route;
  }

  return '/packages';
}

export function getPortalAccessError(portal: AuthPortal, role: string | null | undefined): string | null {
  if (portal === 'admin' && !isAdminRole(role)) {
    return 'Akun ini tidak memiliki akses admin dashboard.';
  }

  if (portal === 'driver' && !isDriverRole(role)) {
    return 'Portal driver hanya untuk akun dengan role driver.';
  }

  if (portal === 'client' && isAdminRole(role)) {
    return 'Akun admin harus masuk melalui portal dashboard.';
  }

  if (portal === 'client' && isDriverRole(role)) {
    return 'Akun driver harus masuk melalui portal driver app.';
  }

  if (portal === 'admin' && isDriverRole(role)) {
    return 'Akun driver tidak memiliki akses admin dashboard.';
  }

  return null;
}

export function getSafeNextPath(portal: AuthPortal, nextPath: string | null | undefined): Route | null {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return null;
  }

  if (isPublicAuthPath(nextPath)) {
    return null;
  }

  if (portal === 'admin') {
    return isAdminProtectedPath(nextPath) ? (nextPath as Route) : null;
  }

  if (portal === 'driver') {
    return isDriverProtectedPath(nextPath) ? (nextPath as Route) : null;
  }

  return isAdminPath(nextPath) || isDriverProtectedPath(nextPath) ? null : (nextPath as Route);
}

export function getPostLoginPath(portal: AuthPortal, nextPath: string | null | undefined): Route {
  return getSafeNextPath(portal, nextPath) ?? getPortalHomePath(portal);
}
