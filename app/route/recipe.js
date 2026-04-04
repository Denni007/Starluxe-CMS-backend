const express = require("express");
const router = express.Router();
const recipe = require("../controller/recipe"); 
const { isAuth } = require("../middleware/utill");

// Recipes
// FIX: Ensure 'recipe' is defined and points to the correct controller methods
router.get("/business/:businessId", isAuth, recipe.getAllByBusiness);
router.post("/", isAuth, recipe.create);
router.patch("/:id", isAuth, recipe.update);
router.delete("/:id", isAuth, recipe.delete);

module.exports = router;