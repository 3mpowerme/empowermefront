import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Link from '../../components/Link/Link';
import { useLocation, useNavigate } from 'react-router';
import { login } from '../../services/authService';
import { loginWithGoogle } from '../../utils/auth';
import { useApp } from '../../hooks/useApp';
import { useAuth } from '../../hooks/useAuth';
import { AUTHENTICATED } from '../../context/AuthContext/AuthProvider';
import FullScreenSpinner from '../../components/FullScreenSpinner/FullScreenSpinner';
import { storage } from '../../utils/storage';
import { isEmptyObject } from '../../utils/utils';
import { privateService } from '../../services/privateService';

const LoginPage = () => {
  const location = useLocation();
  const { email = '', from = '' } = location.state || {};
  console.log('location from', location.state?.from);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { setIsLoading, setToast } = useApp();
  const { setAuthState, isAuthenticated } = useAuth();
  const buildCompany = storage.getItem('buildCompany');
  const {
    step0 = {},
    step2 = {},
    step3 = {},
    step4 = {},
    step5 = {},
    step6 = {},
    step7 = {},
    step8 = {},
    step9 = {},
  } = buildCompany || {};
  const shouldBuildCompany =
    !isEmptyObject(step0) &&
    !isEmptyObject(step2) &&
    !isEmptyObject(step3) &&
    !isEmptyObject(step4) &&
    !isEmptyObject(step5) &&
    !isEmptyObject(step6) &&
    !isEmptyObject(step6) &&
    !isEmptyObject(step7) &&
    !isEmptyObject(step8) &&
    !isEmptyObject(step9);
  console.log('shouldBuildCompany', shouldBuildCompany);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const loginResponse = await login(data);
      console.log('loginResponse', loginResponse);
      console.log('from', from);
      setAuthState({ auth: loginResponse, status: AUTHENTICATED });

      if (shouldBuildCompany) {
        const {
          step0: { companyName },
          step2: { todayFocus: today_focus } = {},
          step3: {
            companyOffering: company_offering,
            customerServiceChannel: customer_service_channel,
          } = {},
          step4: { business_sectors, business_sector_other, about } = {},
          step5: { phone_number, region_id, zip_code, street } = {},
          step6: { hasEmployees } = {},
          step7: { isRegisteredCompany } = {},
          step8: { hasStartedActivities } = {},
          step9: { marketingSource: marketing_source } = {},
        } = buildCompany;

        const parsedId = Number(business_sectors?.[0]);
        const isNumericId = !Number.isNaN(parsedId);

        const body = {
          company_name: companyName,
          today_focus,
          company_offering,
          marketing_source,
          business_sector_id: isNumericId ? parsedId : 11,
          business_sector_other: business_sector_other || '',
          customer_service_channel,
          phone_number,
          is_registered_company: isRegisteredCompany?.[0],
          hasStartedActivities: hasStartedActivities?.[0],
          has_employees: hasEmployees?.[0],
          region_id,
          zip_code,
          about,
          street,
        };
        const config = { headers: {} };
        config.headers.Authorization = `Bearer ${loginResponse.accessToken}`;

        privateService
          .create('/build-company', body, config)
          .then(() => {
            storage.removeItem('buildCompany');
            console.log('company created');
            setToast({ show: true, message: '¡Empresa creada!', type: 'success' });
            window.location.href = '/dashboard/buildCompany';
          })
          .catch((e) => {
            setIsLoading(false);
            setToast({ show: true, message: 'Error creando empresa', type: 'error' });
            console.log('error creating company', e);
          });
      } else {
        // start conceptualization
        const existingConceptualization = storage.getItem('conceptualization');
        if (existingConceptualization) {
          setIsLoading(false);
          console.log('navigating to /dashboard/conceptualization/pay withAutoContinue: true');
          navigate('/dashboard/conceptualization/pay', { state: { withAutoContinue: true } });
          return;
        }
      }

      if (loginResponse?.postLoginRedirect && !shouldBuildCompany) {
        setTimeout(() => {
          console.log('navigating to ' + loginResponse.postLoginRedirect);
          navigate(loginResponse.postLoginRedirect, { replace: true });
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
      setIsLoading(false);
    }
  };

  const handleGoogle = () => {
    loginWithGoogle();
  };

  useEffect(() => {
    // if user is authenticated and does not come from conceptualization or build-company wizard
    if (isAuthenticated && from === '') {
      navigate(`/dashboard`, { replace: true });
    }
  }, [isAuthenticated, from]);

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
              defaultValue={email || ''}
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
