import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Link from '../../components/Link/Link';
import { useLocation, useNavigate } from 'react-router';
import { signup } from '../../services/authService';
import { loginWithGoogle } from '../../utils/auth';
import { storage } from '../../utils/storage';
import { useApp } from '../../hooks/useApp';
import { getBrowserCountryCode, isEmptyObject, isTokenExpired } from '../../utils/utils';
import { privateService } from '../../services/privateService';
import Tooltip from '../../components/Tooltip/Tooltip';
import { Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  console.log('location from', location.state?.from);
  const { from = '' } = location.state || {};
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const { isAuthenticated, auth } = useAuth();
  const passwordValue = watch('password', '');

  const { setIsLoading, setToast } = useApp();

  useEffect(() => {
    const storedAuth = storage.getItem('auth');
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
    // case when user is logged in and he is redirected to /signup
    if (isAuthenticated && !isTokenExpired(auth.accessToken) && buildCompany) {
      // user is logged in
      console.log('user is logged in');
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
        setIsLoading(true);
        privateService
          .create('/build-company', body)
          .then(() => {
            storage.removeItem('buildCompany');
            setIsLoading(false);
            setTimeout(() => {
              navigate('/dashboard/buildCompany', { replace: true });
            }, 100);
            console.log('company created');
          })
          .catch((error) => {
            setIsLoading(false);
            setToast({
              show: true,
              message: 'Ocurrio un error',
              type: 'error',
              button: {},
            });
            navigate('..');
            console.error('Error creating company', error);
          });
      }
    }
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const signupResponse = await signup({
        email: data.email,
        password: data.password,
        countryCode: getBrowserCountryCode(),
      });
      console.log('signupResponse', signupResponse);
      navigate('/verifyEmail', { state: { email: data.email, from } });
    } catch (err) {
      console.error('Signup error:', err);
      if (err?.error) {
        setToast({ show: true, message: err.error, type: 'error' });
      } else {
        setToast({ show: true, message: err.message, type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = () => {
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      <div className="relative min-h-[32vh] md:min-h-screen w-full bg-amber-50 shadow-lg order-1 md:order-none">
        <img alt="login" src="/images/features/login.png" className="w-full h-full object-cover" />
        <div className="absolute left-6 sm:left-10 md:left-14 top-1/4 max-w-xs sm:max-w-sm">
          <img alt="logo" src="/images/logo.svg" className="w-40 sm:w-52 md:w-60 mb-2" />
          <h1 className="text-xl sm:text-2xl md:text-3xl text-black leading-snug">
            Facilitamos tu idea de Negocio
          </h1>
        </div>
      </div>

      <div className="flex flex-col min-h-[68vh] md:min-h-screen w-full px-6 sm:px-10 md:px-12 lg:px-16 py-8 md:py-12">
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
          <h1 className="mb-6 md:mb-8 text-2xl md:text-3xl font-bold">
            Regístrate para iniciar sesión
          </h1>

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

          <div className="flex items-center w-full my-6">
            <span className="h-px bg-slate-200 w-full" />
            <span className="px-3 text-sm font-semibold text-slate-500">O</span>
            <span className="h-px bg-slate-200 w-full" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
            <Input
              label="Correo electrónico*"
              type="email"
              placeholder="Ingresa tu correo electrónico"
              {...register('email', { required: 'El correo electrónico es obligatorio' })}
              error={errors.email?.message}
            />
            <Input
              label="Contraseña*"
              type="password"
              placeholder="Crea una contraseña"
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 8, message: 'Debe tener al menos 8 caracteres' },
                maxLength: { value: 50, message: 'Debe tener como máximo 50 caracteres' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).*$/,
                  message:
                    'Debe incluir al menos una minúscula, una mayúscula, un número y un carácter especial',
                },
              })}
              error={errors.password?.message}
              tooltip="Debe tener entre 8 y 50 caracteres e incluir al menos una minúscula, una mayúscula, un número y un carácter especial"
            />

            <Input
              label="Confirmar contraseña*"
              type="password"
              placeholder="Vuelve a escribir tu contraseña"
              {...register('passwordRepeat', {
                required: 'Confirma tu contraseña',
                validate: (value) => value === passwordValue || 'Las contraseñas no coinciden',
              })}
              error={errors.passwordRepeat?.message}
              tooltip="Debe coincidir exactamente con la contraseña anterior"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between mt-2">
              <Link to="/login" state={{ from }} className="text-sm">
                Tienes una cuenta, inicia sesión
              </Link>
            </div>
            <div className="flex flex-col gap-3 sm:gap-4 justify-between mt-6 md:mt-8 px-0 sm:px-30">
              <Button variant="primary" type="submit" className="w-full sm:w-auto justify-center">
                Registrarse
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
