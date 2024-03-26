import jwt from "jsonwebtoken";

import * as authServices from "../services/authServices.js";

import HttpError from "../helpers/HttpError.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";



const register = async (req, res) => {
  const { email } = req.body;
  const user = await authServices.findUser({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const newUser = await authServices.register(req.body);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await authServices.findUser({ email });
  if (!user) {
    throw HttpError(401, "Email or password valid");
  }
  const comparePassword = await authServices.validatePassword(
    password,
    user.password
  );
  if (!comparePassword) {
    throw HttpError(401, "Email or password is wrong");
  }

  const { _id: id } = user;

  const payload = {
    id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await authServices.updateUser({ _id: id }, { token });

  res.json({
    token: token,
    user: { email: user.email, subscription: user.subscription },
  });
};

const getCurrent = async (req, res) => {
  const { subscription, email } = req.user;

  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await authServices.updateUser({ _id }, { token: "" });

 
  res.status(204).json()
};





export default {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
};
