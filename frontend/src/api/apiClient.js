import { getToken } from "../utils/storage";

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { ...options, headers });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = typeof data === "object" && data?.message ? data.message : res.statusText;
    throw new Error(msg || "İstek başarısız");
  }
  return data;
}

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  examTypes: () => request("/exam-types"),
  topics: (examTypeId) => request(`/exam-types/${examTypeId}/topics`),
  aiGenerate: (body) => request("/study-plans/ai-generate", { method: "POST", body: JSON.stringify(body) }),
  plans: () => request("/study-plans"),
  plan: (id) => request(`/study-plans/${id}`),
  tasks: (studyPlanId) => request(`/tasks?studyPlanId=${encodeURIComponent(studyPlanId)}`),
  completeTask: (taskId) =>
    request(`/tasks/${taskId}/complete`, { method: "PUT", body: JSON.stringify({}) }),
  startSession: (body) => request("/study-sessions/start", { method: "POST", body: JSON.stringify(body || {}) }),
  currentSession: () => request("/study-sessions/current"),
  sessionStatus: (sessionId, status) =>
    request(`/study-sessions/${sessionId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  finishSession: (sessionId) =>
    request(`/study-sessions/${sessionId}/finish`, { method: "PUT", body: JSON.stringify({}) }),
  updateMe: (body) => request("/users/me", { method: "PUT", body: JSON.stringify(body) }),
  changePassword: (body) =>
    request("/users/me/password", { method: "PUT", body: JSON.stringify(body) }),
  searchUsers: (q) => request(`/users/search?q=${encodeURIComponent(q)}`),
  deleteUser: (userId) => request(`/users/${userId}`, { method: "DELETE" }),
  analyticsWeekly: () => request("/analytics/weekly"),
  friends: () => request("/friends"),
  activeStudying: () => request("/friends/active-studying"),
  friendRequest: (body) => request("/friends/request", { method: "POST", body: JSON.stringify(body) }),
  acceptFriend: (id) => request(`/friends/${id}/accept`, { method: "POST", body: JSON.stringify({}) }),
  rejectFriend: (id) => request(`/friends/${id}/reject`, { method: "POST", body: JSON.stringify({}) }),
  removeFriend: (id) => request(`/friends/${id}`, { method: "DELETE" }),
};
