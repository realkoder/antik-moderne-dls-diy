import { Router } from "express";
import BasketsService from "../service/BasketsService.js";

const router = Router();

/**
* @openapi
 * /baskets/api/v1/health:
 *   get:
 *     description: Just for testing service is running and available
 *     responses:
 *       200:
 *         description: Returns a string
 */
router.get('/baskets/api/v1/health', (req, res) => {
    res.json({ data: 'OK' });
});

/**
 * @openapi
 * /baskets/auth/api/v1/baskets:
 *   get:
 *     description: Get the basket for a user
 *     parameters:
 *       - in: query
 *         name: guid
 *         required: false
 *         schema:
 *           type: string
 *         description: The GUID of the basket for users not signed in, which is optional.
 *     responses:
 *       200:
 *         description: Returns the basket data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 basket:
 *                   type: object
 *       400:
 *         description: Bad Request if neither userId nor guid is provided
 *       404:
 *         description: Basket not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/baskets/auth/api/v1/baskets', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { guid } = req.query;

    if (!userId && !guid) {
        res.status(400).json({ message: "Either userId or guid must be provided" });
        return;
    }

    try {
        const basket = await BasketsService.findBasket({ userId: typeof userId === 'string' ? userId : undefined, guid: typeof guid === 'string' ? guid : '' });

        if (!basket) {
            res.status(404).json({ message: "Basket not found" });
            return;
        }

        res.json({ basket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /baskets/auth/api/v1/baskets:
 *   post:
 *     description: Create a new basket idempotent by either using GUID or USERID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guid:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Returns the created basket
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 basket:
 *                   type: object
 *       400:
 *         description: Bad Request if neither userId nor guid is provided
 *       500:
 *         description: Internal Server Error
 */
router.post('/baskets/auth/api/v1/baskets', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { guid } = req.body; // Get guid from the request body

    if (!userId && !guid) {
        res.status(400).json({ message: "Either userId or guid must be provided" });
        return;
    }

    try {
        const basket = await BasketsService.createBasket({ userId: typeof userId === 'string' ? userId : undefined, guid });

        res.status(201).json({ basket }); // Respond with the created basket
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /baskets/auth/api/v1/baskets/add-item:
 *   put:
 *     description: Add an item to the basket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guid:
 *                 type: string
 *               basketItemCreate:
 *                 type: object
 *                 properties:
 *                   itemId:
 *                     type: string
 *                   quantity:
 *                     type: integer
 *     responses:
 *       200:
 *         description: Returns the updated basket
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 basket:
 *                   type: object
 *       400:
 *         description: Bad Request if neither userId nor guid is provided
 *       500:
 *         description: Internal Server Error
 */
router.put('/baskets/auth/api/v1/baskets/add-item', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { guid, basketItemCreate } = req.body;

    if (!userId && !guid) {
        res.status(400).json({ message: "Either userId or guid must be provided" });
        return;
    }

    try {
        const basket = await BasketsService.addItemToBasket({ userId: typeof userId === 'string' ? userId : undefined, guid }, basketItemCreate);

        res.json({ basket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /baskets/auth/api/v1/baskets/remove-item:
 *   delete:
 *     description: Remove an item from the basket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guid:
 *                 type: string
 *               userId:
 *                 type: string
 *               basketItemId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Returns the updated basket
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 basket:
 *                   type: object
 *       400:
 *         description: Bad Request if neither userId nor guid is provided
 *       404:
 *         description: Basket not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/baskets/auth/api/v1/baskets/remove-item', async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { guid, basketItemId } = req.body;

    if (!userId && !guid) {
        res.status(400).json({ message: "Either userId or guid must be provided" });
        return;
    }

    try {
        const basket = await BasketsService.removeItemFromBasket({ userId: typeof userId === 'string' ? userId : undefined, guid }, basketItemId);

        if (!basket) {
            res.status(404).json({ message: "Basket not found" });
            return;
        }

        res.json({ basket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
});

export default router;