import jwt from "jsonwebtoken";
import fs from "fs/promises";
import gravatar from "gravatar";
import path from "path";
import Jimp from "jimp";
import { nanoid } from "nanoid";

import * as authServices from "../services/authServices.js";

import HttpError from "../helpers/HttpError.js";

import sendEmail from "../helpers/sendEmail.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";

const { JWT_SECRET, BASE_URL } = process.env;

const avatarPath = path.resolve("public", "avatars");

const register = async (req, res) => {
  const { email } = req.body;

  const user = await authServices.findUser({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const avatarURL = gravatar.url(email);

  const verificationToken = nanoid();

  const newUser = await authServices.register({
    ...req.body,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify Email",
    html: `<a href="${BASE_URL}/api/users/verify/${verificationToken}" target="_blank" >Click to verify</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await authServices.findUser({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await authServices.updateUser({ _id: user._id }, { verify: true, verificationToken: "null" })
  
  res.json({
    message: "Verification successful",
  });
};

const resendVerify = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({message: "Missing required field: email"})
  }

  const user = await authServices.findUser({ email });
  if (!user) {
    throw HttpError(404, "Email not found")
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify Email",
    html: `<a href="${BASE_URL}/api/users/verify/${user.verificationToken}" target="_blank" >Click to verify</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verification email sent",
  });

}

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await authServices.findUser({ email });
  if (!user) {
    throw HttpError(401, "Email or password valid");
  }
  if (!user.verify) {
    throw HttpError(401, "Email not verified");
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

  res.status(204).json();
};

const updateAvatar = async (req, res) => {
  if (!req.file) {
    throw HttpError(400, "Avatar file is required");
  }
  const { path: oldPath, filename } = req.file;

  const image = await Jimp.read(oldPath);
  await image.resize(250, 250).writeAsync(oldPath);

  const newPath = path.join(avatarPath, filename);
  await fs.rename(oldPath, newPath);

  const { _id } = req.user;
  await authServices.updateUser({ _id }, { avatarURL: `/avatars/${filename}` });

  res.status(200).json({ avatarURL: `/avatars/${filename}` });
};

export default {
  register: ctrlWrapper(register),
  verify: ctrlWrapper(verify),
  resendVerify: ctrlWrapper(resendVerify),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  updateAvatar: ctrlWrapper(updateAvatar),
};
