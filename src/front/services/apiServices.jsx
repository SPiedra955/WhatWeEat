const services = {};
const url = import.meta.env.VITE_BACKEND_URL;

services.auth = async (formData) => {
  try {
    const resp = await fetch(url + "/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const text = await resp.text();
    // console.log(text)

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Respuesta del backend no es JSON");
    }

    if (!resp.ok) {
      const error = new Error(data.data || "error auth");
      error.status = resp.status;
      throw error;
    }

    if (data.token) localStorage.setItem("token", data.token);

    return data;
  } catch (error) {
    console.log("ERROR:", error);
    throw error;
  }
};

services.logout = () => {
  localStorage.removeItem("token");
};

export default services;
