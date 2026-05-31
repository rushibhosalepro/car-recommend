import express from "express";
import cors from "cors";
import { runAgent } from "./agent/runAgent";
const app = express();

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

app.post("/api/recommend", async (req, res) => {
  try {
    const body = req.body;
    const { context } = body;
    console.log(context);

    const response = await runAgent(context);
    return res.json({ succes: true, data: response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
app.listen(Number(PORT), () => console.log(`server runnning at ${PORT}`));
