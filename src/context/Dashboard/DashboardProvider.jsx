import { useEffect, useState } from 'react';
import { DashboardContext } from './DashboardContext';
import { privateService } from '../../services/privateService';
import { useApp } from '../../hooks/useApp';
import { useLocation } from 'react-router';

export function DashboardProvider({ children }) {
  const initialState = {
    menu: [],
    wizards: [],
    isReady: false,
  };
  const location = useLocation();
  const { pathname } = location || {};
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

  const getWizardsByLocation = (menuData) => {
    const itemFound = menuData.find((it) => it.link === pathname);

    return itemFound?.wizards || [];
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await privateService.get('/user-feature');
      const wizardsByLocation = getWizardsByLocation(data);
      setMenuState(data);
      // set wizards for first time
      if (Array.isArray(wizardsByLocation) && wizardsByLocation.length > 0) {
        setWizardsState(wizardsByLocation);
      }
    } catch (err) {
      console.error('Error loading menu', err);
    } finally {
      setIsLoading(false);
      setState((prevState) => {
        return {
          ...prevState,
          isReady: true,
        };
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const wizardsByLocation = getWizardsByLocation(state?.menu);
    if (Array.isArray(wizardsByLocation) && wizardsByLocation.length > 0) {
      setWizardsState(wizardsByLocation);
    }
  }, [pathname]);

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
        isReady: state.isReady,
      }}>
      {children}
    </DashboardContext.Provider>
  );
}
