import Router, { Response, Request } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { getAuth } from '@clerk/express';
import { CustomIncomingMessage, CustomRequest } from '../types/proxyRouting.interfaces.js';

const router = Router();

const SERVICES = {
    BASKETS: 'http://baskets-service:3002',
    PRODUCTS: 'http://products-service:3004',
    USERS: 'http://users-service:3005',
    ORDERS: 'http://orders-service:3006'
};

// Create proxy middlewares during initatialization instead of per-request
const createServiceProxy = (target: string) => {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req: CustomIncomingMessage, res) => {
                const auth = req.authContext || {};  // Set in main middleware
                if (auth.userId) {
                    proxyReq.setHeader('x-user-id', auth.userId);
                }
                if (auth.userRole) {
                    proxyReq.setHeader('x-user-role', auth.userRole);
                }
                fixRequestBody(proxyReq, req);
            },
            error: (err, req, res: Response) => {
                console.error('Proxy error:', err);
                res.status(502).json({ error: 'Bad Gateway' });
            }
        }
    });
};

// Create proxies only once during initialization
const serviceProxies = {
    baskets: createServiceProxy(SERVICES.BASKETS),
    products: createServiceProxy(SERVICES.PRODUCTS),
    users: createServiceProxy(SERVICES.USERS),
    orders: createServiceProxy(SERVICES.ORDERS)
};

router.use(async (req: CustomRequest, res, next) => {
    try {
        console.log("Request Method:", req.method);
        console.log("Request Path:", req.path);

        // Determine target service base-url
        let proxy;
        if (req.path.startsWith('/baskets')) proxy = serviceProxies.baskets;
        if (req.path.startsWith('/products')) proxy = serviceProxies.products;
        if (req.path.startsWith('/users')) proxy = serviceProxies.users;
        if (req.path.startsWith('/orders')) proxy = serviceProxies.orders;

        // If Prom metrics gets requested parse the request furhter on
        console.log("REQ PATH", req.path);
        if (req.path === "/metrics") {
            next();
            return; // Important with this return since this middleware has to be quited
        }

        if (!proxy) {
            res.status(404).send('Not Found');
            return;
        }

        // Authorization logic
        if (req.path.split("/")[2] === "auth") {
            const authResult = await authorize(req);
            req.authContext = {
                userId: authResult.userId,
                userRole: authResult.userRole
            };
        }

        proxy(req, res, next);

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function authorize(req: Request) {
    try {
        const { userId } = getAuth(req);

        if (userId) {
            const userRoleRes = await fetch(SERVICES.USERS + "/internal/users/api/v1/role", {
                method: "POST",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId })
            });

            if (userRoleRes.ok) {
                const userRole = await userRoleRes.json();
                return { userId, userRole: userRole.role };
            }
        }
    } catch (e) {
        console.log("Error with AUTH CHECK", e);
    }
    return { userId: undefined, userRole: 'USER' };
}

export default router;