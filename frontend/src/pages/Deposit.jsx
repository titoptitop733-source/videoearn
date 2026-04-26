import { useState, useEffect } from "react";
import { Send, Clock } from "lucide-react";
import api from "../api/index";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [requests, setRequests] = useState([]);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/requests?type=deposit");
      setRequests(res.data);
    } catch {}
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ text: "Введите корректную сумму", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/requests/deposit", { amount: parseFloat(amount), comment });
      setMessage({ text: "Заявка отправлена! Ожидайте подтверждения админом.", type: "success" });
      setAmount("");
      setComment("");
      fetchRequests();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Ошибка", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Пополнение</h1>
      <p style={{ color: "#666", fontSize: 15, marginBottom: 24 }}>
        Отправьте заявку — админ подтвердит её вручную
      </p>
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: "24px", marginBottom: 24 }}>
        <label style={labelStyle}>Сумма (₽)</label>
        <input type="number" min="0" step="0.01" value={amount}
          onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
          style={inputStyle} />
        <label style={labelStyle}>Комментарий (необязательно)</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="Метод оплаты, номер транзакции..." rows={3}
          style={{ ...inputStyle, resize: "vertical", padding: "10px 14px" }} />
        {message.text && (
          <div style={{ marginTop: 14, padding: "10px 16px", borderRadius: 10, fontSize: 14,
            background: message.type === "success" ? "#f0fff4" : "#fff3f3",
            color: message.type === "success" ? "#16a34a" : "#cc0000" }}>
            {message.text}
          </div>
        )}
        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", marginTop: 18, padding: "14px", borderRadius: 12, border: "none",
          background: loading ? "#ccc" : "#ff0000", color: "#fff", fontSize: 15,
          fontWeight: 600, cursor: loading ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Send size={18} />
          {loading ? "Отправка..." : "Отправить заявку"}
        </button>
      </div>

      {requests.length > 0 && (
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>Мои заявки</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {requests.map((r) => (
              <div key={r.id} style={{ background: "#fff", border: "1px solid #eee",
                borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Clock size={16} color="#aaa" />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>
                        {"₽"}{parseFloat(r.amount).toFixed(2)}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#aaa" }}>
                        {new Date(r.created_at).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                {r.admin_note && (
                  <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, fontSize: 13,
                    background: r.status === "rejected" ? "#fff3f3" : "#fffbe6", color: "#555", borderLeft: "3px solid #ffcc00" }}>
                    <strong>Ответ админа:</strong> {r.admin_note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { color: "#f59e0b", label: "Ожидает" },
    approved: { color: "#22c55e", label: "Подтверждено" },
    rejected: { color: "#ef4444", label: "Отклонено" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: s.color,
      background: s.color + "20", padding: "4px 12px", borderRadius: 100 }}>
      {s.label}
    </span>
  );
}

const labelStyle = { display: "block", fontSize: 13, color: "#888", marginBottom: 6, fontWeight: 500 };
const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1px solid #ddd", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 16 };
