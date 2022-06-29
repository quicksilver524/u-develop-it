const { Router } = require("express");
const express = require("express");
const { route } = require(".");
const router = express.Router();
const db = require("../../db/connection");
const inputCheck = require("../../utils/inputCheck");

// originally app.get('/api/candidates')
// Get all candidates and their party affiliation
router.get("/api/candidates", (req, res) => {
  const sql = `SELECT candidates.*, parties.name 
                  AS party_name 
                  FROM candidates 
                  LEFT JOIN parties 
                  ON candidates.party_id = parties.id`;

  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

// originally app.get('/api/candidate/:id')
// Get single candidate with party affiliation
router.get("/api/candidate/:id", (req, res) => {
  const sql = `SELECT candidates.*, parties.name 
                 AS party_name 
                 FROM candidates 
                 LEFT JOIN parties 
                 ON candidates.party_id = parties.id 
                 WHERE candidates.id = ?`;
  const params = [req.params.id];

  db.query(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: row,
    });
  });
});

// originally app.post('/api/candidate')
// Create a candidate
router.post("/api/candidate", ({ body }, res) => {
  // Candidate is allowed not to be affiliated with a party
  const errors = inputCheck(
    body,
    "first_name",
    "last_name",
    "industry_connected"
  );
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }

  const sql = `INSERT INTO candidates (first_name, last_name, industry_connected, party_id) VALUES (?,?,?,?)`;
  const params = [
    body.first_name,
    body.last_name,
    body.industry_connected,
    body.party_id,
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: body,
      changes: result.affectedRows,
    });
  });
});

// originally app.put('/api/candidate/:id')
// Update a candidate's party
router.put("/api/candidate/:id", (req, res) => {
  // Candidate is allowed to not have party affiliation
  const errors = inputCheck(req.body, "party_id");
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }

  const sql = `UPDATE candidates SET party_id = ? 
                 WHERE id = ?`;
  const params = [req.body.party_id, req.params.id];
  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      // check if a record was found
    } else if (!result.affectedRows) {
      res.json({
        message: "Candidate not found",
      });
    } else {
      res.json({
        message: "success",
        data: req.body,
        changes: result.affectedRows,
      });
    }
  });
});

// originally app.delete('/api/candidate/:id')
// Delete a candidate
router.delete("/api/candidate/:id", (req, res) => {
  const sql = `DELETE FROM candidates WHERE id = ?`;
  const params = [req.params.id];
  db.query(sql, params, (err, result) => {
    if (err) {
      res.statusMessage(400).json({ error: res.message });
    } else if (!result.affectedRows) {
      res.json({
        message: "Candidate not found",
      });
    } else {
      res.json({
        message: "deleted",
        changes: result.affectedRows,
        id: req.params.id,
      });
    }
  });
});

module.exports = router;