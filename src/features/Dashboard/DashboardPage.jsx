import React, { useMemo } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import Dashboard from '../../components/Dashboard/Dashboard';
import { addIconsToMenu } from '../../utils/catalogs';

const DashboardPage = () => {
  const { menu } = useDashboard();
  const menuWithIcons = useMemo(() => addIconsToMenu(menu || []), [menu]);
  return <Dashboard menuItems={menuWithIcons} />;
};

export default DashboardPage;
