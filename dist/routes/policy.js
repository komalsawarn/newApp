"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const policies_json_1 = __importDefault(require("../storageFiles/policies.json"));
const products_json_1 = __importDefault(require("../storageFiles/products.json"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// import { authenticateApiKey } from "../app"; // Import the API key middleware
const policyRouter = (0, express_1.Router)();
function authenticateApiKey(req, res, next) {
    console.log("API Key Middleware Triggered .....");
    const key = req.header("x-api-key");
    console.log("API Key:", process.env.API_KEY);
    if (key !== process.env.API_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
}
const typedPolicies = policies_json_1.default;
const typedProducts = products_json_1.default;
policyRouter.get("/dummy", (req, res) => {
    res.status(200).send("Dummy endpoint works!");
});
// Example GET endpoint for policies
policyRouter.get("/:id", (req, res) => {
    const policy = typedPolicies.find((p) => p.id === req.params.id);
    if (!policy) {
        return res.status(404).json({ error: "Policy not found" });
    }
    const product = typedProducts.find((prod) => prod.id === policy.productId);
    if (!product) {
        return res.status(500).json({ error: "Product not found for this policy" });
    }
    // Attach full product object
    const response = Object.assign(Object.assign({}, policy), { product });
    res.json(response);
    product;
});
policyRouter.get("/", (req, res) => {
    const { customerName } = req.query;
    if (!customerName) {
        return res.send("Missing Parameter: Customer name");
    }
    const filteredPolicies = typedPolicies.filter((p) => { var _a; return ((_a = p.customerName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === String(customerName).toLowerCase(); });
    const result = filteredPolicies.map((policy) => {
        const product = typedProducts.find((prod) => prod.id === policy.productId);
        return Object.assign(Object.assign({}, policy), { product });
    });
    if (result.length === 0) {
        return res
            .status(404)
            .json({ error: "No policies found for this customer" });
    }
    res.json(result);
});
policyRouter.post("/", authenticateApiKey, (req, res) => {
    try {
        const newPolicy = req.body;
        if (!newPolicy ||
            !newPolicy.id ||
            !newPolicy.customerName ||
            !newPolicy.productId) {
            return res.status(400).json({ error: "Missing required policy fields" });
        }
        if (typeof newPolicy.premium !== "number") {
            return res.status(400).json({ error: "Please check premium amount" });
        }
        // Check for duplicate ID
        if (typedPolicies.some((p) => p.id === newPolicy.id)) {
            return res
                .status(409)
                .json({ error: "Policy with this ID already exists" });
        }
        // Optionally, check if productId exists
        const product = typedProducts.find((prod) => prod.id === newPolicy.productId);
        if (!product) {
            return res.status(400).json({ error: "Invalid productId" });
        }
        // Add new policy to in-memory array (does not persist to file)
        typedPolicies.push(newPolicy);
        //writing to the file
        fs_1.default.writeFileSync(path_1.default.join(__dirname, "../storageFiles/policies.json"), JSON.stringify(typedPolicies, null, 2));
        // Return the created policy with full product object
        res.status(201).json(Object.assign(Object.assign({}, newPolicy), { product }));
    }
    catch (error) {
        console.error("Error creating policy:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
policyRouter.put("/:id", (req, res) => {
    const policyId = req.params.id;
    const updatedPolicy = req.body;
    // Find the index of the policy to update
    const index = typedPolicies.findIndex((p) => {
        return p.id === policyId;
    });
    if (index === -1) {
        return res.status(404).json({ error: "Policy not found" });
    }
    // Optionally, check if productId exists
    if (updatedPolicy.productId) {
        const product = typedProducts.find((prod) => prod.id === updatedPolicy.productId);
        if (!product) {
            return res.status(400).json({ error: "Invalid productId" });
        }
    }
    // Update the policy
    typedPolicies[index] = Object.assign(Object.assign({}, typedPolicies[index]), updatedPolicy);
    // Attach full product object in response
    const product = typedProducts.find((prod) => prod.id === typedPolicies[index].productId);
    //writing to the file
    fs_1.default.writeFileSync(path_1.default.join(__dirname, "../storageFiles/policies.json"), JSON.stringify(typedPolicies, null, 2));
    res.json(Object.assign(Object.assign({}, typedPolicies[index]), { product }));
});
policyRouter.delete("/:id", (req, res) => {
    const policyId = req.params.id;
    const index = typedPolicies.findIndex((p) => p.id === policyId);
    if (index === -1) {
        return res.status(404).json({ error: "Policy not found" });
    }
    // Remove the policy from the array
    const deletedPolicy = typedPolicies.splice(index, 1)[0];
    // Attach full product object in response
    const product = typedProducts.find((prod) => prod.id === deletedPolicy.productId);
    //writing to the file
    fs_1.default.writeFileSync(path_1.default.join(__dirname, "../storageFiles/policies.json"), JSON.stringify(typedPolicies, null, 2));
    res.json(Object.assign(Object.assign({}, deletedPolicy), { product }));
});
exports.default = policyRouter;
