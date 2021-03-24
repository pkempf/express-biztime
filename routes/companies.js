/** Company routes. */

const express = require("express");
const slugify = require("slugify");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

/** GET / returns `{companies: [{code, name}, ...]}` */
router.get("/", async (req, res, next) => {
  try {
    const companiesQuery = await db.query("SELECT code, name FROM companies");
    return res.json({ companies: companiesQuery.rows });
  } catch (err) {
    return next(err);
  }
});

/** GET /[code] - return data about one company:
 * `{company: {code, name, description, invoices: [...], industries: [...]}}` */
router.get("/:code", async (req, res, next) => {
  try {
    const companyQuery = await db.query(
      "SELECT code, name, description FROM companies WHERE code = $1",
      [req.params.code]
    );

    const invoiceQuery = await db.query(
      `SELECT id
            FROM invoices
            WHERE comp_code = $1`,
      [req.params.code]
    );

    const industryQuery = await db.query(
      `SELECT i.code
            FROM industries AS i
            LEFT JOIN comps_inds AS ci 
                ON i.code = ci.ind_code
            WHERE ci.comp_code = $1`,
      [req.params.code]
    );

    if (companyQuery.rows.length === 0) {
      throw new ExpressError(
        `There is no company with code ${req.params.code}`,
        404
      );
    }

    let company = companyQuery.rows[0];
    company.invoices = invoiceQuery.rows;
    company.industries = industryQuery.rows;
    return res.json({ company: company });
  } catch (err) {
    return next(err);
  }
});

/** POST / - create company from data; return `{company: company}` */
router.post("/", async (req, res, next) => {
  try {
    const result = await db.query(
      `INSERT INTO companies (code, name, description)
                VALUES ($1, $2, $3)
                RETURNING code, name, description`,
      [
        slugify(req.body.name, { lower: true, strict: true }),
        req.body.name,
        req.body.description,
      ]
    );

    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[code] - edit existing company; return `{company: company}` */
router.put("/:code", async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE companies
                SET name = $2, description = $3
                WHERE code = $1
                RETURNING code, name, description`,
      [req.params.code, req.body.name, req.body.description]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(
        `There is no company with code ${req.params.code}`,
        404
      );
    }
    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[code] - delete existing company; return `{status: "deleted"}` */
router.delete("/:code", async (req, res, next) => {
  try {
    const result = await db.query(
      "DELETE FROM companies WHERE code = $1 RETURNING code",
      [req.params.code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(
        `There is no company with code ${req.params.code}`,
        404
      );
    }
    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
