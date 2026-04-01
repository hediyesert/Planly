import { getToken } from "../utils/storage";
const baseURL="https://planly-gamma.vercel.app";
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
  
  register: (body) => request(baseURL+"/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request(baseURL+"/auth/login", { method: "POST", body: JSON.stringify(body) }),
  examTypes: () => request(baseURL+"/exam-types"),
  topics: (examTypeId) => request(baseURL+`/exam-types/${examTypeId}/topics`),
  aiGenerate: (body) => request(baseURL+"/study-plans/ai-generate", { method: "POST", body: JSON.stringify(body) }),
  plans: () => request(baseURL+"/study-plans"),
  plan: (id) => request(baseURL+`/study-plans/${id}`),
  tasks: (studyPlanId) => request(baseURL+`/tasks?studyPlanId=${encodeURIComponent(studyPlanId)}`),
  completeTask: (taskId) =>
    request(baseURL+`/tasks/${taskId}/complete`, { method: "PUT", body: JSON.stringify({}) }),
  startSession: (body) => request(baseURL+"/study-sessions/start", { method: "POST", body: JSON.stringify(body || {}) }),
  currentSession: () => request(baseURL+"/study-sessions/current"),
  sessionStatus: (sessionId, status) =>
    request(baseURL+`/study-sessions/${sessionId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  finishSession: (sessionId) =>
    request(baseURL+`/study-sessions/${sessionId}/finish`, { method: "PUT", body: JSON.stringify({}) }),
  updateMe: (body) => request(baseURL+"/users/me", { method: "PUT", body: JSON.stringify(body) }),
  changePassword: (body) =>
    request(baseURL+"/users/me/password", { method: "PUT", body: JSON.stringify(body) }),
  searchUsers: (q) => request(baseURL+`/users/search?q=${encodeURIComponent(q)}`),
  deleteUser: (userId) => request(baseURL+`/users/${userId}`, { method: "DELETE" }),
  analyticsWeekly: () => request(baseURL+"/analytics/weekly"),
  friends: () => request(baseURL+"/friends"),
  activeStudying: () => request(baseURL+"/friends/active-studying"),
  friendRequest: (body) => request(baseURL+"/friends/request", { method: "POST", body: JSON.stringify(body) }),
  acceptFriend: (id) => request(baseURL+`/friends/${id}/accept`, { method: "POST", body: JSON.stringify({}) }),
  rejectFriend: (id) => request(baseURL+`/friends/${id}/reject`, { method: "POST", body: JSON.stringify({}) }),
  removeFriend: (id) => request(baseURL+`/friends/${id}`, { method: "DELETE" }),
};
