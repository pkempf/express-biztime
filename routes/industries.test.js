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
  test("It should respond with an array of industries", async () => {
    const response = await request(app).get("/industries");
    expect(response.body).toEqual({
      industries: [
        { code: "toons", industry: "Cartoons" },
        { code: "bombs", industry: "Explosives and bombs" },
        { code: "anvils", industry: "Cartoon anvils" },
        { code: "widgets", industry: "Widgets and gadgets" },
      ],
    });
  });
});

describe("GET /[industry]", () => {
  test("It should return industry info", async () => {
    const response = await request(app).get("/industries/toons");
    expect(response.body).toEqual({
      code: "toons",
      industry: "Cartoons",
      companies: [{ code: "acme", name: "ACME" }],
    });
  });

  test("It should return 404 for a nonexistent industry", async () => {
    const response = await request(app).get("/industries/asdfghjkl");
    expect(response.status).toEqual(404);
  });
});

describe("POST /", () => {
  test("It should add an industry", async () => {
    const response = await request(app).post("/industries").send({
      code: "sports",
      industry: "Sporting goods",
    });
    expect(response.status).toEqual(201);
    expect(response.body).toEqual({
      industry: {
        code: "sports",
        industry: "Sporting goods",
      },
    });
  });
  test("It should return 500 if there's a conflict", async () => {
    const response = await request(app).post("/industries").send({
      code: "toons",
      description: "Duplicate entry",
    });
    expect(response.status).toEqual(500);
  });
});

describe("POST /[industry]/add/[company]", () => {
  test("It should associate a company with an industry", async () => {
    const response = await request(app).post("/industries/widgets/add/acme");
    expect(response.body).toEqual({
      comp_ind: {
        comp_code: "acme",
        ind_code: "widgets",
      },
    });
  });

  test("It should return 500 for a nonexistent company", async () => {
    const response = await request(app).post(
      "/industries/widgets/add/asdfghjkl"
    );
    expect(response.status).toEqual(500);
  });

  test("It should return 500 if relation already exists", async () => {
    const response = await request(app).post("/industries/toons/add/acme");
    expect(response.status).toEqual(500);
  });
});

describe("DELETE /[industry]", () => {
  test("It should delete an industry", async () => {
    const response = await request(app).delete("/industries/toons");
    expect(response.body).toEqual({ status: "deleted" });
  });

  test("It should return 404 for a nonexistent industry", async () => {
    const response = await request(app).delete("/industries/asdfghjkl");
    expect(response.status).toEqual(404);
  });
});
