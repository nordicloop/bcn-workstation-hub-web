import server from "./server";

const PORT = 3000;

async function startServer() {
    try {
        server.listen(PORT, () => {
            console.log("Server started on port", PORT);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

process.on("SIGTERM", async () => {
    server.close(() => {});
});

process.on("SIGINT", async () => {
    server.close(() => {});
});

startServer();
