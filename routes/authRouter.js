import express from "express";

import authControllers from "../controllers/authControllers.js";

import validateBody from "../helpers/validateBody.js";

import {
  userRegisterSchema,
  userLoginSchema,
  userEmailSchema,
} from "../schemas/usersSchemas.js";

import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  upload.single("avatarURL"),
  validateBody(userRegisterSchema),
  authControllers.register
);

authRouter.get("/verify/:verificationToken", authControllers.verify)

authRouter.post("/verify", validateBody(userEmailSchema), authControllers.resendVerify)

authRouter.post("/login", validateBody(userLoginSchema), authControllers.login);

authRouter.get("/current", authenticate, authControllers.getCurrent);

authRouter.post("/logout", authenticate, authControllers.logout);

authRouter.patch(
  "/avatars",
  upload.single("avatarURL"),
  authenticate,
  authControllers.updateAvatar
);

export default authRouter;
