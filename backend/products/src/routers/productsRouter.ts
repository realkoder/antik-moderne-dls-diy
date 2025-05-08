import { Router } from "express";
import { Role } from '@realkoder/antik-moderne-shared-types'
import PosterService from "../service/PosterService.js";

const router = Router();

/**
 * @openapi
 * /products/api/v1/healt:
 *   get:
 *     description: Just for testing service is running and available
 *     responses:
 *       200:
 *         description: Returns a string
 */
router.get('/products/api/v1/health', (req, res) => {
    res.send({ data: 'OK' });
});

/**
 * @openapi
 * /products/api/v1/posters:
 *   get:
 *     description: Get all posters
 *     responses:
 *       200:
 *         description: Returns a list of posters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posters:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal Server Error
 */
router.get('/products/api/v1/posters', async (req, res) => {
    try {
        const posters = await PosterService.findAll();
        res.json({ posters });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /products/api/v1/posters/{posterId}:
 *   get:
 *     description: Get a poster by ID
 *     parameters:
 *       - name: posterId
 *         in: path
 *         required: true
 *         description: The ID of the poster
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the poster data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 poster:
 *                   type: object
 *       204:
 *         description: No content if poster not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/products/api/v1/posters/:posterId', async (req, res) => {
    const { posterId } = req.params;

    try {
        const poster = await PosterService.findOne(Number(posterId));

        if (!poster) {
            // throw APIError.internal("Error getting poster data based on ID");
            res.status(204).send({ message: "Error getting poster data based on ID" });
            return;
        }

        res.json({ poster });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /products/auth/api/v1/posters:
 *   post:
 *     description: Create a new poster (ADMIN ONLY)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               posterCreate:
 *                 type: object
 *                 description: The poster data to create
 *     responses:
 *       201:
 *         description: Returns the list of posters after creation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posters:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized if the user does not have the required role
 *       500:
 *         description: Internal Server Error
 */
router.post('/products/auth/api/v1/posters', async (req, res) => {
    const role = req.headers['x-user-role'];
    const { posterCreate } = req.body;


    try {
        if (!role || role !== Role.ADMIN) {
            // throw APIError.permissionDenied("You don't have the needed ROLE for this action");
            res.status(401).send({ message: "You don't have the needed ROLE for this action" });
            return;
        }

        await PosterService.create(posterCreate);
        const posters = await PosterService.findAll();

        res.status(201).json({ posters });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /products/auth/api/v1/posters/{posterId}:
 *   put:
 *     description: Update a poster by ID (ADMIN ONLY)
 *     parameters:
 *       - name: posterId
 *         in: path
 *         required: true
 *         description: The ID of the poster to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               posterUpdate:
 *                 type: object
 *                 description: The updated poster data
 *     responses:
 *       200:
 *         description: Returns the list of posters after update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posters:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized if the user does not have the required role
 *       500:
 *         description: Internal Server Error
 */
router.put('/products/auth/api/v1/posters/:posterId', async (req, res) => {
    const role = req.headers['x-user-role'];
    const { posterId } = req.params;
    const { posterUpdate } = req.body;

    try {
        if (!role || role !== Role.ADMIN) {
            // throw APIError.permissionDenied("You don't have the needed ROLE for this action");
            res.status(401).send({ message: "You don't have the needed ROLE for this action" });
            return;
        }

        await PosterService.update(Number(posterId), posterUpdate);
        const posters = await PosterService.findAll();

        res.json({ posters });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
});

/**
 * @openapi
 * /products/auth/api/v1/posters/{posterId}:
 *   delete:
 *     description: Delete a poster by ID (ADMIN ONLY)
 *     parameters:
 *       - name: posterId
 *         in: path
 *         required: true
 *         description: The ID of the poster to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the list of posters after deletion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posters:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized if the user does not have the required role
 *       500:
 *         description: Internal Server Error
 */
router.delete('/products/auth/api/posters/:posterId', async (req, res) => {
    const { posterId } = req.params;
    const role = req.headers['x-user-role'];

    try {

        if (!role || role !== Role.ADMIN) {
            // throw APIError.permissionDenied("You don't have the needed ROLE for this action");
            res.status(401).send({ message: "You don't have the needed ROLE for this action" });
            return;
        }

        await PosterService.delete(Number(posterId));
        const posters = await PosterService.findAll();

        res.json({ posters });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
});

export default router;