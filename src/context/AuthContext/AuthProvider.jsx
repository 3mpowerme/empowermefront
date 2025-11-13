import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { storage } from '../../utils/storage';
import FullScreenSpinner from '../../components/FullScreenSpinner/FullScreenSpinner';
import { isTokenExpired } from '../../utils/utils';
import { useTokenExpiryWatcher } from '../../hooks/useTokenExpiryWatcher';
import SessionRefreshModal from '../../components/SessionRefreshModal/SessionRefreshModal';
import { privateService } from '../../services/privateService';

export const LOADING = 'LOADING';
export const AUTHENTICATED = 'AUTHENTICATED';
export const UNAUTHENTICATED = 'UNAUTHENTICATED';

export function AuthProvider({ children }) {
  const initialState = { status: LOADING, auth: null };
  const [state, setState] = useState(initialState);
  const { auth, status } = state;
  useEffect(() => {
    const storedAuth = storage.getItem('auth');
    if (storedAuth?.accessToken && !isTokenExpired(storedAuth.accessToken)) {
      setState({ auth: storedAuth, status: AUTHENTICATED });
    } else if (storedAuth?.accessToken && isTokenExpired(storedAuth.accessToken)) {
      setState({ auth: null, status: UNAUTHENTICATED });
    } else {
      setState({ auth: null, status: UNAUTHENTICATED });
    }
  }, []);

  useEffect(() => {
    if (auth && Object.keys(auth).length > 0) storage.setItem('auth', auth);
  }, [auth]);

  const logout = useCallback(() => {
    setState({ auth: null, status: UNAUTHENTICATED });
    storage.clear();
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const refreshToken = auth?.refreshToken;
      if (!refreshToken) throw new Error('No hay refresh_token disponible');

      const data = await privateService.create('/auth/refresh-token', {
        refreshToken: refreshToken,
      });

      const nextAuth = {
        ...(auth || {}),
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || auth?.refreshToken,
        idToken: data.idToken,
      };

      setState((prev) => ({
        ...prev,
        auth: nextAuth,
        status: AUTHENTICATED,
      }));
      return true;
    } catch (err) {
      console.error('Error refreshing the session', err);
      logout();
      return false;
    }
  }, [auth, logout]);

  const { secondsLeft, isAboutToExpire } = useTokenExpiryWatcher({
    accessToken: auth?.accessToken || null,
    advanceSeconds: 60,
  });

  useEffect(() => {
    if (status !== AUTHENTICATED) return;
    if (typeof secondsLeft === 'number' && secondsLeft === 0) {
      logout();
    }
  }, [secondsLeft, status, logout]);

  const isAuthenticated = status === AUTHENTICATED;
  const isLoading = status === LOADING;

  return (
    <AuthContext.Provider
      value={{ auth, status, isAuthenticated, isLoading, setAuthState: setState, logout }}>
      {status === LOADING ? (
        <FullScreenSpinner />
      ) : (
        <>
          {children}

          <SessionRefreshModal
            open={Boolean(isAuthenticated && isAboutToExpire)}
            secondsLeft={secondsLeft ?? 60}
            onStaySignedIn={refreshSession}
            onLogout={logout}
          />
        </>
      )}
    </AuthContext.Provider>
  );
}
