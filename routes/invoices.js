/** Invoice routes. */

const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

/** GET / returns `{invoices: [{id, comp_code}, ...]}` */
router.get("/", async (req, res, next) => {
  try {
    const invoicesQuery = await db.query("SELECT id, comp_code FROM invoices");
    return res.json({ companies: invoicesQuery.rows });
  } catch (err) {
    return next(err);
  }
});

/** GET /[code] - return data about one invoice:
 * {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}` */
router.get("/:id", async (req, res, next) => {
  try {
    const invoiceQuery = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, code, name, description 
        FROM invoices 
        JOIN companies ON invoices.comp_code=companies.code
        WHERE id = $1`,
      [req.params.id]
    );

    if (invoiceQuery.rows.length === 0) {
      throw new ExpressError(
        `There is no invoice with id ${req.params.id}`,
        404
      );
    }

    let invoice = {
      id: invoiceQuery.rows[0].id,
      amt: invoiceQuery.rows[0].amt,
      paid: invoiceQuery.rows[0].paid,
      add_date: invoiceQuery.rows[0].add_date,
      paid_date: invoiceQuery.rows[0].paid_date,
      company: {
        code: invoiceQuery.rows[0].code,
        name: invoiceQuery.rows[0].name,
        description: invoiceQuery.rows[0].description,
      },
    };

    return res.json({ invoice: invoice });
  } catch (err) {
    return next(err);
  }
});

/** POST / - create invoice from data; return `{invoice: invoice}` */
router.post("/", async (req, res, next) => {
  try {
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
                  VALUES ($1, $2)
                  RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [req.body.comp_code, req.body.amt]
    );

    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[id] - edit existing invoice; return `{invoice: invoice}` */
router.put("/:id", async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE invoices
                  SET amt = $2
                  WHERE id = $1
                  RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [req.params.id, req.body.amt]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(
        `There is no invoice with id ${req.params.id}`,
        404
      );
    }
    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id] - delete existing invoice; return `{status: "deleted"}` */
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await db.query(
      "DELETE FROM invoices WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(
        `There is no invoice with id ${req.params.id}`,
        404
      );
    }
    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
