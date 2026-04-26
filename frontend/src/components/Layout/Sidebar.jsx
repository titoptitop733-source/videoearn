import { Home, PlaySquare, User, TrendingUp, CreditCard, ArrowDownCircle, Shield, Info } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const links = [
  { to: '/',         icon: Home,             label: 'Главная' },
  { to: '/tasks',    icon: PlaySquare,       label: 'Задания' },
  { to: '/levels',   icon: TrendingUp,       label: 'Уровни' },
  { to: '/deposit',  icon: CreditCard,       label: 'Пополнить' },
  { to: '/withdraw', icon: ArrowDownCircle,  label: 'Вывести' },
  { to: '/profile',  icon: User,             label: 'Профиль' },
  { to: '/about',    icon: Info,             label: 'О нас' },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  
  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: '#fff',
      borderRight: '1px solid #e5e5e5',
      padding: '16px 0',
      position: 'fixed',
      top: '56px',
      left: 0,
    }}>
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '10px 24px',
            textDecoration: 'none',
            color: isActive ? '#ff0000' : '#0f0f0f',
            background: isActive ? '#fff0f0' : 'transparent',
            borderRadius: '10px',
            margin: '2px 8px',
            fontWeight: isActive ? '600' : '400',
            fontSize: '14px',
          })}
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}

      {user?.is_admin && (
        <>
          <div style={{ 
            margin: '16px 24px 8px', 
            fontSize: '12px', 
            color: '#999', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px' 
          }}>
            Админ-панель
          </div>
          <NavLink
            to="/admin/requests"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '10px 24px',
              textDecoration: 'none',
              color: isActive ? '#ff0000' : '#0f0f0f',
              background: isActive ? '#fff0f0' : 'transparent',
              borderRadius: '10px',
              margin: '2px 8px',
              fontSize: '14px',
              fontWeight: isActive ? '600' : '400',
            })}
          >
            <Shield size={20} />
            Заявки
          </NavLink>
        </>
      )}
    </aside>
  );
}