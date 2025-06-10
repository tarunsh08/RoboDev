import 'dotenv/config.js';
import app from "./app.js";
import http from "http";

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

