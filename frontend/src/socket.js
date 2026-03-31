import { io } from "socket.io-client";
import { getToken } from "./utils/storage";

export function createSocket() {
  const token = getToken();
  if (!token) return null;
  return io({
    path: "/socket.io",
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: false,
  });
}
