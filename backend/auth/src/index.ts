import express from "express";
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';


const app = express();
const PORT = process.env.PORT ?? 3001;

const corsOptions = {
    // origin: ['http://localhost', 'https://antik-moderne.realkoder.com'],
    origin: ['https://antik-moderne.realkoder.com'],
};

app.use(cors(corsOptions));

const SERVICES = {
    AUTH: 'http://localhost:3001',
    USERS: 'http://localhost:3002',
    PRODUCTS: 'http://localhost:3003'
};

app.use((req, res, next) => {
    try {

        // Validate token through Auth Service
        if (req.path.split("/")[2] === "auth") {
            console.log("OKAY SICK!!");
        }

        //   if (!isValid) {
        //     return res.status(401).json({ error: 'Unauthorized' });
        //   }

        // Determine target service
        let target = '';
        if (req.path.startsWith('/users')) target = SERVICES.USERS;
        if (req.path.startsWith('/products')) target = SERVICES.PRODUCTS;

        if (!target) {
            res.status(404).send('Not Found');
            return;
        }

        // Forward to target service
        createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: { [`^/${target.split('/').pop()}`]: '' }
        })(req, res, next);

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get("/", (req, res) => {
    res.status(200).send({ data: "OK" });
})

app.listen(PORT, () => console.log(`Express server instantiated PORT ${PORT}`));
