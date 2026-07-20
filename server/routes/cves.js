const express = require("express");
const fetch = require("node-fetch");
const { standard } = require("../middleware/rateLimit");

const router = express.Router();

const NVD_BASE = "https://services.nvd.nist.gov/rest/json/cves/2.0";

function shapeCVE(v) {
  const cve = v.cve;
  const m = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV30?.[0];
  const score = m?.cvssData?.baseScore ?? 0;
  const desc = cve.descriptions?.find(d => d.lang === "en")?.value ?? "";
  return { id: cve.id, score, desc, published: cve.published, metrics: m };
}

router.get("/search", standard, async (req, res) => {
  const keyword = (req.query.keyword || "").trim().slice(0, 100);
  const cvssMin = parseFloat(req.query.cvssMin) || 7.0;

  let url = `${NVD_BASE}?resultsPerPage=20&startIndex=0`;
  if (keyword) url += `&keywordSearch=${encodeURIComponent(keyword)}`;

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    const results = (d.vulnerabilities || [])
      .map(shapeCVE)
      .filter(v => v.score >= cvssMin)
      .sort((a, b) => b.score - a.score);
    res.json(results);
  } catch {
    res.status(502).json({ error: "NVD unavailable" });
  }
});

router.get("/kev", standard, async (_req, res) => {
  try {
    const r = await fetch("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json");
    const d = await r.json();
    res.json(d.vulnerabilities || []);
  } catch {
    res.status(502).json({ error: "upstream error" });
  }
});

module.exports = router;
