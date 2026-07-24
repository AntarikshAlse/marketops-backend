import { Application } from "./application.js";


const app = new Application();

app.start();

// Handles Ctrl+C, Docker stop, Railway, Render, Kubernetes, etc.
process.on('SIGINT', () => {
    console.log('\nGracefully shutting down...');
    app.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nGracefully shutting down...');
    app.stop();
    process.exit(0);
});