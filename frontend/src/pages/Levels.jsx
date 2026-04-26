import { useEffect, useState } from "react";
import { Star, Lock, CheckCircle, ChevronRight } from "lucide-react";
import useAuthStore from "../store/authStore";
import api from "../api/index";

export default function Levels() {
  const { user } = useAuthStore();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/levels").then((r) => {
      setLevels(r.data);
      setLoading(false);
    });
  }, []);

  const purchase = async (levelId) => {
    try {
      await api.post(`/levels/${levelId}/purchase`);
      setMessage("Рівень успішно куплено!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Помилка покупки");
    }
  };

  if (loading) return null;

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Рівні</h1>
      <p style={{ color: "#666", fontSize: 15, marginBottom: 24 }}>
        Підвищуй рівень — збільшуй дохід за кожне відео
      </p>

      {message && (
        <div style={{
          background: "#fff3f3",
          border: "1px solid #ffd0d0",
          borderRadius: 10,
          padding: "12px 18px",
          color: "#cc0000",
          marginBottom: 20,
          fontSize: 14,
        }}>
          {message}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {levels.map((level) => {
          const isCurrent = level.id === user?.current_level_id;
          const canBuy = !isCurrent && parseFloat(user?.balance || 0) >= parseFloat(level.price || 0);
          const isLocked = !isCurrent && !canBuy;

          return (
            <div
              key={level.id}
              style={{
                background: "#fff",
                border: isCurrent ? "2px solid #ff0000" : "1px solid #eee",
                borderRadius: 14,
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: isCurrent ? "#ff0000" : "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Star size={20} color={isCurrent ? "#fff" : "#aaa"} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>
                    {level.name}
                    {isCurrent && (
                      <span style={{
                        marginLeft: 8,
                        fontSize: 11,
                        background: "#ff0000",
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: 100,
                      }}>
                        Поточний
                      </span>
                    )}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
                    {"\u20BD"}{parseFloat(level.reward_per_task || 0).toFixed(2)} / відео &nbsp;&middot;&nbsp;
                    Депозит: {"\u20BD"}{parseFloat(level.price || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {isCurrent ? (
                <CheckCircle size={22} color="#22c55e" />
              ) : isLocked ? (
                <Lock size={20} color="#ccc" />
              ) : (
                <button
                  onClick={() => purchase(level.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 20px",
                    borderRadius: 10,
                    border: "none",
                    background: "#ff0000",
                    color: "#fff",
                    fontWeight: 500,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Купити
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}