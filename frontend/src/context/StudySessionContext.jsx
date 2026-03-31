import { createContext, useContext, useMemo, useState, useCallback } from "react";

const StudySessionContext = createContext(null);

export function StudySessionProvider({ children }) {
  const [liveFriends, setLiveFriends] = useState({});

  const upsertFriendPresence = useCallback((userId, payload) => {
    setLiveFriends((prev) => ({ ...prev, [userId]: { ...payload, updatedAt: Date.now() } }));
  }, []);

  const clearFriendPresence = useCallback((userId) => {
    setLiveFriends((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      liveFriends,
      upsertFriendPresence,
      clearFriendPresence,
    }),
    [liveFriends, upsertFriendPresence, clearFriendPresence]
  );

  return <StudySessionContext.Provider value={value}>{children}</StudySessionContext.Provider>;
}

export function useStudySessionContext() {
  const ctx = useContext(StudySessionContext);
  if (!ctx) throw new Error("StudySessionProvider gerekli");
  return ctx;
}
