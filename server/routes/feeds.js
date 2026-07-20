const express = require("express");
const fetch = require("node-fetch");
const { standard } = require("../middleware/rateLimit");

const router = express.Router();

const abuseFetch = (body) =>
  fetch("https://threatfox-api.abuse.ch/api/v1/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

router.get("/urlhaus", standard, async (_req, res) => {
  try {
    const r = await fetch("https://urlhaus-api.abuse.ch/v1/urls/recent/limit/30/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const d = await r.json();
    res.json(d.urls || []);
  } catch {
    res.status(502).json({ error: "upstream error" });
  }
});

router.get("/threatfox", standard, async (_req, res) => {
  try {
    const r = await abuseFetch({ query: "get_iocs", days: 1 });
    const d = await r.json();
    res.json((d.data || []).slice(0, 30));
  } catch {
    res.status(502).json({ error: "upstream error" });
  }
});

router.get("/feodo", standard, async (_req, res) => {
  try {
    const r = await abuseFetch({ query: "get_iocs", days: 1 });
    const d = await r.json();
    const all = d.data || [];
    const c2 = all.filter(i => i.threat_type === "botnet_cc");
    res.json((c2.length ? c2 : all).slice(0, 30));
  } catch {
    res.status(502).json({ error: "upstream error" });
  }
});

router.get("/malwarebazaar", standard, async (_req, res) => {
  try {
    const r = await fetch("https://mb-api.abuse.ch/api/v1/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "get_recent", selector: "time" }),
    });
    const d = await r.json();
    res.json((d.data || []).slice(0, 20));
  } catch {
    res.status(502).json({ error: "upstream error" });
  }
});

// kev is also fetched in cves.js — should consolidate at some point
router.get("/kev", standard, async (_req, res) => {
  try {
    const r = await fetch("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json");
    const d = await r.json();
    res.json((d.vulnerabilities || []).slice(0, 30));
  } catch {
    res.status(502).json({ error: "upstream error" });
  }
});

module.exports = router;
