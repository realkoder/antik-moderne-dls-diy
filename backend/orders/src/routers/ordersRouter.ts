import { Router } from "express";
import OrdersService from "../service/OrdersService.js";

const router = Router();

/**
 * @openapi
 * /orders/api/v1/health:
 *   get:
 *     description: Just for testing service is running and available
 *     responses:
 *       200:
 *         description: Returns a string
 */
router.get('/orders/api/v1/health', (req, res) => {
    res.json({ data: 'OK' });
});


/**
 * @openapi
 * /orders/auth/api/v1/orders:
 *   get:
 *     description: Get all orders for the signed-in user
 *     responses:
 *       200:
 *         description: Returns a list of orders for given signed in user
 *       500:
 *         description: Internal Server Error
 */
router.get('/orders/auth/api/v1/orders', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;

        if (!userId) {
            res.status(403).json({ message: "UserId is missing!" });
            return;
        }

        const orders = await OrdersService.findAllUsersOrders(userId);
        res.json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


/**
 * @openapi
 * /orders/auth/api/v1/orders/{orderId}:
 *   get:
 *     description: Get a single order by ID for the signed-in user
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: The ID of the order
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the order data
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/orders/auth/api/v1/orders/:orderId', async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await OrdersService.findOne(Number(orderId));
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        res.json({ order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
});


/**
 * @openapi
 * /orders/auth/api/v1/orders:
 *   post:
 *     description: Create a new order for the signed-in user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderCreate:
 *                 type: object
 *                 description: The order data to create
 *     responses:
 *       201:
 *         description: Order created
 *       401:
 *         description: Unauthorized if the user is not signed in
 *       500:
 *         description: Internal Server Error
 */
router.post('/orders/auth/api/v1/orders', async (req, res) => {
    const userId = req.headers['x-user-id'] as string;
    const { orderCreate } = req.body;

    console.log("LOOOOK", userId);
    res.json({ data: "Heck yir" });
    try {
        //     if (!userId) {
        //         res.status(403).json({ message: "Missing user ID" });
        //         return;
        //     }
        //     const response = await OrdersService.create(userId, orderCreate);
        //     if (response.success) {
        //         res.status(201).json({ message: response.message });
        //     } else {
        //         res.status(400).json({ message: response.message });
        //     }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
});

export default router;