import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Link from '../../components/Link/Link';
import { useNavigate } from 'react-router';
import { login } from '../../services/authService';
import { loginWithGoogle } from '../../utils/auth';
import { useApp } from '../../hooks/useApp';
import { useAuth } from '../../hooks/useAuth';
import { AUTHENTICATED } from '../../context/AuthContext/AuthProvider';
import FullScreenSpinner from '../../components/FullScreenSpinner/FullScreenSpinner';
import { storage } from '../../utils/storage';

const LoginPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { setIsLoading, setToast } = useApp();
  const { setAuthState, isAuthenticated, auth } = useAuth();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const loginResponse = await login(data);
      setAuthState({ auth: loginResponse, status: AUTHENTICATED });
      // start conceptualization
      const existingConceptualization = storage.getItem('conceptualization');
      if (existingConceptualization) {
        navigate('/dashboard/conceptualization/continue');
        return;
      }
      if (loginResponse?.todayFocusUrl) {
        setTimeout(() => {
          navigate(loginResponse.todayFocusUrl, { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err?.error) {
        setToast({ show: true, message: err.error, type: 'error' });
      } else {
        setToast({ show: true, message: err.message, type: 'error' });
      }
      if (err?.error?.includes('User is not confirmed')) {
        navigate('/verifyEmail');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = () => {
    loginWithGoogle();
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/dashboard`, { replace: true });
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      <div className="relative min-h-[40vh] md:min-h-screen w-full bg-amber-50 shadow-lg order-1 md:order-none">
        <img alt="login" src="/images/features/login.png" className="w-full h-full object-cover" />
        <div className="absolute left-6 sm:left-10 md:left-14 top-1/4 max-w-xs sm:max-w-sm">
          <img alt="logo" src="/images/logo.svg" className="w-40 sm:w-52 md:w-60 mb-2" />
          <h1 className="text-xl sm:text-2xl md:text-3xl text-black leading-snug">
            Facilitamos tu idea de Negocio
          </h1>
        </div>
      </div>

      <div className="flex flex-col min-h-[60vh] md:min-h-screen w-full px-6 sm:px-10 md:px-12 lg:px-16 py-8 md:py-12">
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
          <h1 className="mb-6 md:mb-8 text-2xl md:text-3xl font-bold">Iniciar sesión</h1>

          <Button
            type="button"
            variant="google"
            onClick={handleGoogle}
            className="justify-center py-2.5"
            aria-label="Continuar con Google">
            <img
              alt="logo google"
              className="w-6 sm:w-7 inline pr-2 align-middle"
              src="/images/marketing_source/google.svg"
            />
            <span className="align-middle">Continuar con Google</span>
          </Button>

          {/* Separador */}
          <div className="flex items-center w-full my-6">
            <span className="h-px bg-slate-200 w-full" />
            <span className="px-3 text-sm font-semibold text-slate-500">O</span>
            <span className="h-px bg-slate-200 w-full" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
            <Input
              label="Email"
              type="email"
              placeholder="Ingresa tu email"
              {...register('email', { required: 'El email es obligatorio' })}
              error={errors.email?.message}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="Ingresa tu contraseña"
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
              error={errors.password?.message}
            />

            <div className="flex flex-col gap-3 sm:gap-4 justify-between mt-6 md:mt-8 px-0 sm:px-30">
              <Button type="submit" className="w-full sm:w-auto justify-center">
                Iniciar sesión
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/signUp')}
                className="w-full sm:w-auto justify-center"
                variant="secondary">
                Registrarse
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between mt-4">
              <Link to="/forgotPassword" className="text-sm">
                Olvide mi contraseña
              </Link>
              <Link to="/signUp" className="text-sm">
                Crear una cuenta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
