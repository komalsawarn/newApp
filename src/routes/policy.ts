import { Router, Request, Response, NextFunction } from "express";
import policies from "../storageFiles/policies.json";
import products from "../storageFiles/products.json";
import { Policy, Product } from "../types/data-types";
import fs from "fs";
import path from "path";
// import { authenticateApiKey } from "../app"; // Import the API key middleware
const policyRouter = Router();

function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  console.log("API Key Middleware Triggered .....");

  const key = req.header("x-api-key");

  console.log("API Key:", process.env.API_KEY);

  if (key !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

const typedPolicies = policies as Policy[];
const typedProducts = products as Product[];

//  GET endpoint for policies
policyRouter.get("/:id", (req: Request, res: Response) => {
  try {
    const policy = typedPolicies.find((p) => p.id === req.params.id);
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }
    const product = typedProducts.find((prod) => prod.id === policy.productId);
    if (!product) {
      return res
        .status(500)
        .json({ error: "Product not found for this policy" });
    }
    // Attach full product object
    const response = { ...policy, product };
    res.json(response);
    // product;
  } catch (error) {
    console.error("Error fetching policy:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

policyRouter.get("/", (req: Request, res: Response) => {
  try {
    const { customerName } = req.query;
    if (!customerName) {
      return res.send("Missing Parameter: Customer name");
    }

    const filteredPolicies = typedPolicies.filter(
      (p) =>
        p.customerName?.toLowerCase() === String(customerName).toLowerCase()
    );

    const result = filteredPolicies.map((policy) => {
      const product = typedProducts.find(
        (prod) => prod.id === policy.productId
      );
      return { ...policy, product };
    });
    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "No policies found for this customer" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error fetching policies:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

policyRouter.post("/", authenticateApiKey, (req: Request, res: Response) => {
  try {
    const newPolicy: Policy = req.body;
    if (
      !newPolicy ||
      !newPolicy.id ||
      !newPolicy.customerName ||
      !newPolicy.productId
    ) {
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
    const product = typedProducts.find(
      (prod) => prod.id === newPolicy.productId
    );
    if (!product) {
      return res.status(400).json({ error: "Invalid productId" });
    }
    // Add new policy to in-memory array (does not persist to file)
    typedPolicies.push(newPolicy);

    //writing to the file
    fs.writeFileSync(
      path.join(__dirname, "../storageFiles/policies.json"),
      JSON.stringify(typedPolicies, null, 2)
    );
    // Return the created policy with full product object
    res.status(201).json({ ...newPolicy, product });
  } catch (error) {
    console.error("Error creating policy:", error);
    throw error; // Re-throw to be caught by the global error handler
  }
});

policyRouter.put("/:id", (req, res) => {
  try {
    const policyId: string = req.params.id;
    const updatedPolicy: Policy = req.body;

    // Find the index of the policy to update
    const index: number = typedPolicies.findIndex((p) => {
      return p.id === policyId;
    });
    if (index === -1) {
      return res.status(404).json({ error: "Policy not found" });
    }

    // Optionally, check if productId exists
    if (updatedPolicy.productId) {
      const product = typedProducts.find(
        (prod) => prod.id === updatedPolicy.productId
      );
      if (!product) {
        return res.status(400).json({ error: "Invalid productId" });
      }
    }

    // Update the policy
    typedPolicies[index] = { ...typedPolicies[index], ...updatedPolicy };

    // Attach full product object in response
    const product = typedProducts.find(
      (prod) => prod.id === typedPolicies[index].productId
    );

    //writing to the file
    fs.writeFileSync(
      path.join(__dirname, "../storageFiles/policies.json"),
      JSON.stringify(typedPolicies, null, 2)
    );

    res.json({ ...typedPolicies[index], product });
  } catch (error) {
    console.error("Error updating policy:", error);
    throw error; // Re-throw to be caught by the global error handler
  }
});

policyRouter.delete("/:id", (req, res) => {
  try {
    const policyId: string = req.params.id;
    const index: number = typedPolicies.findIndex((p) => p.id === policyId);

    if (index === -1) {
      return res.status(404).json({ error: "Policy not found" });
    }

    // Remove the policy from the array
    const deletedPolicy = typedPolicies.splice(index, 1)[0];

    // Attach full product object in response
    const product: Product | undefined = typedProducts.find(
      (prod) => prod.id === deletedPolicy.productId
    );

    //writing to the file
    fs.writeFileSync(
      path.join(__dirname, "../storageFiles/policies.json"),
      JSON.stringify(typedPolicies, null, 2)
    );

    res.json({ ...deletedPolicy, product });
  } catch (error) {
    console.error("Error deleting policy:", error);
    throw error; // Re-throw to be caught by the global error handler
  }
});

export default policyRouter;
