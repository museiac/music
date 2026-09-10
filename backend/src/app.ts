import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";
import planRoutes from "./modules/plan/plan.routes.js";

const app = express();

app.use(express.json());

app.get("/", (req,res)=>{
    res.json({
        message: "backend is running"
    });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/plan", planRoutes);

export default app;