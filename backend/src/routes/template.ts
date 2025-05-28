import express from "express"
import { findTemplate } from "../controllers/template"

const router = express.Router()

router.post("/", async (req, res, next) => {
  try {
	await findTemplate(req, res);
  } catch (error) {
	next(error);
  }
})





export default router