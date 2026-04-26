import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login(form);
      setToken(data.token);
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9f9f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '16px',
        border: '1px solid #e5e5e5',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Логотип */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
              <span style={{ fontWeight: '700', fontSize: '24px', color: '#0f0f0f' }}>You</span>
              <div style={{ background: '#ff0000', borderRadius: '6px', padding: '2px 8px' }}>
                <span style={{ fontWeight: '700', fontSize: '24px', color: '#fff' }}>Tube</span>
              </div>
            </div>
            <span style={{
              border: '1.5px solid #0f0f0f',
              borderRadius: '20px',
              padding: '2px 10px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#0f0f0f',
            }}>
              Partner
            </span>
          </div>
          <p style={{ color: '#606060', fontSize: '14px', margin: 0 }}>
            Войдите в свой аккаунт
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fff0f0',
            color: '#ff0000',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '14px',
            borderLeft: '3px solid #ff0000',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#0f0f0f' }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1px solid #e5e5e5',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#ff0000'}
              onBlur={e => e.target.style.borderColor = '#e5e5e5'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#0f0f0f' }}>
              Пароль
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••"
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1px solid #e5e5e5',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#ff0000'}
              onBlur={e => e.target.style.borderColor = '#e5e5e5'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading ? '#ffaaaa' : '#ff0000',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>

        <div style={{
          margin: '24px 0 0',
          paddingTop: '20px',
          borderTop: '1px solid #f0f0f0',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '14px', color: '#606060', margin: 0 }}>
            Нет аккаунта?{' '}
            <Link to="/register" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: '600' }}>
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}