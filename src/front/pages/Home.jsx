import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const [ingredients, setIngredients] = useState("");
  const [servings, setServings] = useState(1);
  const [objective, setObjective] = useState("healthy_eating");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token);

  const objectives = [
    {
      value: "lose_weight",
      label: "Perder peso",
      icon: "🔥",
    },
    {
      value: "maintain_weight",
      label: "Mantener peso",
      icon: "⚖️",
    },
    {
      value: "gain_muscle",
      label: "Ganar masa muscular",
      icon: "💪",
    },
    {
      value: "body_recomposition",
      label: "Perder grasa y ganar músculo",
      icon: "🏋️",
    },
    {
      value: "sports_performance",
      label: "Mejorar rendimiento deportivo",
      icon: "🏃",
    },
    {
      value: "competition_prep",
      label: "Preparación para competición",
      icon: "🏆",
    },
    {
      value: "healthy_eating",
      label: "Alimentación saludable",
      icon: "🥗",
    },
  ];

  const generateRecipe = async () => {
    if (!ingredients.trim()) {
      setError("Introduce al menos un ingrediente.");
      return;
    }

    if (servings < 1 || servings > 20) {
      setError("Las raciones deben estar entre 1 y 20.");
      return;
    }

    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      setError("Debes iniciar sesión para utilizar la IA.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${url}/api/recipes/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          ingredients: ingredients
            .split(",")
            .map((ingredient) => ingredient.trim())
            .filter(Boolean),

          servings: Number(servings),

          objective: objective,
        }),
      });

      const data = await response.json();

      console.log("RECIPE RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo generar la receta."
        );
      }

      if (data.recipe?.id) {
        navigate(`/recipe/${data.recipe.id}`);
        return;
      }

      throw new Error("La receta no tiene un ID válido.");

    } catch (error) {
      console.error("RECIPE ERROR:", error);

      setError(
        error.message || "Ha ocurrido un error generando la receta."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setIngredients("media bolsa de arroz, un filete de lomo, un tomate, media lechuga, aguacate, cebolla");
    setServings(1);
    setObjective("healthy_eating");
    setError("");

    document
      .getElementById("recipe-generator")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToGenerator = () => {
    document
      .getElementById("recipe-generator")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-light min-vh-100 py-3">

      <section className="container py-3">

        <div className="row align-items-center g-5">

          {/* HERO */}
          <div className="col-lg-6">

            <div className="mb-4">
              <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2">
                🤖 INTELIGENCIA ARTIFICIAL
              </span>
            </div>

            <h1 className="display-3 fw-bold lh-1 mb-4">
              Lo que tienes.
              <br />

              <span className="text-success">
                Lo que puedes cocinar.
              </span>
            </h1>

            <p className="lead text-secondary mb-4">
              Introduce los ingredientes que tienes en casa y
              personaliza tu receta según las personas y tu
              objetivo nutricional.
            </p>

            <div className="d-flex flex-wrap gap-3 mb-5">

              <button
                className="btn btn-success btn-lg px-4 rounded-3"
                onClick={scrollToGenerator}
              >
                ✨ Crear mi receta
              </button>

              <button
                className="btn btn-outline-dark btn-lg px-4 rounded-3"
                onClick={loadExample}
              >
                Ver ejemplo
              </button>

            </div>

            {/* FEATURES */}
            <div className="row g-3">

              <div className="col-6">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="fs-2 mb-3">🍳</div>

                    <h6 className="fw-bold mb-2">
                      Recetas IA
                    </h6>

                    <p className="small text-secondary mb-0">
                      Recetas creadas según los ingredientes
                      que tienes disponibles.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-6">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="fs-2 mb-3">🔥</div>

                    <h6 className="fw-bold mb-2">
                      Nutrición
                    </h6>

                    <p className="small text-secondary mb-0">
                      Consulta calorías, proteínas,
                      carbohidratos y grasas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-6">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="fs-2 mb-3">💪</div>

                    <h6 className="fw-bold mb-2">
                      Objetivos
                    </h6>

                    <p className="small text-secondary mb-0">
                      Adapta cada receta a tu objetivo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-6">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="fs-2 mb-3">❤️</div>

                    <h6 className="fw-bold mb-2">
                      Tus recetas
                    </h6>

                    <p className="small text-secondary mb-0">
                      Guarda y consulta tus recetas favoritas.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* GENERATOR */}
          <div
            className="col-lg-6"
            id="recipe-generator"
          >

            <div className="card border-0 shadow-lg rounded-4">

              <div className="card-body p-4 p-lg-5">

                <div className="d-flex align-items-center gap-3 mb-4">

                  <div
                    className="rounded-4 bg-success-subtle d-flex align-items-center justify-content-center"
                    style={{
                      width: "56px",
                      height: "56px",
                      fontSize: "28px",
                    }}
                  >
                    👨‍🍳
                  </div>

                  <div>
                    <h4 className="fw-bold mb-1">
                      Crea tu receta
                    </h4>

                    <small className="text-secondary">
                      Generada en segundos con IA
                    </small>
                  </div>

                </div>

                {isAuthenticated ? (
                  <>

                    {/* INGREDIENTES */}
                    <label className="form-label fw-semibold">
                      ¿Qué ingredientes tienes?
                    </label>

                    <textarea
                      className="form-control form-control-lg bg-light border-0 rounded-4"
                      rows="5"
                      placeholder="Ej: Media bolsa de arroz, un filete de lomo, un tomate, media lechuga, aguacate, cebolla"
                      value={ingredients}
                      onChange={(event) =>
                        setIngredients(event.target.value)
                      }
                      disabled={loading}
                    />

                    <div className="d-flex justify-content-between mt-2">

                      <small className="text-secondary">
                        Separa los ingredientes con comas
                      </small>

                      <small className="text-success fw-semibold">
                        ✨ AI Powered
                      </small>

                    </div>

                    {/* OPCIONES */}
                    <div className="row g-3 mt-2">

                      {/* RACIONES */}
                      <div className="col-md-5">

                        <label className="form-label fw-semibold">
                          👥 ¿Para cuántas personas?
                        </label>

                        <select
                          className="form-select form-select-lg bg-light border-0 rounded-4"
                          value={servings}
                          onChange={(event) =>
                            setServings(Number(event.target.value))
                          }
                          disabled={loading}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(
                            (number) => (
                              <option key={number} value={number}>
                                {number}{" "}
                                {number === 1
                                  ? "persona"
                                  : "personas"}
                              </option>
                            )
                          )}
                        </select>

                      </div>

                      {/* OBJETIVO */}
                      <div className="col-md-7">

                        <label className="form-label fw-semibold">
                          🎯 Objetivo
                        </label>

                        <select
                          className="form-select form-select-lg bg-light border-0 rounded-4"
                          value={objective}
                          onChange={(event) =>
                            setObjective(event.target.value)
                          }
                          disabled={loading}
                        >
                          {objectives.map((item) => (
                            <option
                              key={item.value}
                              value={item.value}
                            >
                              {item.icon} {item.label}
                            </option>
                          ))}
                        </select>

                      </div>

                    </div>

                    {/* BOTÓN */}
                    <button
                      className="btn btn-success btn-lg w-100 mt-4 rounded-4 py-3"
                      onClick={generateRecipe}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          />

                          La IA está cocinando...
                        </>
                      ) : (
                        <>
                          ✨ Generar receta
                        </>
                      )}
                    </button>

                    {error && (
                      <div className="alert alert-danger border-0 rounded-4 mt-4 mb-0">

                        <div className="fw-semibold">
                          ⚠️ Algo ha ocurrido
                        </div>

                        <div className="small mt-1">
                          {error}
                        </div>

                      </div>
                    )}

                  </>
                ) : (

                  <div className="text-center py-4">

                    <div
                      className="mx-auto mb-4 rounded-circle bg-success-subtle d-flex align-items-center justify-content-center"
                      style={{
                        width: "80px",
                        height: "80px",
                        fontSize: "36px",
                      }}
                    >
                      🔒
                    </div>

                    <h4 className="fw-bold mb-3">
                      Desbloquea la IA
                    </h4>

                    <p className="text-secondary mb-4">
                      Crea una cuenta gratuita para generar
                      recetas personalizadas con Inteligencia
                      Artificial.
                    </p>

                    <div className="d-flex flex-column gap-2">

                      <button
                        className="btn btn-success btn-lg rounded-4"
                        onClick={() => navigate("/register")}
                      >
                        ✨ Crear cuenta gratis
                      </button>

                      <button
                        className="btn btn-outline-secondary btn-lg rounded-4"
                        onClick={() => navigate("/login")}
                      >
                        Ya tengo una cuenta
                      </button>

                    </div>

                    <div className="mt-4">
                      <small className="text-secondary">
                        🔐 Tu cuenta protege tus recetas y preferencias.
                      </small>
                    </div>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};