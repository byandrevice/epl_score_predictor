const request = require("supertest");
const app = require("../app");

describe("Health endpoint", () => {
  test("GET /api/health returns OK", async () => {
    const res = await request(app).get("/api/health");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "OK" });
  });
});