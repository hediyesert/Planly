const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(409).json({ message: "Bu e-posta veya kullanıcı adı zaten kayıtlı" });
    }
    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);
    return res.status(201).json({
      token,
      user: user.toSafeJSON(),
    });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "E-posta veya şifre hatalı" });
    }
    const token = generateToken(user._id);
    return res.json({
      token,
      user: user.toSafeJSON(),
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login };
