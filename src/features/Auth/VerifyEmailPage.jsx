import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { verifyEmail } from '../../services/authService';
import { useLocation, useNavigate } from 'react-router';
import { useApp } from '../../hooks/useApp';

const VerifyEmailPage = () => {
  const location = useLocation();
  console.log('location from', location.state?.from);
  const { email = '', from = '' } = location.state || {};
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { setToast } = useApp();

  const onSubmit = async (data) => {
    try {
      const result = await verifyEmail(data);
      console.log('result:', result);
      if (result?.message?.includes('Email verified')) {
        navigate('/login', { state: { email: data.email, from } });
      }
    } catch (err) {
      console.error('Error verifyEmail:', err);
      if (err?.error) {
        setToast({ show: true, message: err.error, type: 'error' });
      } else {
        setToast({ show: true, message: err.message, type: 'error' });
      }
    }
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
          <h1 className="mb-3 md:mb-4 text-2xl md:text-3xl font-bold">Verifica tu email</h1>
          <p className="text-slate-600 mb-6 md:mb-8 text-sm md:text-base leading-relaxed">
            Te enviamos un correo de verificación. Ingresa nuevamente tu email y el código que
            recibiste.
          </p>

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
              label="Código"
              placeholder="Ingresa el código enviado por correo"
              {...register('code', {
                required: 'El código es obligatorio',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
              error={errors.code?.message}
            />

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between mt-6 md:mt-8">
              <Button type="submit" className="w-full sm:w-auto justify-center">
                Verificar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
