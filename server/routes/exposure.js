const express = require("express");
const fetch = require("node-fetch");
const { standard } = require("../middleware/rateLimit");
const { validateDomain } = require("../middleware/sanitize");

const router = express.Router();

router.get("/scan", standard, validateDomain, async (req, res) => {
  const domain = req.domain;
  const out = {};
  const jobs = [];

  jobs.push(
    fetch(`https://crt.sh/?q=${encodeURIComponent(`%.${domain}`)}&output=json`)
      .then(r => r.json())
      .then(data => {
        const seen = new Set();
        out.certs = data.filter(e => {
          if (seen.has(e.name_value)) return false;
          seen.add(e.name_value);
          return true;
        }).slice(0, 40);
      }).catch(() => {})
  );

  jobs.push(
    fetch("https://urlhaus-api.abuse.ch/v1/host/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: domain }),
    }).then(r => r.json()).then(d => { out.urlhaus = d; }).catch(() => {})
  );

  jobs.push(
    fetch("https://threatfox-api.abuse.ch/api/v1/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "search_ioc", search_term: domain }),
    }).then(r => r.json()).then(d => { out.threatfox = d.data || []; }).catch(() => {})
  );

  if (process.env.HIBP_KEY) {
    jobs.push(
      fetch(`https://haveibeenpwned.com/api/v3/breaches?domain=${encodeURIComponent(domain)}`, {
        headers: { "hibp-api-key": process.env.HIBP_KEY, "user-agent": "SCIF-Dashboard" },
      }).then(r => r.json()).then(d => { out.hibp = d; }).catch(() => {})
    );
  }

  await Promise.allSettled(jobs);
  res.json({ domain, results: out });
});

module.exports = router;
