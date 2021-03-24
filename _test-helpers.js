const db = require("./db");

async function makeData() {
  await db.query("DELETE FROM comps_inds");
  await db.query("DELETE FROM industries");
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");

  await db.query("TRUNCATE invoices RESTART IDENTITY");

  await db.query(
    `INSERT INTO companies (code, name, description)
            VALUES ('acme', 'ACME', 'The one from the cartoons'),
                   ('test-co', 'Test Co.', 'Extremely fake')`
  );

  await db.query(
    `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
            VALUES ('acme', 150, false, '2021-03-16', null),
                   ('acme', 100, true, '2021-02-01', '2021-02-28'),
                   ('test-co', 200, false, '2021-01-01', null)`
  );

  await db.query(
    `INSERT INTO industries (code, industry)
            VALUES ('toons', 'Cartoons'),
                   ('bombs', 'Explosives and bombs'),
                   ('anvils', 'Cartoon anvils'),
                   ('widgets', 'Widgets and gadgets')`
  );

  await db.query(
    `INSERT INTO comps_inds (comp_code, ind_code)
            VALUES ('acme', 'toons'),
                   ('acme', 'bombs'),
                   ('acme', 'anvils'),
                   ('test-co', 'bombs'),
                   ('test-co', 'widgets')`
  );
}

module.exports = { makeData };
