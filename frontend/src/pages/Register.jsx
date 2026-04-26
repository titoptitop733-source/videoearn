import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import useAuthStore from '../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Пароли не совпадают');
      return;
    }
    if (form.password.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }
    setLoading(true);
    try {
      const { data } = await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setToken(data.token);
      setUser(data.user);
      navigate('/deposit');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #e5e5e5',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#0f0f0f',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9f9f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
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
            Создайте аккаунт бесплатно
          </p>
        </div>

        {/* Инфо баннер */}
        <div style={{
          background: '#fff8f8',
          border: '1px solid #ffd0d0',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}>
          <span style={{ fontSize: '18px', marginTop: '1px' }}>💡</span>
          <p style={{ margin: 0, fontSize: '13px', color: '#444', lineHeight: 1.6 }}>
            После регистрации пополни баланс и выбери уровень — это откроет доступ к заданиям и выводу средств.
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
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Имя пользователя</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="ivan123"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#ff0000'}
              onBlur={e => e.target.style.borderColor = '#e5e5e5'}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#ff0000'}
              onBlur={e => e.target.style.borderColor = '#e5e5e5'}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Пароль</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="минимум 6 символов"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#ff0000'}
              onBlur={e => e.target.style.borderColor = '#e5e5e5'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Подтвердить пароль</label>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="повторите пароль"
              style={inputStyle}
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
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div style={{
          margin: '24px 0 0',
          paddingTop: '20px',
          borderTop: '1px solid #f0f0f0',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '14px', color: '#606060', margin: 0 }}>
            Уже есть аккаунт?{' '}
            <Link to="/login" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: '600' }}>
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}