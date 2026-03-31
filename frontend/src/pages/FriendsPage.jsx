import { useCallback, useEffect, useState } from "react";
import { api } from "../api/apiClient";
import { PageHeader } from "../components/common/PageHeader";
import { ActiveFriendsList } from "../components/studyRoom/ActiveFriendsList";
import { createSocket } from "../socket";

export default function FriendsPage() {
  const [data, setData] = useState({ friends: [], pendingIncoming: [], pendingOutgoing: [] });
  const [active, setActive] = useState([]);
  const [email, setEmail] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [searchHits, setSearchHits] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.friends();
      setData({
        friends: res.friends || [],
        pendingIncoming: res.pendingIncoming || [],
        pendingOutgoing: res.pendingOutgoing || [],
      });
    } catch (e) {
      setError(e.message || "Liste alınamadı");
    }
    try {
      const a = await api.activeStudying();
      setActive(a);
    } catch {
      setActive([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const s = createSocket();
    if (!s) return undefined;
    s.connect();
    const refresh = () => load();
    s.on("friend:study", refresh);
    return () => {
      s.off("friend:study", refresh);
      s.disconnect();
    };
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      const q = searchQ.trim();
      if (q.length < 2) {
        setSearchHits([]);
        return;
      }
      try {
        const hits = await api.searchUsers(q);
        if (!cancelled) setSearchHits(hits);
      } catch {
        if (!cancelled) setSearchHits([]);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchQ]);

  async function sendRequest(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.friendRequest({ email });
      setEmail("");
      await load();
    } catch (err) {
      setError(err.message || "İstek gönderilemedi");
    } finally {
      setLoading(false);
    }
  }

  async function sendRequestToUser(hit) {
    setError("");
    setLoading(true);
    try {
      await api.friendRequest({ email: hit.email });
      setSearchQ("");
      setSearchHits([]);
      await load();
    } catch (err) {
      setError(err.message || "İstek gönderilemedi");
    } finally {
      setLoading(false);
    }
  }

  async function accept(id) {
    setLoading(true);
    try {
      await api.acceptFriend(id);
      await load();
    } catch (err) {
      setError(err.message || "Kabul edilemedi");
    } finally {
      setLoading(false);
    }
  }

  async function reject(id) {
    setLoading(true);
    try {
      await api.rejectFriend(id);
      await load();
    } catch (err) {
      setError(err.message || "Reddedilemedi");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    setLoading(true);
    try {
      await api.removeFriend(id);
      await load();
    } catch (err) {
      setError(err.message || "Silinemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Arkadaşlar"
        subtitle="Kullanıcı ara, e-posta ile istek gönder; gelen ve giden istekleri yönet."
      />
      {error ? <p className="error">{error}</p> : null}

      <section className="mt">
        <h3>Kullanıcı ara</h3>
        <input
          type="search"
          placeholder="kullanıcı adı veya e-posta (en az 2 karakter)"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
        />
        {searchHits.length ? (
          <ul className="search-hits">
            {searchHits.map((h) => (
              <li key={h.id}>
                <strong>{h.username}</strong> <span className="muted small">{h.email}</span>
                <button type="button" className="btn small" disabled={loading} onClick={() => sendRequestToUser(h)}>
                  İstek gönder
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <form className="row gap wrap mt" onSubmit={sendRequest}>
        <label className="grow">
          E-posta ile istek
          <input
            type="email"
            placeholder="arkadaş e-postası"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button type="submit" className="btn primary" disabled={loading || !email}>
          Gönder
        </button>
      </form>

      <section className="mt">
        <h3>Gelen istekler</h3>
        {data.pendingIncoming?.length ? (
          <ul>
            {data.pendingIncoming.map((p) => (
              <li key={p._id}>
                {p.fromUser?.username} ({p.fromUser?.email})
                <button type="button" className="btn small" disabled={loading} onClick={() => accept(p._id)}>
                  Kabul
                </button>
                <button type="button" className="btn small" disabled={loading} onClick={() => reject(p._id)}>
                  Reddet
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Bekleyen istek yok.</p>
        )}
      </section>

      <section className="mt">
        <h3>Giden istekler</h3>
        {data.pendingOutgoing?.length ? (
          <ul>
            {data.pendingOutgoing.map((p) => (
              <li key={p._id}>
                {p.toUser?.username} ({p.toUser?.email})
                <button type="button" className="btn small" disabled={loading} onClick={() => remove(p._id)}>
                  İptal
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Giden bekleyen istek yok.</p>
        )}
      </section>

      <section className="mt">
        <h3>Arkadaş listesi</h3>
        <ul>
          {data.friends?.map((f) => (
            <li key={f.friendshipId}>
              {f.username}
              <button type="button" className="btn small danger-outline" disabled={loading} onClick={() => remove(f.friendshipId)}>
                Kaldır
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt">
        <h3>Şu an çalışanlar</h3>
        <ActiveFriendsList entries={active} />
      </section>
    </div>
  );
}
