const express = require("express");
const { getDb } = require("../db/database");
const { standard } = require("../middleware/rateLimit");

const router = express.Router();

router.get("/campaigns", standard, (req, res) => {
  res.json(getDb().prepare("SELECT * FROM campaigns ORDER BY updated DESC").all());
});

router.post("/campaigns", standard, (req, res) => {
  const name = (req.body?.name || "").trim().slice(0, 200);
  if (!name) return res.status(400).json({ error: "name required" });
  const r = getDb()
    .prepare("INSERT INTO campaigns (name, created, updated) VALUES (?, datetime('now'), datetime('now'))")
    .run(name);
  res.json({ id: r.lastInsertRowid, name });
});

router.delete("/campaigns/:id", standard, (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: "bad id" });
  getDb().prepare("DELETE FROM campaigns WHERE id = ?").run(id);
  res.json({ deleted: id });
});

// no pagination yet — fine for now but will need it if entries get large
router.get("/campaigns/:id/entries", standard, (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: "bad id" });
  res.json(
    getDb().prepare("SELECT * FROM workbook_entries WHERE campaign_id = ? ORDER BY ts DESC").all(id)
  );
});

router.post("/campaigns/:id/entries", standard, (req, res) => {
  const campaign_id = parseInt(req.params.id);
  if (!campaign_id) return res.status(400).json({ error: "bad id" });

  const { type, value, ioc_type, note } = req.body || {};
  if (!type || !value) return res.status(400).json({ error: "type and value required" });

  const db = getDb();
  const r = db.prepare(
    "INSERT INTO workbook_entries (campaign_id, type, value, ioc_type, note, ts) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  ).run(campaign_id, type.slice(0, 50), value.slice(0, 512), (ioc_type || "").slice(0, 50), (note || "").slice(0, 2000));

  db.prepare("UPDATE campaigns SET updated = datetime('now') WHERE id = ?").run(campaign_id);
  res.json({ id: r.lastInsertRowid, campaign_id });
});

router.delete("/entries/:id", standard, (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: "bad id" });
  getDb().prepare("DELETE FROM workbook_entries WHERE id = ?").run(id);
  res.json({ deleted: id });
});

router.get("/campaigns/:id/export", standard, (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: "bad id" });
  const db = getDb();
  const campaign = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(id);
  if (!campaign) return res.status(404).json({ error: "not found" });
  const entries = db.prepare("SELECT * FROM workbook_entries WHERE campaign_id = ? ORDER BY ts DESC").all(id);
  res.json({ campaign, entries, exported: new Date().toISOString() });
});

module.exports = router;
