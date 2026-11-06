import {
  Activity,
  Building2,
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

const navigation: Array<{ id: SidebarPageId; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
  { id: 'energy-hub', label: 'Схема энергохаба', icon: Network },
  { id: 'objects', label: 'Объекты', icon: Building2 },
  { id: 'services', label: 'Энергетические сервисы', icon: PlugZap },
  { id: 'data-quality', label: 'Качество данных', icon: Activity },
  { id: 'history', label: 'История событий', icon: History },
];

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
          {navigation.map(({ id, label, icon: Icon }) => (
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
