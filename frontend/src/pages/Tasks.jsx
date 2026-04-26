import { useEffect, useState, useRef } from "react";
import { PlayCircle, CheckCircle, Clock, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/index";
import useAuthStore from "../store/authStore";

const TIMER_DURATION = 20;

export default function Tasks() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [phase, setPhase] = useState("idle");
  const [message, setMessage] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const startTask = async (task) => {
    try {
      await api.post("/tasks/" + task.id + "/start");
      setActiveTask(task);
      setTimeLeft(TIMER_DURATION);
      setPhase("watching");
      setMessage("");
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            completeTask(task.id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Ошибка при запуске задания");
    }
  };

  const completeTask = async (videoId) => {
    try {
      await api.post("/tasks/" + videoId + "/complete");
      const meRes = await api.get("/auth/me");
      setUser(meRes.data);
      setPhase("rewarded");
      fetchTasks();
    } catch (err) {
      setPhase("done");
      setMessage(err.response?.data?.message || "Ошибка при завершении задания");
    }
  };

  const resetTask = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveTask(null);
    setPhase("idle");
    setTimeLeft(TIMER_DURATION);
    setMessage("");
  };

  useEffect(() => { return () => clearInterval(intervalRef.current); }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <span style={{ color: "#888" }}>Загрузка...</span>
    </div>
  );

  // 🔒 Блокування якщо немає рівня
  if (!user?.current_level_id) {
    return (
      <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Задания</h1>
        <p style={{ color: "#666", fontSize: 15, marginBottom: 28 }}>
          Смотрите видео 20 секунд и получайте вознаграждение
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
            Доступ заблоковано
          </h2>
          <p style={{ fontSize: 15, color: "#666", marginBottom: 6, maxWidth: 400, margin: "0 auto 8px" }}>
            Щоб виконувати завдання та заробляти, необхідно придбати рівень.
          </p>
          <p style={{ fontSize: 13, color: "#aaa", marginBottom: 28 }}>
            Поповни баланс і обери рівень на сторінці «Уровні»
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
              Обрати рівень
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
              Поповнити баланс
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Задания</h1>
      <p style={{ color: "#666", fontSize: 15, marginBottom: 28 }}>
        Смотрите видео 20 секунд и получайте вознаграждение
      </p>

      {activeTask && (
        <div style={{ background: "#fff", border: "2px solid #ff0000", borderRadius: 16, padding: "28px 32px", marginBottom: 28, textAlign: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{activeTask.title}</h2>

          {phase === "watching" && (
            <>
              <div style={{ position: "relative", display: "inline-block", margin: "20px 0" }}>
                <svg width={120} height={120} viewBox="0 0 120 120">
                  <circle cx={60} cy={60} r={52} fill="none" stroke="#f3f3f3" strokeWidth={8} />
                  <circle cx={60} cy={60} r={52} fill="none" stroke="#ff0000" strokeWidth={8}
                    strokeDasharray={String(2 * Math.PI * 52)}
                    strokeDashoffset={String(2 * Math.PI * 52 * (1 - timeLeft / TIMER_DURATION))}
                    strokeLinecap="round" transform="rotate(-90 60 60)"
                    style={{ transition: "stroke-dashoffset 1s linear" }} />
                  <text x={60} y={65} textAnchor="middle" fontSize={28} fontWeight={700} fill="#111">{timeLeft}</text>
                </svg>
              </div>
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: 16, height: 220 }}>
                {activeTask.url ? (
                  <>
                    <iframe src={activeTask.url + "?autoplay=1&controls=0&disablekb=1"}
                      width="100%" height="220"
                      style={{ border: "none", display: "block" }}
                      allow="autoplay; encrypted-media" title="task-video" />
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 10 }} />
                  </>
                ) : (
                  <div style={{ background: "#111", height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", opacity: 0.5 }}>
                    <PlayCircle size={40} />
                  </div>
                )}
              </div>
              <p style={{ color: "#666", fontSize: 14 }}>
                Награда зачислится через <strong style={{ color: "#ff0000" }}>{timeLeft}с</strong>
              </p>
            </>
          )}

          {phase === "rewarded" && (
            <div style={{ padding: "20px 0" }}>
              <CheckCircle size={56} color="#22c55e" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 18, fontWeight: 600, color: "#22c55e", margin: "0 0 8px" }}>Задание выполнено!</p>
              <p style={{ color: "#666" }}>+₽{parseFloat(activeTask.reward || 0).toFixed(2)} начислено на баланс</p>
              <button onClick={resetTask} style={{ marginTop: 16, padding: "10px 28px", borderRadius: 10, border: "none", background: "#ff0000", color: "#fff", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
                Далее
              </button>
            </div>
          )}

          {phase === "done" && (
            <div style={{ padding: "20px 0", color: "#e74c3c" }}>
              <p>{message}</p>
              <button onClick={resetTask} style={{ marginTop: 12, cursor: "pointer" }}>Назад</button>
            </div>
          )}
        </div>
      )}

      {!activeTask && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tasks.length === 0 && <div style={{ textAlign: "center", color: "#888", padding: "60px 0" }}>Нет доступных заданий</div>}
          {tasks.map((task) => <TaskCard key={task.id} task={task} onStart={() => startTask(task)} />)}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onStart }) {
  const isDone = task.completed_today;
  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: isDone ? 0.6 : 1 }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{task.title}</p>
        <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#666" }}>
            <Clock size={14} />{task.duration_seconds || 20}с
          </span>
          <span style={{ fontSize: 13, color: "#ff0000", fontWeight: 500 }}>
            +₽{parseFloat(task.reward || 0).toFixed(2)}
          </span>
        </div>
      </div>
      {isDone ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#22c55e", fontSize: 14 }}>
          <CheckCircle size={18} />Выполнено
        </div>
      ) : (
        <button onClick={onStart} style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: "#ff0000", color: "#fff", fontWeight: 500, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <PlayCircle size={16} />Смотреть
        </button>
      )}
    </div>
  );
}