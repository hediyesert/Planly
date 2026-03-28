const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getJwtSecret = () => process.env.JWT_SECRET || "dev_jwt_secret_change_me";

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

const getAuthUser = async (req) => {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  const payload = jwt.verify(token, getJwtSecret());
  const user = await User.findById(payload.sub);
  return user || null;
};

const ensureLiveSession = (user) => {
  if (!user.liveSession) {
    user.liveSession = {
      status: "idle",
      elapsedMs: 0,
      runningSince: null,
      updatedAt: new Date(),
    };
  }
};

exports.getMySession = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ message: "Kimlik doğrulanamadı" });
    ensureLiveSession(user);
    return res.json({ session: user.liveSession });
  } catch (err) {
    return res.status(500).json({ message: "Oturum alınamadı", error: err.message });
  }
};

exports.updateMySession = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ message: "Kimlik doğrulanamadı" });

    const { status, elapsedMs, runningSince } = req.body || {};
    const allowed = ["idle", "running", "paused"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Geçersiz durum" });
    }

    ensureLiveSession(user);
    user.liveSession.status = status;
    user.liveSession.elapsedMs = Math.max(0, Number(elapsedMs) || 0);
    user.liveSession.runningSince = runningSince ? new Date(runningSince) : null;
    user.liveSession.updatedAt = new Date();
    await user.save();

    return res.json({ message: "Oturum güncellendi", session: user.liveSession });
  } catch (err) {
    return res.status(500).json({ message: "Oturum güncellenemedi", error: err.message });
  }
};

exports.getFriendsSessions = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ message: "Kimlik doğrulanamadı" });

    const friendNames = user.friends || [];
    if (friendNames.length === 0) return res.json({ friends: [] });

    const regexList = friendNames.map((n) => new RegExp(`^${String(n).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"));
    const friends = await User.find({ username: { $in: regexList } })
      .select("username liveSession")
      .lean();

    const out = friends.map((f) => ({
      name: f.username,
      session: f.liveSession || { status: "idle", elapsedMs: 0, runningSince: null, updatedAt: null },
    }));

    return res.json({ friends: out });
  } catch (err) {
    return res.status(500).json({ message: "Arkadaş oturumları alınamadı", error: err.message });
  }
};

