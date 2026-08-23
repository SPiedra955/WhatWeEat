require("dotenv").config();

const axios = require("axios");

const url = process.env.VITE_BACKEND_URL;

describe("API /favorites", () => {
  test("GET /favorites sin token devuelve 401", async () => {
    try {
      await axios.get(`${url}/api/favorites`);
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  test("POST /favorites/:id con receta inexistente devuelve 404", async () => {
    const email = `favorite-${Date.now()}@test.com`;
    const password = "123456";

    await axios.post(`${url}/api/register`, {
      email,
      password,
      name: "Favorite Test",
      age: 25,
      weight: 70,
    });

    const login = await axios.post(`${url}/api/login`, {
      email,
      password,
    });

    const token = login.data.token;

    try {
      await axios.post(
        `${url}/api/favorites/999999`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.error).toBe(
        "La receta no existe"
      );
    }
  });
});
