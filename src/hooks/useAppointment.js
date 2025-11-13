import { useEffect, useState } from 'react';
import { genericService } from '../services/genericService';
import { useAccount } from './useAccount';

export function useAppointment() {
  const [state, setState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { activeCompany: companyId } = useAccount();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await genericService.getAll(`/appointment/${companyId}`);
      setState(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { appointment: state, isLoading, error, refetch: fetchData };
}
