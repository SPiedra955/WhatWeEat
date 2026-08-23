require("dotenv").config();

const axios = require("axios");

const url = process.env.VITE_BACKEND_URL;

/* 
RECETAS
*/

describe("API /recipes", () => {
  test("GET /recipes sin token devuelve 401", async () => {
    try {
      await axios.get(`${url}/api/recipes`);
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  test("GET /recipes con token devuelve 200", async () => {
    const email = `recipes-${Date.now()}@test.com`;
    const password = "123456";

    await axios.post(`${url}/api/register`, {
      email,
      password,
      name: "Recipes Test",
      age: 25,
      weight: 70,
    });

    const login = await axios.post(`${url}/api/login`, {
      email,
      password,
    });

    const token = login.data.token;

    const response = await axios.get(`${url}/api/recipes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("recipes");
    expect(Array.isArray(response.data.recipes)).toBe(true);
  });
});

describe("API /recipes/:id", () => {
  test("receta inexistente devuelve 404", async () => {
    const email = `recipe-${Date.now()}@test.com`;
    const password = "123456";

    await axios.post(`${url}/api/register`, {
      email,
      password,
      name: "Recipe Test",
      age: 25,
      weight: 70,
    });

    const login = await axios.post(`${url}/api/login`, {
      email,
      password,
    });

    const token = login.data.token;

    try {
      await axios.get(`${url}/api/recipes/999999`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.error).toBe("Recipe not found");
    }
  });
});

describe("API /recipes/suggestions", () => {
  test("sin token devuelve 401", async () => {
    try {
      await axios.post(`${url}/api/recipes/suggestions`, {
        ingredients: ["pollo"],
      });
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  test("sin body devuelve 400", async () => {
    const email = `suggestions-${Date.now()}@test.com`;
    const password = "123456";

    await axios.post(`${url}/api/register`, {
      email,
      password,
      name: "Suggestions Test",
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
        `${url}/api/recipes/suggestions`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error).toBe(
        "Request body is required"
      );
    }
  });
});
