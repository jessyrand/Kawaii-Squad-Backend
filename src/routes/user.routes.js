import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getProfile, getStatus } from "../controllers/user.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/profile", getProfile);
router.get("/status", getStatus);

export default router;