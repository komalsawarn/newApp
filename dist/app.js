"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const policy_1 = __importDefault(require("./routes/policy"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
dotenv_1.default.config();
// Add this line before your routes
app.use(express_1.default.json());
app.use(errorHandler);
app.use("/policies", policy_1.default);
app.get("/", (req, res) => {
    res.send("Hello, TypeScript with Express!");
});
function errorHandler(err, req, res, next) {
    console.error("Global Error Handler:", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
    });
}
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
