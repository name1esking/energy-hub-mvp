import {
  Activity,
  Bell,
  Building2,
  Database,
  History,
  LayoutDashboard,
  Network,
  PlugZap,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import type { SidebarPageId, UiRole } from '../types/ui';

export interface SidebarProps {
  activePage: SidebarPageId;
  role: UiRole;
  onNavigate: (page: SidebarPageId) => void;
  mobileOpen: boolean;
  onClose: () => void;
}

const roleLabels: Record<UiRole, string> = {
  platform_admin: 'Администратор платформы',
  portfolio_owner: 'Владелец портфеля',
  hub_operator: 'Оператор хаба',
  building_owner: 'Собственник здания',
};

type NavigationItem = {
  id: SidebarPageId;
  label: string;
  icon: typeof LayoutDashboard;
};

const overviewItem: NavigationItem = {
  id: 'overview',
  label: 'Обзор',
  icon: LayoutDashboard,
};
const analyticsItem: NavigationItem = {
  id: 'analytics',
  label: 'Аналитика',
  icon: Activity,
};
const notificationsItem: NavigationItem = {
  id: 'notifications',
  label: 'Уведомления',
  icon: Bell,
};
const servicesItem: NavigationItem = {
  id: 'services',
  label: 'Энергетические сервисы',
  icon: PlugZap,
};
const qualityItem: NavigationItem = {
  id: 'data-quality',
  label: 'Качество данных',
  icon: Database,
};
const historyItem: NavigationItem = {
  id: 'history',
  label: 'История событий',
  icon: History,
};

const navigationByRole: Record<UiRole, NavigationItem[]> = {
  platform_admin: [
    overviewItem,
    { id: 'objects', label: 'Объекты', icon: Building2 },
    analyticsItem,
    notificationsItem,
    servicesItem,
    qualityItem,
    historyItem,
  ],
  portfolio_owner: [
    overviewItem,
    { id: 'energy-hub', label: 'Схема энергохаба', icon: Network },
    analyticsItem,
    notificationsItem,
    servicesItem,
    qualityItem,
    historyItem,
  ],
  hub_operator: [
    overviewItem,
    { id: 'energy-hub', label: 'Схема энергохаба', icon: Network },
    analyticsItem,
    notificationsItem,
    servicesItem,
    qualityItem,
    historyItem,
  ],
  building_owner: [
    overviewItem,
    { id: 'energy-hub', label: 'Схема энергохаба', icon: Network },
    analyticsItem,
    notificationsItem,
    servicesItem,
    qualityItem,
    historyItem,
  ],
};

export function Sidebar({ activePage, role, onNavigate, mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      <button
        type="button"
        className={`sidebar-backdrop ${mobileOpen ? 'is-visible' : ''}`}
        aria-label="Закрыть меню"
        onClick={onClose}
      />
      <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Основная навигация">
        <div className="sidebar-brand">
          <div className="brand-mark"><Zap size={19} fill="currentColor" /></div>
          <div className="brand-copy">
            <strong>ENERGY HUB</strong>
            <span>Energy management</span>
          </div>
          <button type="button" className="icon-button sidebar-close" onClick={onClose} aria-label="Закрыть меню">
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-caption">WORKSPACE</div>
        <nav className="sidebar-nav">
          {navigationByRole[role].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`nav-item ${activePage === id ? 'active' : ''}`}
              onClick={() => {
                onNavigate(id);
                onClose();
              }}
              aria-current={activePage === id ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-caption">ТЕКУЩАЯ РОЛЬ</div>
          <div className="platform-status">
            <ShieldCheck size={15} />
            <span>{roleLabels[role]}</span>
          </div>
          <div className="sidebar-footer">
            <span>ENERGY HUB MVP</span>
            <span className="version-label">UI demo</span>
          </div>
        </div>
      </aside>
    </>
  );
}
