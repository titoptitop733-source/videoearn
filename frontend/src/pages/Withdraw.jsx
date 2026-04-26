import { useState, useEffect } from "react";
import { ArrowUpRight, Send, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import api from "../api/index";

export default function Withdraw() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [requests, setRequests] = useState([]);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/requests?type=withdrawal");
      setRequests(res.data);
    } catch {}
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ text: "Введите корректную сумму", type: "error" });
      return;
    }
    if (parseFloat(amount) > parseFloat(user?.balance || 0)) {
      setMessage({ text: "Недостаточно средств на балансе", type: "error" });
      return;
    }
    if (!wallet) {
      setMessage({ text: "Введите реквизиты для вывода", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/requests/withdrawal", {
        amount: parseFloat(amount),
        wallet_address: wallet,
      });
      setMessage({ text: "Заявка на вывод отправлена!", type: "success" });
      setAmount("");
      setWallet("");
      fetchRequests();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Ошибка", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // 🔒 Блокировка если нет уровня
  if (!user?.current_level_id) {
    return (
      <div style={{ padding: "24px", maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Вывод средств</h1>
        <p style={{ color: "#666", fontSize: 15, marginBottom: 24 }}>
          Отправьте заявку — администратор переведет средства вручную
        </p>
        <div style={{
          background: "#fff",
          border: "2px dashed #ffd0d0",
          borderRadius: 16,
          padding: "56px 32px",
          textAlign: "center",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#fff0f0",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <Lock size={32} color="#ff0000" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f0f0f", marginBottom: 8 }}>
            Доступ заблокирован
          </h2>
          <p style={{ fontSize: 15, color: "#666", maxWidth: 380, margin: "0 auto 8px" }}>
            Чтобы выводить средства, необходимо приобрести уровень.
          </p>
          <p style={{ fontSize: 13, color: "#aaa", marginBottom: 28 }}>
            Пополните баланс и выберите уровень на странице «Уровни»
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/levels")}
              style={{
                padding: "12px 28px", borderRadius: 12,
                border: "none", background: "#ff0000",
                color: "#fff", fontSize: 15, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Выбрать уровень
            </button>
            <button
              onClick={() => navigate("/deposit")}
              style={{
                padding: "12px 28px", borderRadius: 12,
                border: "1px solid #eee", background: "#fff",
                color: "#0f0f0f", fontSize: 15, fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Пополнить баланс
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Вывод средств</h1>
      <p style={{ color: "#666", fontSize: 15, marginBottom: 24 }}>
        Отправьте заявку — администратор переведет средства вручную
      </p>

      <div style={{
        background: "#ff0000", borderRadius: 14, padding: "18px 24px",
        color: "#fff", marginBottom: 24,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 14, opacity: 0.85 }}>Доступный баланс</span>
        <span style={{ fontSize: 24, fontWeight: 700 }}>
          ₽{parseFloat(user?.balance || 0).toFixed(2)}
        </span>
      </div>

      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 16, padding: "24px", marginBottom: 24 }}>
        <label style={labelStyle}>Сумма вывода (₽)</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="number" min="0" step="0.01"
            value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
          />
          <button
            onClick={() => setAmount(parseFloat(user?.balance || 0).toFixed(2))}
            style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #eee", background: "#f9f9f9", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Макс
          </button>
        </div>

        <label style={labelStyle}>Реквизиты (карта / кошелек)</label>
        <input
          type="text" value={wallet} onChange={(e) => setWallet(e.target.value)}
          placeholder="USDT TRC20 / номер карты..."
          style={inputStyle}
        />

        {message.text && (
          <div style={{
            marginTop: 4, padding: "10px 16px", borderRadius: 10,
            background: message.type === "success" ? "#f0fff4" : "#fff3f3",
            color: message.type === "success" ? "#16a34a" : "#cc0000",
            fontSize: 14, marginBottom: 4,
          }}>
            {message.text}
          </div>
        )}

        <button
          onClick={handleSubmit} disabled={loading}
          style={{
            width: "100%", marginTop: 14, padding: "14px", borderRadius: 12,
            border: "none", background: loading ? "#ccc" : "#ff0000",
            color: "#fff", fontSize: 15, fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <ArrowUpRight size={18} />
          {loading ? "Отправка..." : "Вывести средства"}
        </button>
      </div>

      {requests.length > 0 && (
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>Мои заявки</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {requests.map((r) => (
              <div key={r.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Send size={15} color="#aaa" />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>₽{parseFloat(r.amount).toFixed(2)}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#aaa" }}>
                        {r.details?.wallet_address || r.wallet_address || ""}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                {r.admin_note && (
                  <div style={{
                    marginTop: 10, padding: "8px 12px", borderRadius: 8,
                    background: r.status === "approved" || r.status === "completed" ? "#f0fff4" : "#fff3f3",
                    borderLeft: `3px solid ${r.status === "approved" || r.status === "completed" ? "#22c55e" : "#ef4444"}`,
                  }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#888", marginBottom: 2 }}>Комментарий админа:</p>
                    <p style={{ margin: 0, fontSize: 13, color: "#444" }}>{r.admin_note}</p>
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
    approved: { color: "#22c55e", label: "Одобрено" },
    rejected: { color: "#ef4444", label: "Отклонено" },
    completed: { color: "#22c55e", label: "Одобрено" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: s.color, background: s.color + "20", padding: "4px 12px", borderRadius: 100, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

const labelStyle = { display: "block", fontSize: 13, color: "#888", marginBottom: 6, fontWeight: 500 };
const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 16 };