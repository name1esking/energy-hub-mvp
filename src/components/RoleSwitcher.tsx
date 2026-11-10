
import { ChevronDown } from 'lucide-react';
import type { UiRole } from '../types/ui';

export interface RoleSwitcherProps {
  value: UiRole;
  onChange: (role: UiRole) => void;
  disabled?: boolean;
}

// Список ролей используется только внутри этого компонента.
const roleOptions: Array<{ value: UiRole; label: string }> = [
  { value: 'platform_admin', label: 'Администратор платформы' },
  { value: 'portfolio_owner', label: 'Владелец портфеля' },
  { value: 'hub_operator', label: 'Оператор хаба' },
  { value: 'building_owner', label: 'Собственник здания' },
];

export function RoleSwitcher({
  value,
  onChange,
  disabled = false,
}: RoleSwitcherProps) {
  return (
    <label className="select-wrap role-select">
      <span className="sr-only">Роль пользователя</span>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as UiRole)}
      >
        {roleOptions.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>

      <ChevronDown size={14} />
    </label>
  );
}

export default RoleSwitcher;
