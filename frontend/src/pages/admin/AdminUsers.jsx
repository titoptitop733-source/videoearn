import { useEffect, useState } from "react";
import { Users, Search, ShieldCheck, ShieldOff } from "lucide-react";
import api from "../../api/index";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId, isAdmin) => {
    try {
      await api.patch(`/admin/users/${userId}`, { is_admin: !isAdmin });
      setMessage("Статус оновлено");
      setTimeout(() => setMessage(""), 3000);
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Помилка");
    }
  };

  const adjustBalance = async (userId) => {
    const amount = parseFloat(prompt("Введіть суму коригування (може бути від'ємною):"));
    if (isNaN(amount)) return;
    try {
      await api.patch(`/admin/users/${userId}/balance`, { amount });
      setMessage(`Баланс змінено на ${amount > 0 ? "+" : ""}${amount}`);
      setTimeout(() => setMessage(""), 3000);
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Помилка");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "24px", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Користувачі</h1>
      <p style={{ color: "#666", fontSize: 15, marginBottom: 24 }}>
        Управління акаунтами та балансами
      </p>

      {/* Пошук */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Search size={18} color="#aaa" />
        <input
          type="text"
          placeholder="Пошук по імені або email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            fontSize: 15,
            outline: "none",
          }}
        />
      </div>

      {message && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            background: "#f0fff4",
            color: "#16a34a",
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <p style={{ color: "#aaa" }}>Завантаження...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((u) => (
            <div
              key={u.id}
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 14,
                padding: "16px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              {/* Аватар + інфо */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: u.is_admin ? "#ff0000" : "#f3f3f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 700,
                    color: u.is_admin ? "#fff" : "#aaa",
                  }}
                >
                  {u.username[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{u.username}</span>
                    {u.is_admin && (
                      <span
                        style={{
                          fontSize: 11,
                          background: "#fff3f3",
                          color: "#ff0000",
                          padding: "2px 8px",
                          borderRadius: 100,
                          fontWeight: 700,
                        }}
                      >
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "3px 0 0", fontSize: 13, color: "#aaa" }}>{u.email}</p>
                </div>
              </div>

              {/* Баланс */}
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#aaa" }}>Баланс</p>
                <p style={{ margin: "2px 0 0", fontWeight: 700, fontSize: 16 }}>
                  ${parseFloat(u.balance || 0).toFixed(2)}
                </p>
              </div>

              {/* Дії */}
              <div style={{ display: "flex", gap: 8 }}>
                <SmallButton
                  onClick={() => adjustBalance(u.id)}
                  label="Баланс"
                  color="#3b82f6"
                />
                <SmallButton
                  onClick={() => toggleAdmin(u.id, u.is_admin)}
                  label={u.is_admin ? "Зняти адміна" : "Зробити адміном"}
                  color={u.is_admin ? "#ef4444" : "#22c55e"}
                  icon={u.is_admin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                />
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p style={{ color: "#aaa", textAlign: "center", padding: "60px 0" }}>
              Користувачів не знайдено
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SmallButton({ onClick, label, color, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "7px 14px",
        borderRadius: 9,
        border: `1.5px solid ${color}`,
        background: "#fff",
        color,
        fontWeight: 500,
        fontSize: 13,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {label}
    </button>
  );
}