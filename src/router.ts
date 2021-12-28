import express from "express";

import generalController from "./controllers/general";

const router = express.Router();

router.get("/", generalController.home);

export default router;
