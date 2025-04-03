import { Router } from "express";
import { handleFormSubmission } from "../controllers/tutorat.controller";

const router = Router();

router.post("/submit", handleFormSubmission);
export const tutoratRoutes = router;
