import { useEffect, useState } from 'react';
import { genericService } from '../services/genericService';

export function useTodayFocus() {
  const [state, setState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await genericService.getAll('/today-focus');
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

  return { todayFocus: state, isLoading, error, refetch: fetchData };
}
