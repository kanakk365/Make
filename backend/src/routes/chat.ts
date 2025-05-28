import express from "express"
import { chatWithLlm } from "../controllers/chat"


const router = express.Router()

router.post("/", async (req, res, next) => {
  try {
    await chatWithLlm(req, res)
  } catch (error) {
    next(error)
  }
})




export default router