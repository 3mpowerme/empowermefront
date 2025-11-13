import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Link from '../../components/Link/Link';
import { useNavigate } from 'react-router';
import { signup } from '../../services/authService';
import { genericService } from '../../services/genericService';
import { loginWithGoogle } from '../../utils/auth';
import { storage } from '../../utils/storage';
import globalConstants from '../../constants/global';
import { useApp } from '../../hooks/useApp';

const SignUpPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { setIsLoading, setToast } = useApp();

  const buildCompany = storage.getItem('buildCompany');

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const signupResponse = await signup({
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        countryCode: globalConstants.countryCode,
      });
      const { companyId } = signupResponse;

      if (buildCompany) {
        const {
          step2: { todayFocus: today_focus } = {},
          step3: {
            companyOffering: company_offering,
            customerServiceChannel: customer_service_channel,
          } = {},
          step4: { business_sectors, business_sector_other, about } = {},
          step5: { phone_number, region_id, zip_code, street } = {},
          step6: { hasEmployees } = {},
          step7: { isRegisteredCompany } = {},
          step8: { marketingSource: marketing_source } = {},
        } = buildCompany;

        const parsedId = Number(business_sectors?.[0]);
        const isNumericId = !Number.isNaN(parsedId);

        const body = {
          company_id: companyId,
          today_focus,
          company_offering,
          marketing_source,
          business_sector_id: isNumericId ? parsedId : 14,
          business_sector_other: business_sector_other || null,
          customer_service_channel,
          phone_number,
          is_registered_company: isRegisteredCompany?.[0],
          has_employees: hasEmployees?.[0],
          region_id,
          zip_code,
          about,
          street,
        };
        genericService.create('/build-company', body).then(() => {
          storage.removeItem('buildCompany');
        });
      }
      navigate('/verifyEmail');
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
              defaultValue={buildCompany?.step0?.companyName}
              label="Nombre de la empresa*"
              type="text"
              placeholder="Ingresa nombre de la empresa"
              {...register('companyName', { required: 'El nombre de la empresa es obligatorio' })}
              error={errors.companyName?.message}
            />

            <Input
              label="Correo electrónico*"
              type="email"
              placeholder="Ingresa correo electrónico"
              {...register('email', { required: 'El correo electrónico es obligatoria' })}
              error={errors.email?.message}
            />

            <Input
              label="Contraseña*"
              type="password"
              placeholder="Ingresa contraseña"
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })}
              error={errors.password?.message}
            />

            <Input
              label="Confirmar contraseña*"
              type="password"
              placeholder="Ingresa contraseña"
              {...register('passwordRepeat', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })}
              error={errors.passwordRepeat?.message}
            />

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between mt-2">
              <Link to="/login" className="text-sm">
                Tienes una cuenta, inicia sesión
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between mt-6 md:mt-8">
              <Button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto justify-center"
                variant="secondary">
                Iniciar sesión
              </Button>
              <Button type="submit" className="w-full sm:w-auto justify-center">
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
