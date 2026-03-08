const express = require("express");
const router = express.Router();
const stickyNoteController = require("../controller/StickyNote");
const { isAuth } = require("../middleware/utill");

// Add a new sticky note
router.post("/", isAuth, stickyNoteController.addStickyNote);

// Get all sticky notes
router.get("/", isAuth, stickyNoteController.getStickyNotes);

// Update a sticky note
router.put("/:id", isAuth, stickyNoteController.updateStickyNote);

// Delete a sticky note
router.delete("/:id", isAuth, stickyNoteController.deleteStickyNote);

// Archive a sticky note
router.put("/archive/:id", isAuth, stickyNoteController.archiveStickyNote);

module.exports = router;
