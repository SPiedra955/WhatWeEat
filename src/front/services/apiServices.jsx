const services = {};
const url = import.meta.env.VITE_BACKEND_URL;

services.getDiets = async (token) => {
  const response = await fetch(`${url}/api/diets`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.error || "Error obteniendo las dietas");
    error.status = response.status;
    throw error;
  }

  return result;
};


services.createDiet = async (token, data) => {
  const response = await fetch(`${url}/api/diets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.error || "Error creando la dieta");
    error.status = response.status;
    throw error;
  }

  return result;
};


services.addRecipeToDiet = async (token, dietId, data) => {
  const response = await fetch(
    `${url}/api/diets/${dietId}/recipes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(
      result.error || "Error añadiendo la receta a la dieta"
    );

    error.status = response.status;
    throw error;
  }

  return result;
};

const request = async (endpoint, data) => {
  try {
    const resp = await fetch(url + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await resp.json();

    if (!resp.ok) {
      const error = new Error(result.data || "Error");
      error.status = resp.status;
      throw error;
    }

    return result;
  } catch (error) {
    console.error("ERROR:", error);
    throw error;
  }
};

services.register = async (formData) => {
  return await request("/api/register", formData);
};

services.login = async (formData) => {
  return await request("/api/login", formData);
};

services.logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export default services;
