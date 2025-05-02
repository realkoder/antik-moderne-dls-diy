import express from "express";
import PosterService from "./service/PosterService.js";
import { Role } from '@realkoder/antik-moderne-shared-types'

const app = express();
const PORT = process.env.PORT ?? 3004;

app.use(express.json());

app.get('/products/api/v1/posters', async (req, res) => {
    try {
        const posters = await PosterService.findAll();
        res.json({ posters });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/products/api/v1/posters/:posterId', async (req, res) => {
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

// Only admin can call this
app.post('/products/auth/api/v1/posters', async (req, res) => {
    const { posterCreate } = req.body;
    const { role } = req.body;

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

// Only admin can call this
app.put('/products/auth/api/v1/posters/:posterId', async (req, res) => {
    const { posterId } = req.params;
    const { posterUpdate, role } = req.body;

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

// Only admin can call this
app.delete('/products/auth/api/posters/:posterId', async (req, res) => {
    const { posterId } = req.params;
    const { role } = req.body;

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

app.listen(PORT, () => console.log(`products-service running at PORT ${PORT}`));
