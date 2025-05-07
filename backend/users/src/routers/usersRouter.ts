import { Router } from "express";
import UsersService from "../service/UsersService.js";

const router = Router();

/**
 * @openapi
 * /users/api/v1/test:
 *   get:
 *     description: This is just for testing service is running and available
 *     responses:
 *       200:
 *         description: Returns a string
 */
router.get("/users/api/v1/test", (req, res) => {
    console.log("HElLO ACTUALLY CALLED");
    res.status(200).send({ data: "OK WOW FORM USER SERVICE" });
})

/**
 * @openapi
 * /users/auth/api/v1/role:
 *   post:
 *     description: Get the role of signed in user - either 'USER' or 'ADMIN'
 *     responses:
 *       200:
 *         description: Returns the user's role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   type: string
 *       500:
 *         description: No role was found for the user
 */
router.get("/users/auth/api/v1/role", async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];

        if (!userId || typeof userId !== 'string') {
            res.status(401).json({ data: "Missing userid - unauthorized" });
            return;
        }

        const role = await UsersService.getUserRoleById(userId);
        res.status(200).json({ role });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

// No swagger docs for this since its only callable for auth-gatekeeper
router.post("/internal/users/api/v1/role", async (req, res) => {
    const { userId } = req.body;
    try {
        const role = await UsersService.getUserRoleById(userId);
        res.status(200).json({ role });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

/**
 * @openapi
 * /users/api/count/users:
 *   get:
 *     description: Count the number of users
 *     responses:
 *       200:
 *         description: Returns the count of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: integer
 */
router.get("/api/count/users", async (req, res) => {
    try {
        const response = await UsersService.count();
        res.status(200).json({ data: response });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});


/**
 * @openapi
 * /users/api/v1/email/{email}:
 *   get:
 *     description: Get user by email
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         description: The email of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal Server Error
 */
router.get("/users/api/v1/email/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const user = await UsersService.findByEmail(email);
        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

/**
 * @openapi
 * /users/api/v1/{id}:
 *   get:
 *     description: Get user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal Server Error
 */
router.get("/users/api/v1/:id", async (req, res) => {
    const { id } = req.params; // Extract the ID from the request parameters
    try {
        const user = await UsersService.findOne(id);
        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

export default router;