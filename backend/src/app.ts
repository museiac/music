import express from "express";
import authRouter from "./modules/auth/auth.routes.js";

const app = express();

app.use(express.json());

app.get("/", (req,res)=>{
    res.json({
        message: "backend is running"
    });
});

app.use("/api/auth", authRouter);

export default app;