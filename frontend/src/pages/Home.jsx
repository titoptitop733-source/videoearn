import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, TrendingUp, DollarSign, Star, Plus, ChevronRight } from "lucide-react";
import useAuthStore from "../store/authStore";
import api from "../api/index";

export default function Home() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ videosWatched: 0, earned: 0 });
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, levelsRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/levels"),
        ]);
        const me = meRes.data;
        const levels = levelsRes.data;
        const currentLevel = levels.find((l) => l.id === me.current_level_id) || levels[0];
        setLevel(currentLevel);
        setStats({
          videosWatched: me.videos_watched || 0,
          earned: me.total_earned || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const progress = level
    ? Math.min(100, Math.round(((user?.balance || 0) / (level.price || 1)) * 100))
    : 0;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "#888", fontSize: 16 }}>Завантаження...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: "#111" }}>
          Привіт, {user?.username || "Користувач"} 👋
        </h1>
        <p style={{ margin: "6px 0 0", color: "#666", fontSize: 15 }}>
          Переглядай відео та заробляй!
        </p>
      </div>

      <div
        style={{
          background: "#ff0000",
          borderRadius: 16,
          padding: "28px 32px",
          marginBottom: 20,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.85 }}>Поточний баланс</p>
          <p style={{ margin: "6px 0 0", fontSize: 36, fontWeight: 700 }}>
            ₽{parseFloat(user?.balance || 0).toFixed(2)}
          </p>
        </div>
        <DollarSign size={48} style={{ opacity: 0.3 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <StatCard
          icon={<PlayCircle size={22} color="#ff0000" />}
          label="Відео переглянуто"
          value={stats.videosWatched}
        />
        <StatCard
          icon={<TrendingUp size={22} color="#ff0000" />}
          label="Всього зароблено"
          value={`₽${parseFloat(stats.earned).toFixed(2)}`}
        />
      </div>

      {level && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Star size={20} color="#ff0000" />
            <span style={{ fontWeight: 600, fontSize: 16 }}>Рівень: {level.name}</span>
          </div>
          <p style={{ margin: "0 0 10px", color: "#666", fontSize: 14 }}>
            Дохід: ₽{parseFloat(level.reward_per_task || 0).toFixed(2)} / відео
          </p>
          <div style={{ background: "#f3f3f3", borderRadius: 100, height: 10 }}>
            <div
              style={{
                background: "#ff0000",
                height: 10,
                borderRadius: 100,
                width: `${progress}%`,
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#999" }}>
            {progress}% до наступного рівня
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <QuickButton
          label="Розпочати завдання"
          icon={<PlayCircle size={20} />}
          onClick={() => navigate("/tasks")}
          primary
        />
        <QuickButton
          label="Поповнити баланс"
          icon={<Plus size={20} />}
          onClick={() => navigate("/deposit")}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 16,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon}
        <span style={{ fontSize: 13, color: "#888" }}>{label}</span>
      </div>
      <span style={{ fontSize: 26, fontWeight: 700, color: "#111" }}>{value}</span>
    </div>
  );
}

function QuickButton({ label, icon, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderRadius: 14,
        border: primary ? "none" : "1px solid #eee",
        background: primary ? "#ff0000" : "#fff",
        color: primary ? "#fff" : "#111",
        fontSize: 15,
        fontWeight: 500,
        cursor: "pointer",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon}
        {label}
      </div>
      <ChevronRight size={16} />
    </button>
  );
}