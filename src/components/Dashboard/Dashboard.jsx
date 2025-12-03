import classNames from 'classnames';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  User,
  Globe,
  CalendarDays,
  Phone,
  Gem,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { logout } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { useAccount } from '../../hooks/useAccount';
import { useDashboard } from '../../hooks/useDashboard';
import { privateService } from '../../services/privateService';

export default function Dashboard({ menuItems: mi = [] }) {
  const menuItems = mi.map((it) => {
    if (it.name === 'Diseño Gráfico') {
      delete it.link;
    }
    return it;
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState('');
  const [openSectionId, setOpenSectionId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const langRef = useRef(null);
  const accountRef = useRef(null);
  const notificationsRef = useRef(null);

  const { logout: authLogout, auth } = useAuth();
  const { account, activeCompany, setActiveCompany, activeCompanyInfo } = useAccount();

  const companies = account?.companies || [];

  const { setWizardsState } = useDashboard();

  const toggleSection = (id) => setOpenSectionId((prev) => (prev === id ? null : id));

  const renderIconOrImage = (Icon, image) => {
    if (typeof Icon === 'object') return <Icon size={18} aria-hidden />;
    if (image) return <img src={image} alt="" className="w-5 h-5 shrink-0" />;
    return null;
  };

  const getInitials = (name = '') =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('') || 'EM';

  const activeCompanyName = useMemo(
    () => activeCompanyInfo?.companyName || activeCompanyInfo?.name || '',
    [activeCompanyInfo]
  );
  const activeCompanyInitials = useMemo(
    () => getInitials(activeCompanyName || 'EmpowerMe'),
    [activeCompanyName]
  );

  useEffect(() => {
    if (auth?.todayFocusUrl && account) {
      setTimeout(() => navigate(auth.todayFocusUrl, { replace: true }), 100);
    }
  }, [auth?.todayFocusUrl, account]);

  useEffect(() => {
    function onDocPointerDown(e) {
      if (dropdownOpen === 'lang' && langRef.current && !langRef.current.contains(e.target)) {
        setDropdownOpen('');
      }
      if (
        dropdownOpen === 'account' &&
        accountRef.current &&
        !accountRef.current.contains(e.target)
      ) {
        setDropdownOpen('');
      }
      if (
        notificationsOpen &&
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target)
      ) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('pointerdown', onDocPointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', onDocPointerDown, { capture: true });
  }, [dropdownOpen, notificationsOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen('');
  }, [location.pathname]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setDropdownOpen('');
        setMobileOpen(false);
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const pathname = location.pathname;
    const parentWithActiveChild = menuItems.find(
      (mi) => Array.isArray(mi.children) && mi.children.some((ch) => pathname.startsWith(ch.link))
    );
    if (parentWithActiveChild && openSectionId !== parentWithActiveChild.id) {
      setOpenSectionId(parentWithActiveChild.id);
    }
  }, [location.pathname, menuItems, openSectionId]);

  useEffect(() => {
    if (!activeCompany) {
      setNotifications([]);
      return;
    }
    let cancelled = false;

    async function loadNotifications() {
      try {
        setLoadingNotifications(true);
        const data = await privateService.get(
          `/company-notifications/${activeCompany}?onlyUnread=true&limit=10`
        );
        if (cancelled) return;
        setNotifications(data?.notifications || []);
      } catch (e) {
        if (cancelled) return;
        setNotifications([]);
      } finally {
        if (!cancelled) setLoadingNotifications(false);
      }
    }

    loadNotifications();
    const intervalId = setInterval(loadNotifications, 10000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [activeCompany]);

  const handleLogout = async () => {
    try {
      const accessToken = auth?.accessToken;
      if (accessToken) await logout({ accessToken });
    } catch (e) {
    } finally {
      authLogout();
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setDropdownOpen('');
  };

  const handleNotificationClick = async (notification) => {
    const route =
      notification?.metadata?.route ||
      notification?.metadata?.path ||
      notification?.metadata?.url ||
      '/dashboard';

    if (activeCompany && notification?.id) {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      try {
        await privateService.patch(
          `/company-notifications/${activeCompany}/${notification.id}/read`
        );
      } catch (e) {}
    }

    setNotificationsOpen(false);
    navigate(route);
  };

  const asideWidth = isCollapsed ? 'w-16' : 'w-[200px] sm:w-[280px]';

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside
        className={classNames(
          'flex flex-col bg-black text-white transition-all duration-300 rounded-r-2xl z-20 print:hidden',
          asideWidth
        )}
        aria-label="Sidebar principal">
        <div
          className={classNames(
            'flex items-center justify-between pr-3 pb-8 pt-8',
            isCollapsed ? 'pl-3' : 'pl-6'
          )}>
          {!isCollapsed && <span className="text-xl font-bold select-none">EmpowerMe</span>}
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="p-2 rounded-lg bg-primary text-black hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            aria-label={isCollapsed ? t('expand') || 'Expandir' : t('collapse') || 'Colapsar'}>
            <ChevronLeft
              className={classNames(
                'h-4 w-4 transition-transform duration-300',
                isCollapsed ? 'rotate-180' : 'rotate-0'
              )}
            />
          </button>
        </div>

        <nav className="flex-1 px-2 pb-6 space-y-1">
          {menuItems.map(({ id, link, name, icon: Icon, image, wizards, children }) => {
            const hasChildren = Array.isArray(children) && children.length > 0;
            const isOpen = openSectionId === id;

            if (!hasChildren) {
              return (
                <NavLink
                  key={id}
                  to={`${link || '#'}`}
                  onClick={() => {
                    if (!link) return;
                    setWizardsState(wizards);
                  }}
                  end={link === '/dashboard'}
                  className={({ isActive }) =>
                    classNames(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative group',
                      isActive
                        ? 'bg-gray-800 text-purple-400'
                        : 'text-gray-200 hover:text-purple-400 hover:bg-gray-800'
                    )
                  }
                  aria-label={name}>
                  {renderIconOrImage(Icon, image)}
                  {!isCollapsed && <span className="truncate">{name}</span>}
                </NavLink>
              );
            }

            return (
              <div key={id} className="space-y-1 relative group">
                <div
                  className={classNames(
                    'flex items-center justify-between px-3 py-2 rounded-lg transition-colors',
                    'text-gray-200 hover:text-purple-400 hover:bg-gray-800',
                    'cursor-pointer'
                  )}>
                  <NavLink
                    to={`${link || '#'}`}
                    end={link === '/dashboard'}
                    className="flex items-center gap-3 flex-1"
                    aria-label={name}
                    onClick={() => {
                      if (!link) {
                        return;
                      }
                      setWizardsState(wizards);
                      if (isCollapsed) setOpenSectionId(id);
                    }}>
                    <span className="relative inline-flex items-center justify-center">
                      {renderIconOrImage(Icon, image)}
                      {isCollapsed && (
                        <button
                          type="button"
                          onClick={() => toggleSection(id)}
                          className="absolute -bottom-2 -right-2 text-gray-400 opacity-90 group-hover:text-purple-400 transition-colors"
                          aria-expanded={isOpen}
                          aria-controls={`submenu-${id}`}>
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}
                    </span>
                    {!isCollapsed && <span className="truncate">{name}</span>}
                  </NavLink>

                  {!isCollapsed && (
                    <button
                      type="button"
                      onClick={() => toggleSection(id)}
                      className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-purple-400 transition-colors"
                      aria-expanded={isOpen}
                      aria-controls={`submenu-${id}`}>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  )}
                </div>

                <div
                  id={`submenu-${id}`}
                  className={classNames(
                    'flex items-center justify-between py-2 overflow-hidden transition-[max-height,opacity] duration-300',
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  )}>
                  {children.map((child) => {
                    const ChildIcon = child?.icon;
                    return (
                      <NavLink
                        key={child.id}
                        to={child.link}
                        className={({ isActive }) =>
                          classNames(
                            'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
                            isActive
                              ? 'bg-gray-800/80 text-purple-300'
                              : 'text-gray-300 hover:text-purple-300 hover:bg-gray-800/70',
                            isCollapsed ? 'ml-2' : 'ml-5'
                          )
                        }>
                        {typeof ChildIcon === 'object' ? (
                          <ChildIcon size={16} aria-hidden />
                        ) : child?.image ? (
                          <img src={child.image} alt="" className="w-4 h-4 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                        )}
                        {!isCollapsed && <span className="truncate">{child.name}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end h-16 items-center gap-3">
              <div className="hidden md:flex items-center gap-2 mr-auto">
                <div
                  className="w-9 h-9 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center font-semibold select-none border border-gray-300"
                  title={activeCompanyName || 'Company'}>
                  {activeCompanyInitials}
                </div>

                <select
                  className="min-w-[220px] max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 disabled:bg-gray-100"
                  value={activeCompany || ''}
                  onChange={(e) => {
                    const newCompanyId = e.target.value;
                    setActiveCompany?.(newCompanyId);
                    navigate('/dashboard');
                  }}
                  disabled={!companies.length}>
                  {!companies.length && <option value="">No companies</option>}
                  {companies.map((c) => (
                    <option key={c.companyId} value={c.companyId}>
                      {c.companyName || c.name || `Company #${c.companyId}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex md:hidden">
                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-controls="mobile-menu"
                  aria-expanded={mobileOpen}>
                  {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

              <nav className="hidden md:flex items-center gap-2">
                <NavLink
                  to="/dashboard/appointments"
                  className={({ isActive }) =>
                    classNames(
                      'rounded-lg px-3 py-2 flex items-center gap-2',
                      isActive
                        ? 'text-purple-500 bg-gray-200'
                        : 'text-gray-700 hover:text-primary bg-gray-100 hover:bg-gray-200'
                    )
                  }>
                  <CalendarDays size={18} />
                  {t('appointments')}
                </NavLink>

                <div className="relative" ref={notificationsRef}>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen((v) => !v)}
                    className="relative flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary">
                    <Bell size={18} className="text-gray-700" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5">
                        {notifications.length > 9 ? '9+' : notifications.length}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-20 overflow-hidden">
                      <div className="px-3 py-2 border-b flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">
                          {'Notificaciones'}
                        </span>
                        {loadingNotifications && (
                          <span className="text-xs text-gray-500">{'Cargando...'}</span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {(!notifications || notifications.length === 0) &&
                          !loadingNotifications && (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              {'Sin notificaciones'}
                            </div>
                          )}
                        {notifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => handleNotificationClick(n)}
                            className="w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50">
                            <div className="text-sm font-medium text-gray-800 truncate">
                              {n.title}
                            </div>
                            {n.message && (
                              <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {n.message}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={accountRef}>
                  <button
                    onClick={() => setDropdownOpen((v) => (v === 'account' ? '' : 'account'))}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-haspopup="menu"
                    aria-expanded={dropdownOpen === 'account'}>
                    <User size={20} />
                    <span className="text-sm font-medium">{t('account')}</span>
                  </button>

                  {dropdownOpen === 'account' && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-10 overflow-hidden">
                      <Link
                        to="/dashboard/account"
                        role="menuitem"
                        onClick={() => setDropdownOpen('')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10">
                        {t('editAccount')}
                      </Link>
                      <button
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10">
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>

          {mobileOpen && (
            <div id="mobile-menu" className="md:hidden border-t bg-white">
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center font-semibold border border-gray-300">
                    {activeCompanyInitials}
                  </div>
                  <select
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
                    value={activeCompany || ''}
                    onChange={(e) => setActiveCompany?.(Number(e.target.value))}
                    disabled={!companies.length}>
                    {!companies.length && <option value="">No companies</option>}
                    {companies.map((c) => (
                      <option key={c.companyId} value={c.companyId}>
                        {c.companyName || c.name || `Company #${c.companyId}`}
                      </option>
                    ))}
                  </select>
                </div>

                <NavLink
                  to="/dashboard/appointments"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                  <CalendarDays size={18} />
                  {t('appointments')}
                </NavLink>

                <div className="relative" ref={accountRef}>
                  <button
                    onClick={() => setDropdownOpen((v) => (v === 'account' ? '' : 'account'))}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-haspopup="menu"
                    aria-expanded={dropdownOpen === 'account'}>
                    <User size={20} />
                    <span className="text-sm font-medium">{t('account')}</span>
                  </button>

                  {dropdownOpen === 'account' && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-10 overflow-hidden">
                      <Link
                        to="/dashboard/account"
                        role="menuitem"
                        onClick={() => setDropdownOpen('')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10">
                        {t('editAccount')}
                      </Link>
                      <button
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10">
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
