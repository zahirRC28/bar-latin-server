const router = require("express").Router();
const upload = require("../middleware/upload.middleware");
const {
  createEvent,
  getEvents,
  deleteEvent,
  updateEvent,
} = require("../controllers/events.controller");

const {
  verifyToken,
  isAdmin,
} = require("../middleware/auth.middleware");

router.get("/", getEvents);
router.post("/", verifyToken, isAdmin, upload.single("media"), createEvent);
router.put("/:id", verifyToken, isAdmin, upload.single("media"), updateEvent);
router.delete("/:id", verifyToken, isAdmin, deleteEvent);

module.exports = router;