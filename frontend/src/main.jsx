import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import api from './api/index'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Profile from './pages/Profile'
import Levels from './pages/Levels'
import Deposit from './pages/Deposit'
import Withdraw from './pages/Withdraw'
import About from './pages/About'
import AdminRequests from './pages/admin/AdminRequests'
import AdminUsers from './pages/admin/AdminUsers'
import Layout from './components/Layout/Layout'

function PrivateRoute({ children }) {
  const token = useAuthStore((state) => state.token)
  return token ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const user = useAuthStore((state) => state.user)
  return user?.is_admin ? children : <Navigate to="/" />
}

function AppInit({ children }) {
  const { token, setUser, logout } = useAuthStore()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => setUser(data))
        .catch(() => logout())
        .finally(() => setReady(true))
    } else {
      setReady(true)
    }
  }, [])
  if (!ready) return null
  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppInit>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><Layout><Tasks /></Layout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        <Route path="/levels" element={<PrivateRoute><Layout><Levels /></Layout></PrivateRoute>} />
        <Route path="/deposit" element={<PrivateRoute><Layout><Deposit /></Layout></PrivateRoute>} />
        <Route path="/withdraw" element={<PrivateRoute><Layout><Withdraw /></Layout></PrivateRoute>} />
        <Route path="/about" element={<PrivateRoute><Layout><About /></Layout></PrivateRoute>} />
        <Route path="/admin/requests" element={<AdminRoute><Layout><AdminRequests /></Layout></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><Layout><AdminUsers /></Layout></AdminRoute>} />
      </Routes>
    </AppInit>
  </BrowserRouter>
)