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
  test("It should respond with an array of companies", async () => {
    const response = await request(app).get("/companies");
    expect(response.body).toEqual({
      companies: [
        { code: "acme", name: "ACME" },
        { code: "test-co", name: "Test Co." },
      ],
    });
  });
});

describe("GET /[company]", () => {
  test("It should return company info", async () => {
    const response = await request(app).get("/companies/acme");
    expect(response.body).toEqual({
      company: {
        code: "acme",
        name: "ACME",
        description: "The one from the cartoons",
        invoices: [{ id: 1 }, { id: 2 }],
        industries: [{ code: "toons" }, { code: "bombs" }, { code: "anvils" }],
      },
    });
  });

  test("It should return 404 for a nonexistent company", async () => {
    const response = await request(app).get("/companies/asdfghjkl");
    expect(response.status).toEqual(404);
  });
});

describe("POST /", () => {
  test("It should add a company", async () => {
    const response = await request(app).post("/companies").send({
      name: "Duff",
      description: "Homer's favorite beer",
    });
    expect(response.status).toEqual(201);
    expect(response.body).toEqual({
      company: {
        code: "duff",
        name: "Duff",
        description: "Homer's favorite beer",
      },
    });
  });
  test("It should return 500 if there's a conflict", async () => {
    const response = await request(app).post("/companies").send({
      name: "ACME",
      description: "from Looney Tunes",
    });
    expect(response.status).toEqual(500);
  });
});

describe("PUT /[company]", () => {
  test("It should update a company", async () => {
    const response = await request(app).put("/companies/acme").send({
      name: "ACMEEdit",
      description: "ACME, but different",
    });
    expect(response.body).toEqual({
      company: {
        code: "acme",
        name: "ACMEEdit",
        description: "ACME, but different",
      },
    });
  });

  test("It should return 404 for a nonexistent company", async () => {
    const response = await request(app).put("/companies/asdfghjkl").send({
      name: "whatever",
      description: "this shouldnt matter",
    });
    expect(response.status).toEqual(404);
  });

  test("It should return 500 if request body is missing data", async () => {
    const response = await request(app).put("/companies/acme").send({});
    expect(response.status).toEqual(500);
  });
});

describe("DELETE /[company]", () => {
  test("It should delete a company", async () => {
    const response = await request(app).delete("/companies/acme");
    expect(response.body).toEqual({ status: "deleted" });
  });

  test("It should return 404 for a nonexistent company", async () => {
    const response = await request(app).delete("/companies/asdfghjkl");
    expect(response.status).toEqual(404);
  });
});
