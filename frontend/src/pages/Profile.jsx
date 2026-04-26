import useAuthStore from "../store/authStore";
import { User, LogOut, Mail, Shield } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuthStore();

  return (
    <div style={{ padding: "24px", maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Профіль</h1>

      {/* Аватар + ім'я */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: 16,
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 20,
          gap: 12,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#ff0000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={36} color="#fff" />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>{user?.username}</p>
          {user?.is_admin && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginTop: 6,
                background: "#fff3f3",
                color: "#ff0000",
                fontSize: 12,
                fontWeight: 600,
                padding: "3px 12px",
                borderRadius: 100,
              }}
            >
              <Shield size={12} />
              Адмін
            </span>
          )}
        </div>
      </div>

      {/* Інфо */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <InfoRow icon={<Mail size={16} color="#888" />} label="Email" value={user?.email || "—"} />
        <InfoRow
          icon={<User size={16} color="#888" />}
          label="Баланс"
          value={`$${parseFloat(user?.balance || 0).toFixed(2)}`}
        />
      </div>

      {/* Вихід */}
      <button
        onClick={logout}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 14,
          border: "1.5px solid #ff0000",
          background: "#fff",
          color: "#ff0000",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <LogOut size={18} />
        Вийти
      </button>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#888", fontSize: 14 }}>
        {icon}
        {label}
      </div>
      <span style={{ fontWeight: 500, fontSize: 15 }}>{value}</span>
    </div>
  );
}