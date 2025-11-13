import { google } from '../services/authService';

export function loginWithGoogle() {
  const url =
    `${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/authorize?` +
    `identity_provider=Google&` +
    `response_type=code&` +
    `client_id=${import.meta.env.VITE_COGNITO_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(import.meta.env.VITE_REDIRECT_URI)}&` +
    `scope=openid+email+profile`;

  window.location.href = url;
}

export async function fetchTokens(code, companyName, countryCode) {
  try {
    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_REDIRECT_URI,
      code,
      client_secret: import.meta.env.VITE_COGNITO_CLIENT_SECRET,
    });

    const response = await fetch(`${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data,
    });

    const tokens = await response.json();
    console.log('Tokens:', tokens);

    const googleResponse = await google({
      idToken: tokens.id_token,
      countryCode,
      companyName,
    });
    console.log('googleResponse', googleResponse);
    return { tokens, googleResponse };
  } catch (error) {
    console.error('fetchTokens error', error);
    throw error;
  }
}
