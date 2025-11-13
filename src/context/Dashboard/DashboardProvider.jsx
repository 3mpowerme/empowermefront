import { useEffect, useState } from 'react';
import { DashboardContext } from './DashboardContext';
import { privateService } from '../../services/privateService';
import { useApp } from '../../hooks/useApp';

export function DashboardProvider({ children }) {
  const initialState = {
    menu: [],
    wizards: [],
  };
  const [state, setState] = useState(initialState);
  const { setIsLoading } = useApp();

  const setMenuState = (newState = []) => {
    setState((prevState) => {
      return {
        ...prevState,
        menu: [...newState],
      };
    });
  };

  const setWizardsState = (wizards = []) => {
    setState((prevState) => {
      return {
        ...prevState,
        wizards: [...wizards],
      };
    });
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await privateService.get('/user-feature');
      setMenuState(data);
      // set wizards for first time
      if (data[0]?.wizards) {
        setWizardsState(data[0]?.wizards);
      }
    } catch (err) {
      console.error('Error loading menu', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log('DashboardProvider state:', state);
  const { menu, wizards } = state;

  return (
    <DashboardContext.Provider
      value={{
        menu,
        wizards,
        setMenuState,
        setWizardsState,
        refetch: fetchData,
      }}>
      {children}
    </DashboardContext.Provider>
  );
}
