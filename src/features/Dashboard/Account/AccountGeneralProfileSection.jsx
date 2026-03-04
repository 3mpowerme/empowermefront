import React, { useMemo, useState } from 'react';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import Modal, { ModalBody, ModalFooter } from '../../../components/Modal/Modal';
import { useAccount } from '../../../hooks/useAccount';
import { privateService } from '../../../services/privateService';
import { useApp } from '../../../hooks/useApp';

export default function AccountGeneralProfileSection() {
  const { account, setAccount } = useAccount();
  const { setToast, setIsLoading } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState(account?.name || '');

  const email = useMemo(() => account?.email || '', [account?.email]);

  const handleOpenModal = () => {
    setName(account?.name || '');
    setIsModalOpen(true);
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      // We allow empty string to support users with null/empty name.
      const response = await privateService.update('/account', { name: name || '' });

      if (response?.updated) {
        setAccount({ ...account, name: name || '' });
        setToast({
          show: true,
          message: 'Tu nombre se actualizó correctamente',
          type: 'success',
          button: {},
        });
        setIsModalOpen(false);
      }
    } catch (error) {
      setToast({
        show: true,
        message: error?.error || 'No fue posible actualizar tu nombre',
        type: 'error',
        button: {},
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:w-1/2 bg-white rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <Input
          label="Correo electrónico"
          type="email"
          value={email}
          disabled
          readOnly
          placeHolder="Correo electrónico"
        />

        <Input
          label="Nombre"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeHolder="Ingresa tu nombre"
        />

        <div className="flex justify-end">
          <Button type="button" onClick={handleOpenModal}>
            Actualizar
          </Button>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Actualizar nombre"
        subtitle="Confirma para guardar los cambios de tu perfil">
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Input label="Correo electrónico" type="email" value={email} disabled readOnly />
            <Input
              label="Nombre"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeHolder="Ingresa tu nombre"
            />
          </div>
        </ModalBody>
        <ModalFooter className="w-full justify-end">
          <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleUpdateProfile}>
            Guardar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
