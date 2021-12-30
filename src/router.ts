import express from "express";

import generalController from "./controllers/general";
import clientController from "./controllers/clients.controller";

const router = express.Router();

router.get("/", generalController.home);
router.get("/clients", clientController.list);

export default router;
