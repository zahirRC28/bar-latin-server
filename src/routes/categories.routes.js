const router = require("express").Router();
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categories.controller");

const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

router.get("/", getCategories);
router.post("/", verifyToken, isAdmin, createCategory);
router.put("/:id", verifyToken, isAdmin, updateCategory);
router.delete("/:id", verifyToken, isAdmin, deleteCategory);

module.exports = router;
