import { Router, type IRouter } from "express";
import healthRouter from "./health";
import businessesRouter from "./businesses";
import availabilityRouter from "./availability";
import appointmentsRouter from "./appointments";
import dashboardRouter from "./dashboard";
import chatRouter from "./chat";
import openaiRouter from "./openai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(businessesRouter);
router.use(availabilityRouter);
router.use(appointmentsRouter);
router.use(dashboardRouter);
router.use(chatRouter);
router.use(openaiRouter);

export default router;
