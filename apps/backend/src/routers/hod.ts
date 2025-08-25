import { Router } from "express";
import hodMiddleware from "src/middleware/authHod.js";

const hodRouter = Router();

hodRouter.get("/signupLists", hodMiddleware, async (req, res) => {
    
    res.json({ message: "HOD Signup Lists" });
})

export default hodRouter;