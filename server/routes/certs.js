const express = require("express");
const fetch = require("node-fetch");
const { standard } = require("../middleware/rateLimit");
const { validateDomain } = require("../middleware/sanitize");

const router = express.Router();

router.get("/search", standard, validateDomain, async (req, res) => {
  try {
    const r = await fetch(`https://crt.sh/?q=${encodeURIComponent(req.domain)}&output=json`);
    if (!r.ok) throw new Error(r.status);
    const raw = await r.json();

    const seen = new Set();
    const data = raw.filter(e => {
      if (seen.has(e.name_value)) return false;
      seen.add(e.name_value);
      return true;
    }).slice(0, 40);

    res.json(data);
  } catch {
    res.status(502).json({ error: "crt.sh unavailable" });
  }
});

module.exports = router;
