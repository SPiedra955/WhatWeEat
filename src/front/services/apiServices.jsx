const services = {};
const url = import.meta.env.VITE_BACKEND_URL;

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
