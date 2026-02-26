const router = require("express").Router();
const upload = require("../middleware/upload.middleware");
const {
  createItem,
  getItems,
  updateItem,
  deleteItem,
} = require("../controllers/items.controller");

const {
  verifyToken,
  isAdmin,
} = require("../middleware/auth.middleware");

router.get("/", getItems);
router.post("/", verifyToken, isAdmin, upload.single("image"), createItem);
router.put("/:id", verifyToken, isAdmin, upload.single("image"), updateItem);
router.delete("/:id", verifyToken, isAdmin, deleteItem);

module.exports = router;