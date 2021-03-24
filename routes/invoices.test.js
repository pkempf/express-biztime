process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const { makeData } = require("../_test-helpers");
const db = require("../db");

beforeEach(makeData);

afterAll(async () => {
  await db.end();
});

describe("GET /", () => {
  test("It should respond with an array of invoices", async () => {
    const response = await request(app).get("/invoices");
    expect(response.body).toEqual({
      invoices: [
        { id: 1, comp_code: "acme" },
        { id: 2, comp_code: "acme" },
        { id: 3, comp_code: "test-co" },
      ],
    });
  });
});

describe("GET /1", () => {
  test("It should return invoice info", async () => {
    const response = await request(app).get("/invoices/1");
    expect(response.body).toEqual({
      invoice: {
        id: 1,
        amt: 150,
        add_date: "2021-03-16T05:00:00.000Z",
        paid: false,
        paid_date: null,
        company: {
          code: "acme",
          name: "ACME",
          description: "The one from the cartoons",
        },
      },
    });
  });

  test("It should return 404 for a nonexistent invoice", async () => {
    const response = await request(app).get("/invoices/525600");
    expect(response.status).toEqual(404);
  });
});

describe("POST /", () => {
  test("It should add an invoice", async () => {
    const response = await request(app).post("/invoices").send({
      amt: 400,
      comp_code: "test-co",
    });
    expect(response.status).toEqual(201);
    expect(response.body).toEqual({
      invoice: {
        id: 4,
        comp_code: "test-co",
        amt: 400,
        add_date: expect.any(String),
        paid: false,
        paid_date: null,
      },
    });
  });
});

describe("PUT /1", () => {
  test("It should update an invoice", async () => {
    const response = await request(app).put("/invoices/1").send({
      amt: 500,
      paid: false,
    });
    expect(response.body).toEqual({
      invoice: {
        id: 1,
        comp_code: "acme",
        paid: false,
        amt: 500,
        add_date: expect.any(String),
        paid_date: null,
      },
    });
  });

  test("It should return 404 for a nonexistent invoice", async () => {
    const response = await request(app).put("/invoices/525600").send({
      amt: 42,
      paid: false,
    });
    expect(response.status).toEqual(404);
  });

  test("It should return 500 if request body is missing data", async () => {
    const response = await request(app).put("/invoices/send").send({});
    expect(response.status).toEqual(500);
  });
});

describe("DELETE /1", () => {
  test("It should delete an invoice", async () => {
    const response = await request(app).delete("/invoices/1");
    expect(response.body).toEqual({ status: "deleted" });
  });

  test("It should return 404 for a nonexistent invoice", async () => {
    const response = await request(app).delete("/invoices/525600");
    expect(response.status).toEqual(404);
  });
});
