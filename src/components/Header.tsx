import { Bell, ChevronDown, Menu, Moon, Sun } from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import type { EnergyObjectView, Period, ThemeMode, UiRole } from '../types/ui';

export interface HeaderProps {
  energyObject: EnergyObjectView;
  role: UiRole;
  onRoleChange: (role: UiRole) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  period: Period;
  onPeriodChange: (period: Period) => void;
  onMenuClick: () => void;
  unreadCount: number;
}

export function Header({
  energyObject,
  role,
  onRoleChange,
  theme,
  onThemeChange,
  period,
  onPeriodChange,
  onMenuClick,
  unreadCount,
}: HeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="icon-button mobile-menu-button" onClick={onMenuClick} aria-label="Открыть меню">
          <Menu size={20} />
        </button>
        <div className="breadcrumbs">
          <span>Energy Hub</span>
          <span className="breadcrumb-separator">/</span>
          <strong>{energyObject.name}</strong>
        </div>
      </div>

      <div className="topbar-actions">
        <label className="select-wrap period-select">
          <span className="sr-only">Период</span>
          <select value={period} onChange={(event) => onPeriodChange(event.target.value as Period)}>
            <option value="24h">Последние 24 часа · демо</option>
            <option value="7d" disabled>Последние 7 дней · нет данных</option>
            <option value="30d" disabled>Последние 30 дней · нет данных</option>
          </select>
          <ChevronDown size={14} />
        </label>

        <RoleSwitcher value={role} onChange={onRoleChange} />

        <button
          type="button"
          className="icon-button theme-toggle"
          onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          className="icon-button notification-trigger"
          aria-label={`Уведомления: ${unreadCount}`}
          onClick={() => document.getElementById('notifications')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="notification-dot" />}
        </button>
      </div>
    </header>
  );
}
