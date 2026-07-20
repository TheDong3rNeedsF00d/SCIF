const PATTERNS = {
  ip:     /^\d{1,3}(\.\d{1,3}){3}$/,
  domain: /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
  hash:   /^[a-fA-F0-9]{32,64}$/,
  cve:    /^CVE-\d{4}-\d{4,}$/i,
};

function detectType(val) {
  for (const [type, re] of Object.entries(PATTERNS)) {
    if (re.test(val)) return type;
  }
  return "unknown";
}

function validateIOC(req, res, next) {
  const value = (req.query.value || req.body?.value || "").trim();
  if (!value || value.length > 512) return res.status(400).json({ error: "invalid ioc" });
  req.ioc = { value, type: detectType(value) };
  next();
}

function validateDomain(req, res, next) {
  const domain = (req.query.domain || req.body?.domain || "").trim();
  if (!domain || domain.length > 253) return res.status(400).json({ error: "invalid domain" });
  req.domain = domain;
  next();
}

module.exports = { validateIOC, validateDomain, detectType };

