import React, { useState } from 'react';
import { CalendarCog, Edit, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Switch from '../../../components/Switch/Switch';
import CalendlyPopup from '../../../components/CalendlyPopup/CalendlyPopup';
import { normalizeAppointmentStatus, normalizePaymentStatus } from '../../../utils/utils';

const AppointmentsTable = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rescheduleOptions, setRescheduleOptions] = useState({
    showModal: false,
    rescheduleUrl: '',
  });
  const rowsPerPage = 10;

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleCancel = (id) => {
    console.log('Cancelar cita con ID:', id);
  };

  const handleEventRescheduled = () => {
    console.log('rescheduled');
  };

  const handleRescheduleAppointment = (rescheduleUrl) => {
    setRescheduleOptions({ showModal: true, rescheduleUrl });
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-10">
      <Switch value={paginatedData.length > 0}>
        <Switch.Item case={true}>
          <div className="overflow-x-auto rounded-2xl ">
            <table className="w-full text-left">
              <thead className="text-black border-b-1 border-primary">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Tipo de servicio</th>
                  <th className="py-3 px-4">Estado de la cita</th>
                  <th className="py-3 px-4">Estado del pago</th>
                  <th className="py-3 px-4">Horario</th>
                  <th className="py-3 px-4">Fecha de solicitud</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-opaque hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">{item.service_order_id}</td>
                    <td className="py-3 px-4 capitalize">
                      {item.service_name || item.service_code.replace(/_/g, ' ')}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.appointment_status === 'scheduled'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {normalizeAppointmentStatus(item.appointment_status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.payment_status === 'pending_payment' ||
                          item.payment_status === 'failed' ||
                          item.payment_status === 'requires_action' ||
                          item.payment_status === 'canceled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                        {normalizePaymentStatus(item.payment_status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {' '}
                      {item.scheduled_event_start_time && item.scheduled_event_end_time
                        ? `${format(new Date(item.scheduled_event_start_time), "EEEE d 'de' MMMM, HH:mm", { locale: es })} - 
    ${format(new Date(item.scheduled_event_end_time), 'HH:mm', { locale: es })}`
                        : 'Sin horario'}
                    </td>
                    <td className="py-3 px-4">
                      {item.appointment_created_at
                        ? `${format(new Date(item.appointment_created_at), "EEEE d 'de' MMMM", { locale: es })}`
                        : 'Sin fecha'}
                    </td>
                    <td className="py-2 px-4">
                      <div className=" flex justify-center items-center gap-2">
                        {item.reschedule_url && (
                          <button
                            onClick={() => handleRescheduleAppointment(item.reschedule_url)}
                            className="text-primary hover:bg-purple-300 rounded-full p-1 cursor-pointer">
                            <CalendarCog className="w-4 h-4" />
                          </button>
                        )}

                        {item.cancel_url && (
                          <button
                            onClick={() => handleCancel(item.cancel_url)}
                            className="text-orange-strong hover:bg-red-100 rounded-full cursor-pointer">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition">
              Anterior
            </button>
            <span className="text-gray-600 font-medium">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition">
              Siguiente
            </button>
          </div>
        </Switch.Item>
        <Switch.Item case={false}>
          <div className="border rounded-xl border-opaque shadow-lg w-full h-50 flex justify-center items-center text-secondary">
            Sin citas
          </div>
        </Switch.Item>
      </Switch>

      <Switch value={rescheduleOptions.showModal}>
        <Switch.Item case={true}>
          <CalendlyPopup
            onClose={() => {
              setRescheduleOptions({
                showModal: false,
                rescheduleUrl: '',
              });
            }}
            onEventScheduled={handleEventRescheduled}
            url={rescheduleOptions.rescheduleUrl}
          />
        </Switch.Item>
      </Switch>
    </div>
  );
};

export default AppointmentsTable;
