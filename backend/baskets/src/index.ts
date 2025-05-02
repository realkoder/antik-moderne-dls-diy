import express from "express";
import BasketsService from "./service/BasketsService";

const app = express();
const PORT = process.env.PORT ?? 3002;

app.use(express.json());

/**
 * Endpoint for receiving the basket.
 * It checks for the user ID using `getAuthData()`.
 * If the user is not signed in, a GUID is expected for idempotent handling of basket logic.
 * 
 * @param {Object} params - The parameters for the request.
 * @param {string} [params.guid] - The GUID of the basket, which is optional.
 * @returns {Promise<{ basket: BasketDto }>} The basket data.
 * 
 * ### @example
 * ```javascript
 * // Example request
 * GET /basket?guid=your-guid-here
 * ```
 */
app.get('/baskets/auth/api/v1/baskets', async (req, res) => {
    const { guid } = req.query as { guid?: string }; // Get guid from query parameters
    const { userId } = req.body.userId;

    console.log("HERE IS GUID AND USERID", guid, userId);
    if (!userId && !guid) {
        res.status(400).json({ message: "Either userId or guid must be provided" });
        return;
    }

    try {
        const basket = await BasketsService.findBasket({ userId, guid });

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
 * Endpoint for creating a new basket.
 * 
 * It checks for the user ID using `getAuthData()`.
 * If the user is not signed in, a GUID is expected for idempotent handling of basket logic.
 * 
 * @param {Object} params - The parameters for the request.
 * @param {string} [params.guid] - The GUID of the basket. This is optional and is used for identifying the basket 
 *                                  when the user is not authenticated.
 * @returns {Promise<{ basket: BasketDto }>} A promise that resolves to the created basket data.
 * 
 * ### @example
 * ```javascript
 * // Example request to create a new basket
 * // POST /basket
 * // Content-Type: application/json
 * 
 * {
 *   "guid": "your-guid-here" // Optional GUID for the basket
 * }
 * ```
 * 
 * ### @example
 *  ```javascript
 * // Example response for a successful basket creation
 * {
 *   "basket": {
 *     "id": "new-basket-id",
 *     "items": [] // Initially empty basket
 *   }
 * }
 * ```
 * 
 * @throws {APIError.invalidArgument} If neither userId nor guid is provided.
 */
app.post('/baskets/auth/api/v1/baskets', async (req, res) => {
    const { guid, userId } = req.body; // Get guid from the request body

    if (!userId && !guid) {
        res.status(400).json({ message: "Either userId or guid must be provided" });
        return;
    }

    try {
        const basket = await BasketsService.createBasket({ userId, guid });

        res.status(201).json({ basket }); // Respond with the created basket
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
});

/**
 * Endpoint for adding an item to the client basket.
 * 
 * It checks for the user ID using `getAuthData()`.
 * If the user is not signed in, a GUID is expected for idempotent handling of basket logic.
 * 
 * @param {Object} params - The parameters for the request.
 * @param {string} [params.guid] - The GUID of the basket. This is optional and is used for identifying the basket 
 *                                  when the user is not authenticated.
 * @param {BasketItemCreate} params.basketItemCreate - The item to be added to the basket, containing details such as 
 *                                                     item ID and quantity.
 * @returns {Promise<{ basket: BasketDto }>} A promise that resolves to the updated basket data after the item is added.
 * 
 * @example
 * ```javascript
 * // Example request to add an item to the basket
 * POST /basket/add-item
 * Content-Type: application/json
 * 
 * {
 *   "guid": "your-guid-here", // Optional GUID for the basket
 *   "basketItemCreate": {
 *     "itemId": "item-id",     // ID of the item to add
 *     "quantity": 1            // Quantity of the item
 *   }
 * }
 * ```
 * 
 * @example
 * ```javascript
 * // Example response for a successful item addition
 * {
 *   "basket": {
 *     "id": "basket-id",
 *     "items": [
 *       {
 *         "itemId": "item-id",
 *         "quantity": 1
 *       }
 *     ]
 *   }
 * }
 * ```
 * 
 * @throws {APIError.invalidArgument} If neither userId nor guid is provided.
 */
app.post('/baskets/auth/api/v1/baskets/add-item', async (req, res) => {
    const { guid, basketItemCreate } = req.body; // Get guid and basketItemCreate from the request body
    const userId = req.body.userId;

    if (!userId && !guid) {
        res.status(400).json({ message: "Either userId or guid must be provided" });
        return;
    }

    try {
        const basket = await BasketsService.addItemToBasket({ userId, guid }, basketItemCreate);

        res.json({ basket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
});

/**
 * Endpoint for removing an item from the basket.
 * 
 * It checks for the user ID using `getAuthData()`.
 * If the user is not signed in, a GUID is expected for idempotent handling of basket logic.
 * 
 * @param {Object} params - The parameters for the request.
 * @param {string} [params.guid] - The GUID of the basket. This is optional and is used for identifying the basket 
 *                                  when the user is not authenticated.
 * @param {number} params.basketItemId - The ID of the item to be removed from the basket.
 * @returns {Promise<{ basket: BasketDto }>} A promise that resolves to the updated basket data after the item is removed.
 * 
 * @example
 * ```javascript
 * // Example request to remove an item from the basket
 * // DELETE /basket/remove-item
 * // Content-Type: application/json
 * 
 * {
 *   "guid": "your-guid-here", // Optional GUID for the basket
 *   "basketItemId": 123       // ID of the item to remove
 * }
 * ```
 * 
 * @example
 * ```javascript
 * // Example response for a successful item removal
 * {
 *   "basket": {
 *     "id": "basket-id",
 *     "items": [] // The item has been removed
 *   }
 * }
 * ```
 * 
 * @throws {APIError.invalidArgument} If neither userId nor guid is provided.
 */
app.delete('/baskets/auth/api/v1/baskets/remove-item', async (req, res) => {
    const { guid, basketItemId } = req.body; // Get guid and basketItemId from the request body
    const { userId } = req.body.userId;

    if (!userId && !guid) {
        res.status(400).json({ message: "Either userId or guid must be provided" });
        return;
    }

    try {
        const basket = await BasketsService.removeItemFromBasket({ userId, guid }, basketItemId);

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

app.listen(PORT, () => console.log(`baskets-service running at PORT ${PORT}`));
