// server/routes/posts.js
const express = require("express");
const router = express.Router();

// TEMP: simple debug route to confirm mounting works
router.get("/", (req, res) => {
  console.log("DEBUG: GET /posts hit");
  res.json([{ id: 1, title: "route works" }]);
});

// (You can later replace with DB-backed handlers)
module.exports = router;


