"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productRouter = (0, express_1.Router)();
// Example GET endpoint for policies
productRouter.get("/", (req, res) => {
    res.send("Product route works!");
});
// Add more policy-related endpoints here
exports.default = productRouter;
