import { Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      background: '#fff',
      borderBottom: '1px solid #e5e5e5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      zIndex: 100,
    }}>
      {/* Лого */}
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
    <span style={{ fontWeight: '700', fontSize: '20px', color: '#0f0f0f' }}>You</span>
    <div style={{
      background: '#ff0000',
      borderRadius: '6px',
      padding: '2px 8px',
      display: 'flex',
      alignItems: 'center',
    }}>
      <span style={{ fontWeight: '700', fontSize: '20px', color: '#fff' }}>Tube</span>
    </div>
  </div>
  <span style={{
    border: '1.5px solid #0f0f0f',
    borderRadius: '20px',
    padding: '2px 10px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#0f0f0f',
    lineHeight: '1.4',
  }}>
    Partner
  </span>
</div>

      {/* Пошук */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #e5e5e5',
        borderRadius: '40px',
        overflow: 'hidden',
        width: '40%',
      }}>
        <input
          placeholder="Пошук"
          style={{
            border: 'none',
            outline: 'none',
            padding: '8px 16px',
            fontSize: '14px',
            width: '100%',
          }}
        />
        <button style={{
          background: '#f8f8f8',
          border: 'none',
          borderLeft: '1px solid #e5e5e5',
          padding: '8px 16px',
          cursor: 'pointer',
        }}>
          <Search size={18} />
        </button>
      </div>

      {/* Баланс + вихід */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <div style={{
            background: '#fff0f0',
            color: '#ff0000',
            padding: '6px 14px',
            borderRadius: '20px',
            fontWeight: '600',
            fontSize: '14px',
          }}>
            ₽ {parseFloat(user.balance || 0).toFixed(2)}
          </div>
        )}
        {user && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#ff0000',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '14px',
          }}>
            {user.username?.[0]?.toUpperCase()}
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#606060',
          }}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}