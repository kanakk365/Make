import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import templateRouter from "./routes/template"
import chatRouter from "./routes/chat"

dotenv.config()

const app = express()

app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}))
app.use(express.json())


app.use("/api/template" , templateRouter )
app.use("/api/chat" , chatRouter)

app.listen(8000)