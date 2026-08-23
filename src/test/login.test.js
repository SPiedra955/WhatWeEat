require("dotenv").config();

const axios = require("axios");

const url = process.env.VITE_BACKEND_URL;

describe("API /register", () => {
  test("register sin datos devuelve 400", async () => {
    try {
      await axios.post(`${url}/api/register`, {});
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.data).toBe("missing info");
    }
  });

  test("register con datos correctos devuelve 201", async () => {
    const email = `jest-${Date.now()}@test.com`;

    const response = await axios.post(`${url}/api/register`, {
      email,
      password: "123456",
      name: "Jest Test",
      age: 25,
      weight: 70,
    });

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data).toHaveProperty("token");
    expect(response.data).toHaveProperty("data");
    expect(response.data.data.email).toBe(email);
  });

  test("register con email duplicado devuelve 409", async () => {
    const email = `duplicate-${Date.now()}@test.com`;

    const user = {
      email,
      password: "123456",
      name: "Duplicate Test",
      age: 25,
      weight: 70,
    };

    await axios.post(`${url}/api/register`, user);

    try {
      await axios.post(`${url}/api/register`, user);
    } catch (error) {
      expect(error.response.status).toBe(409);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.data).toBe("email taken");
    }
  });
});


/*
TEST LOGIN
*/

describe("API /login", () => {
  const email = `login-${Date.now()}@test.com`;
  const password = "123456";

  beforeAll(async () => {
    await axios.post(`${url}/api/register`, {
      email,
      password,
      name: "Login Test",
      age: 25,
      weight: 70,
    });
  });

  test("login correcto devuelve 200 y token", async () => {
    const response = await axios.post(`${url}/api/login`, {
      email,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data).toHaveProperty("token");
    expect(response.data.data.email).toBe(email);
  });

  test("login sin datos devuelve 400", async () => {
    try {
      await axios.post(`${url}/api/login`, {});
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.data).toBe("missing info");
    }
  });

  test("login con email inexistente devuelve 404", async () => {
    try {
      await axios.post(`${url}/api/login`, {
        email: "no-existe-jest@test.com",
        password: "123456",
      });
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.data).toBe("email not found");
    }
  });

  test("login con password incorrecta devuelve 401", async () => {
    try {
      await axios.post(`${url}/api/login`, {
        email,
        password: "password-incorrecta",
      });
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.data).toBe(
        "incorrect email or password"
      );
    }
  });
});
