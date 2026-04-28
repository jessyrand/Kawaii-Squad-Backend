import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { createCin, getMyCin } from "../controllers/cin.controller.js";

const router = express.Router();

router.use(authenticate);

router.post("/", upload.single("cinPhoto"), createCin);

router.get("/", getMyCin);

export default router;
