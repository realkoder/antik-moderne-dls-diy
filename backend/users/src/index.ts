import express from "express";
import UserService from "./service/userService.js";
import { connectToRabbitMQ } from "./rabbitmqMessaging/config.js";

const app = express();
const PORT = process.env.PORT ?? 3002;

app.use(express.json());

app.get("/users/api/v1/test", (req, res) => {
    console.log("HElLO ACTUALLY CALLED");
    res.status(200).send({ data: "OK WOW FORM USER SERVICE" });
})

app.post("/users/auth/api/v1/role", async (req, res) => {
    try {
        const userId = req.body.userId;
        const role = await UserService.getUserRoleById(userId);
        res.status(200).json({ role });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

app.post("/internal/users/api/v1/role", async (req, res) => {
    const { userId } = req.body;
    try {
        const role = await UserService.getUserRoleById(userId);
        res.status(200).json({ role });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

app.get("/api/count/users", async (req, res) => {
    try {
        const response = await UserService.count();
        res.status(200).json({ data: response });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

app.get("/users/api/v1/email/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const user = await UserService.findByEmail(email);
        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

app.get("/users/api/v1/:id", async (req, res) => {
    const { id } = req.params; // Extract the ID from the request parameters
    try {
        const user = await UserService.findOne(id);
        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

connectToRabbitMQ();
app.listen(PORT, () => console.log(`user-service running at PORT ${PORT}`));
