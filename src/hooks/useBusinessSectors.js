import { useEffect, useState } from 'react';
import { genericService } from '../services/genericService';

export function useBusinessSectors() {
  const [state, setState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await genericService.getAll('/business-sectors');
      setState(data.filter((it) => it.name !== 'Otros'));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { businessSectors: state, isLoading, error, refetch: fetchData };
}
