import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dlRouter from "./dl";
import proxyRouter from "./proxy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dlRouter);
router.use(proxyRouter);

export default router;
