import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { Session } from '../models/session.js';

export const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  const existungUser = await User.findOne({ username });
  if (existungUser) {
    return next(createHttpError(400, 'Name in use!'));
  }

  // Хешуємо пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  // Створюємо користувача
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  // Створюємо нову сесію
  const newSession = await createSession(newUser._id);
  // Викликаємо, передаємо об'єкт відповіді та сесію
  setSessionCookies(res, newSession);

  res.status(201).json(newUser);
};

export const loginUser = async (req, res, next) => {
  const { username, email, password } = req.body;
  //username, - не обов'язково при вході
  // Перевіряємо чи користувач  існує
  const user = await User.findOne({ username, email });
  if (!user) {
    return next(createHttpError(401, 'User not found!'));
  }
  // Порівнюємо хеші паролів
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return next(createHttpError(401, 'Invalid credentials!'));
  }

  // Видаляємо стару сесію користувача
  await Session.deleteOne({ userId: user._id });
  // Створюємо нову сесію
  const newSession = await createSession(user._id);
  // Викликаємо, передаємо об'єкт відповіді та сесію
  setSessionCookies(res, newSession);

  res.status(200).json(user);
};

export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const refreshUserSession = async (req, res, next) => {
  const session = await Session.findOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  if (!session) {
    return next(createHttpError(401, 'Session not found'));
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    return next(createHttpError(401, 'Session token expired'));
  }

  await Session.deleteOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({
    message: 'Session refreshed',
  });
};
