import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router';

export default function RoleGuard({
  allow = [],
  userRoleId,
  isLoading = false,
  unauthenticatedRedirectTo = '/login',
  unauthorizedRedirectTo = '/403',
  fallback = null,
  children,
}) {
  const location = useLocation();

  const normalizedAllow = useMemo(
    () => (Array.isArray(allow) ? allow.map((x) => Number(x)) : []),
    [allow]
  );

  const roleId = userRoleId == null ? null : Number(userRoleId);

  if (isLoading) return fallback;

  if (roleId == null) {
    return <Navigate to={unauthenticatedRedirectTo} replace state={{ from: location }} />;
  }

  const isAllowed = normalizedAllow.length === 0 ? true : normalizedAllow.includes(roleId);

  if (!isAllowed) {
    return (
      <Navigate
        to={unauthorizedRedirectTo}
        replace
        state={{ from: location, requiredRoles: normalizedAllow }}
      />
    );
  }

  return <>{children}</>;
}
