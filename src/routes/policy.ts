import { Router, Request, Response, NextFunction } from "express";
import policies from "../storageFiles/policies.json";
import products from "../storageFiles/products.json";
import { Policy, Product } from "../types/data-types";
import { authenticateApiKey } from "../middleware/authenticateKey";
import { writePoliciesToFile } from "../Util/util";

const policyRouter = Router();
const typedPolicies = policies as Policy[];
const typedProducts = products as Product[];

//  To return a single policy by its ID and attach the full product object
policyRouter.get("/:id", (req: Request, res: Response) => {
  try {
    const policyId: string = req.params.id;
    const policy: Policy | undefined = typedPolicies.find(
      (p) => p.id === policyId
    );
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }
    const product: Product | undefined = typedProducts.find(
      (prod) => prod.id === policy.productId
    );
    if (!product) {
      return res
        .status(500)
        .json({ error: "Product not found for this policy" });
    }
    // Attach full product object
    const response: Policy & { product: Product } = { ...policy, product };
    res.json(response);
    // product;
  } catch (error) {
    console.error("Error fetching policy:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// To return all policies for a specific customer
policyRouter.get("/", (req: Request, res: Response) => {
  try {
    const customerName =
      typeof req.query.customerName === "string"
        ? req.query.customerName.trim()
        : null;

    if (!customerName) {
      return res
        .status(400)
        .json({ error: "Required Parameter missing: Customer name" });
    }

    const filteredPolicies: Policy[] = typedPolicies.filter(
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

// To create a new policy (protected by API key)
policyRouter.post(
  "/",
  authenticateApiKey,
  async (req: Request, res: Response) => {
    try {
      const newPolicy: Policy = req.body;
      if (
        !newPolicy ||
        !newPolicy.id ||
        !newPolicy.customerName ||
        !newPolicy.productId
      ) {
        return res
          .status(400)
          .json({ error: "Required Parameter:  Policy fields" });
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
      const product: Product | undefined = typedProducts.find(
        (prod) => prod.id === newPolicy.productId
      );
      if (!product) {
        return res.status(400).json({ error: "Invalid productId" });
      }
      // Add new policy to in-memory array (does not persist to file)
      typedPolicies.push(newPolicy);

      //writing to the file
      await writePoliciesToFile(typedPolicies);

      // Return the created policy with full product object
      res.status(201).json({ ...newPolicy, product });
    } catch (error) {
      console.error("Error creating policy:", error);
      throw error; // Re-throw to be caught by the global error handler
    }
  }
);

// To update an existing policy by ID (protected by API key)
policyRouter.put("/:id", async (req, res) => {
  try {
    const policyId: string = req.params.id;
    const updatedPolicy: Policy = req.body;
    if (!updatedPolicy || Object.keys(updatedPolicy).length === 0) {
      return res
        .status(400)
        .json({ error: "Required Parameter Missing: Policy fields" });
    }

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
    await writePoliciesToFile(typedPolicies);

    return res.json({ ...typedPolicies[index], product });
  } catch (error) {
    console.error("Error updating policy:", error);
    throw error; // Re-throw to be caught by the global error handler
  }
});

// To delete a policy by ID (protected by API key)
policyRouter.delete("/:id", async (req, res) => {
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
    await writePoliciesToFile(typedPolicies);

    return res.json({ ...deletedPolicy, product });
  } catch (error) {
    console.error("Error deleting policy:", error);
    throw error; // Re-throw to be caught by the global error handler
  }
});

export default policyRouter;
