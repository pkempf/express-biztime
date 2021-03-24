/** Industry routes. */

const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

/** GET / returns `{industries: [{code, industry}, ...]}` */
router.get("/", async (req, res, next) => {
  try {
    const industriesQuery = await db.query(
      "SELECT code, industry FROM industries"
    );
    return res.json({ industries: industriesQuery.rows });
  } catch (err) {
    return next(err);
  }
});

/** GET /[code] returns `{industry: [{code, industry, companies: [...]}, ...]}` */
router.get("/:code", async (req, res, next) => {
  try {
    const industryQuery = await db.query(
      `SELECT i.code, i.industry, c.code AS company_code, c.name AS company_name
            FROM industries AS i
                LEFT JOIN comps_inds AS ci
                    ON i.code = ci.ind_code
                LEFT JOIN companies AS c ON ci.comp_code = c.code
            WHERE i.code = $1`,
      [req.params.code]
    );

    if (industryQuery.rows.length === 0) {
      throw new ExpressError(
        `There is no industry with code ${req.params.code}`,
        404
      );
    }

    let { code, industry } = industryQuery.rows[0];
    let companies = industryQuery.rows.map((r) => {
      return { code: r.company_code, name: r.company_name };
    });
    return res.json({ code, industry, companies });
  } catch (err) {
    return next(err);
  }
});

/** POST / returns `{industry: code, industry} */
router.post("/", async (req, res, next) => {
  try {
    const result = await db.query(
      `INSERT INTO industries (code, industry)
            VALUES ($1, $2)
            RETURNING code, industry`,
      [req.body.code, req.body.industry]
    );
    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** POST /[icode]/add/[ccode] returns `{comp_ind: comp_code, ind_code} */
router.post("/:icode/add/:ccode", async (req, res, next) => {
  try {
    const result = await db.query(
      `INSERT INTO comps_inds (comp_code, ind_code)
            VALUES ($1, $2)
            RETURNING comp_code, ind_code`,
      [req.params.ccode, req.params.icode]
    );
    return res.status(201).json({ comp_ind: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[code] - delete existing industry; return `{status: "deleted"}` */
router.delete("/:code", async (req, res, next) => {
  try {
    const result = await db.query(
      "DELETE FROM industries WHERE code = $1 RETURNING code",
      [req.params.code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(
        `There is no industry with code ${req.params.code}`,
        404
      );
    }
    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
