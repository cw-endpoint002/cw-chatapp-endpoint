const express = require("express");
const router = express.Router();
const { io } = require("../../index.js");

router.post("/new_message", async (req, res) => {
  try {
    const data = req.body;

    if (data) {
      console.log("New webhook request", data);
      res.status(200).json({ message: "request reached webhook" });
    }
  } catch {
    res.status(500).send("Internal server Error");
  }
});

module.exports = router;
