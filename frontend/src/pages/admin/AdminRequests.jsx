import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import api from "../../api/index";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState({});

  useEffect(() => { fetchRequests(); }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/requests?status=" + filter);
      setRequests(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAction = async (id, action) => {
    try {
      await api.patch("/admin/requests/" + id, { status: action, admin_note: notes[id] || "" });
      setMessage(action === "approved" ? "Подтверждено" : "Отклонено");
      setTimeout(() => setMessage(""), 3000);
      fetchRequests();
    } catch (err) {
      setMessage(err.response?.data?.message || "Ошибка");
    }
  };

  const tabs = [
    { key: "pending", label: "Ожидают" },
    { key: "approved", label: "Подтвержденные" },
    { key: "rejected", label: "Отклоненные" },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Заявки</h1>
      <p style={{ color: "#666", fontSize: 15, marginBottom: 24 }}>Депозиты и выводы от пользователей</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            padding: "8px 20px", borderRadius: 100, border: "1.5px solid",
            borderColor: filter === t.key ? "#ff0000" : "#eee",
            background: filter === t.key ? "#ff0000" : "#fff",
            color: filter === t.key ? "#fff" : "#555",
            fontWeight: 500, fontSize: 14, cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {message && (
        <div style={{ padding: "10px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14,
          background: message.includes("Подтверждено") ? "#f0fff4" : "#fff3f3",
          color: message.includes("Подтверждено") ? "#16a34a" : "#cc0000",
        }}>{message}</div>
      )}

      {loading ? <p style={{ color: "#aaa" }}>Загрузка...</p>
      : requests.length === 0 ? <p style={{ color: "#aaa", textAlign: "center", padding: "60px 0" }}>Нет заявок</p>
      : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {requests.map((r) => (
            <div key={r.id} style={{
              background: "#fff", border: "1px solid #eee", borderRadius: 14,
              padding: "18px 22px", gap: 16,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                    <TypeBadge type={r.type} />
                    <span style={{ fontWeight: 700, fontSize: 16 }}>
                      {"₽"}{parseFloat(r.amount).toFixed(2)}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
                    Пользователь: <strong>{r.username}</strong> · {new Date(r.created_at).toLocaleString("ru-RU")}
                  </p>
                  {r.details?.wallet_address && (
                    <p style={{ margin: "6px 0 0", fontSize: 13, color: "#333",
                      background: "#f5f5f5", padding: "6px 12px", borderRadius: 8, display: "inline-block" }}>
                      Реквизиты: <strong>{r.details.wallet_address}</strong>
                    </p>
                  )}
                  {r.details?.comment && (
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#999" }}>
                      Комментарий пользователя: {r.details.comment}
                    </p>
                  )}
                  {r.admin_note && (
                    <p style={{ margin: "8px 0 0", fontSize: 13, color: "#555",
                      background: "#fffbe6", padding: "6px 12px", borderRadius: 8, display: "inline-block", border: "1px solid #ffe58f" }}>
                      Ответ админа: {r.admin_note}
                    </p>
                  )}
                </div>
              </div>

              {filter === "pending" && (
                <div style={{ marginTop: 14 }}>
                  <textarea
                    placeholder="Комментарий для пользователя (необязательно)..."
                    value={notes[r.id] || ""}
                    onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #eee", fontSize: 13, resize: "vertical",
                      minHeight: 60, boxSizing: "border-box", outline: "none",
                      fontFamily: "inherit", marginBottom: 10, color: "#333",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleAction(r.id, "approved")} style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
                      borderRadius: 10, border: "none", background: "#22c55e",
                      color: "#fff", fontWeight: 500, fontSize: 13, cursor: "pointer",
                    }}><Check size={16} />Одобрить</button>
                    <button onClick={() => handleAction(r.id, "rejected")} style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
                      borderRadius: 10, border: "none", background: "#ef4444",
                      color: "#fff", fontWeight: 500, fontSize: 13, cursor: "pointer",
                    }}><X size={16} />Отклонить</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TypeBadge({ type }) {
  const isDeposit = type === "deposit";
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
      background: isDeposit ? "#e8f5e9" : "#fff3e0",
      color: isDeposit ? "#2e7d32" : "#e65100",
      textTransform: "uppercase", letterSpacing: 0.5,
    }}>
      {isDeposit ? "Депозит" : "Вывод"}
    </span>
  );
}
