const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET || "dev_jwt_secret_change_me";

const createToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
};

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

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email zaten kayıtlı" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = createToken(user);
    res.json({
      message: "Kayıt başarılı",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        currentPlan: user.currentPlan || null,
      },
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Şifre yanlış" });
    }

    const token = createToken(user);
    res.json({
      message: "Giriş başarılı",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        currentPlan: user.currentPlan || null,
      },
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ME (token doğrulama)
exports.me = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ message: "Kimlik doğrulanamadı" });

    const payload = jwt.verify(token, getJwtSecret());
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "Kimlik doğrulama başarısız" });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        friends: user.friends || [],
        currentPlan: user.currentPlan || null,
      },
    });
  } catch (err) {
    return res.status(401).json({ message: "Kimlik doğrulama geçersiz" });
  }
};

// UPDATE PROFILE (username/email)
exports.updateMe = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ message: "Kimlik doğrulanamadı" });

    const { username, email } = req.body || {};

    if (username && String(username).trim().length < 2) {
      return res.status(400).json({ message: "Kullanıcı adı çok kısa" });
    }

    if (email && String(email).trim().length < 5) {
      return res.status(400).json({ message: "E-posta geçersiz" });
    }

    // Email değişecekse benzersizliği kontrol et.
    if (email && email !== user.email) {
      const existing = await User.findOne({ email: email.trim() });
      if (existing) return res.status(400).json({ message: "Bu e-posta zaten kayıtlı" });
      user.email = email.trim();
    }

    if (username) user.username = username.trim();

    await user.save();
    const token = createToken(user);

    res.json({
      message: "Profil güncellendi",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        friends: user.friends || [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Profil güncellenemedi", error: err.message });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ message: "Kimlik doğrulanamadı" });

    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Mevcut ve yeni şifre zorunlu" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mevcut şifre yanlış" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // Token'ı yenile
    const token = createToken(user);

    res.json({ message: "Şifre güncellendi", token });
  } catch (err) {
    res.status(500).json({ message: "Şifre güncellenemedi", error: err.message });
  }
};

// DELETE ACCOUNT
exports.deleteMe = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ message: "Kimlik doğrulanamadı" });

    await User.findByIdAndDelete(user._id);
    res.json({ message: "Hesap silindi" });
  } catch (err) {
    res.status(500).json({ message: "Hesap silinemedi", error: err.message });
  }
};

// FRIENDS
exports.addFriend = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ message: "Kimlik doğrulanamadı" });

    const { friendName } = req.body || {};

    const name = String(friendName || "").trim();
    if (!name) return res.status(400).json({ message: "Arkadaş adı zorunlu" });

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const friendUsernameRegex = new RegExp(`^${escapeRegex(name)}$`, "i");

    // Veritabanında gerçekten var mı kontrol et.
    const friendUser = await User.findOne({ username: friendUsernameRegex });
    if (!friendUser) {
      return res.status(404).json({ message: "Arkadaş bulunamadı: Bu kullanıcı adı kayıtlı değil." });
    }

    if (friendUser._id.toString() === user._id.toString()) {
      return res.status(400).json({ message: "Kendini arkadaş olarak ekleyemezsin." });
    }

    const already = (user.friends || []).some(
      (f) => String(f).toLowerCase() === String(friendUser.username).toLowerCase()
    );
    if (already) {
      return res.status(200).json({ message: "Zaten ekli", friends: user.friends || [] });
    }

    // Saklanan isim: DB'deki gerçek username.
    user.friends = [...(user.friends || []), friendUser.username];
    await user.save();

    res.json({ message: "Arkadaş eklendi", friends: user.friends || [] });
  } catch (err) {
    res.status(500).json({ message: "Arkadaş eklenemedi", error: err.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ message: "Kimlik doğrulanamadı" });

    const { friendName } = req.params || {};
    const name = String(friendName || "").trim();
    if (!name) return res.status(400).json({ message: "Arkadaş adı zorunlu" });

    const normalized = name.toLowerCase();
    user.friends = (user.friends || []).filter((f) => String(f).toLowerCase() !== normalized);
    await user.save();

    res.json({ message: "Arkadaş çıkarıldı", friends: user.friends || [] });
  } catch (err) {
    res.status(500).json({ message: "Arkadaş çıkarılamadı", error: err.message });
  }
};

// SAVE CURRENT PLAN
exports.saveCurrentPlan = async (req, res) => {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ message: "Kimlik doğrulanamadı" });

    const { plan } = req.body || {};
    if (!plan || typeof plan !== "object") {
      return res.status(400).json({ message: "Geçerli plan verisi zorunlu" });
    }

    user.currentPlan = plan;
    await user.save();

    res.json({ message: "Plan kaydedildi" });
  } catch (err) {
    res.status(500).json({ message: "Plan kaydedilemedi", error: err.message });
  }
};