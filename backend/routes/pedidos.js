const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", (req, res) => {
  const { items, total } = req.body;

  db.run(
    "INSERT INTO pedidos (items, total, fecha) VALUES (?, ?, ?)",
    [JSON.stringify(items), total, new Date().toISOString()],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

module.exports = router;
