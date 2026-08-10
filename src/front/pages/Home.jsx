
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token);

  const generateRecipe = async () => {
    if (!ingredients.trim()) {
      setError("Introduce al menos un ingrediente.");
      return;
    }

    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      setError("Debes iniciar sesión para utilizar la IA.");
      return;
    }

    setLoading(true);
    setError("");
    setRecipe(null);

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
        }),
      });

      const data = await response.json();

      console.log("RECIPE RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo generar la receta."
        );
      }

      setRecipe(data);
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
    setIngredients("pollo, arroz, cebolla, ajo, tomate");
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
    <div className="bg-light min-vh-100 py-5">

      {/* =========================
          HERO
      ========================== */}
      <section className="container py-5">
        <div className="row align-items-center g-5">

          {/* =========================
              HERO LEFT
          ========================== */}
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
              Introduce los ingredientes que tienes en casa y deja
              que nuestra Inteligencia Artificial cree una receta
              personalizada para ti.
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

            {/* =========================
                FEATURES
            ========================== */}
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
                      Recetas pensadas para tus objetivos
                      nutricionales.
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

          {/* =========================
              GENERATOR
          ========================== */}
          <div className="col-lg-6" id="recipe-generator">

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">

              {/* GENERATOR HEADER */}
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

                {/* =========================
                    AUTHENTICATED
                ========================== */}
                {isAuthenticated ? (
                  <>
                    <label className="form-label fw-semibold">
                      ¿Qué ingredientes tienes?
                    </label>

                    <textarea
                      className="form-control form-control-lg bg-light border-0 rounded-4"
                      rows="5"
                      placeholder="Ej: pollo, arroz, cebolla, ajo, tomate..."
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
                            aria-hidden="true"
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

                  /* =========================
                     NOT AUTHENTICATED
                  ========================== */
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

              {/* =========================
                  RECIPE RESULT
              ========================== */}
              {recipe && isAuthenticated && (
                <div className="border-top">

                  <div className="p-4 p-lg-5">

                    {/* RECIPE TITLE */}
                    <div className="mb-4">

                      <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2 mb-3">
                        ✨ RECETA GENERADA POR IA
                      </span>

                      <h2 className="fw-bold mb-2">
                        {recipe.title}
                      </h2>

                      <p className="text-secondary mb-0">
                        {recipe.description}
                      </p>

                    </div>

                    {/* RECIPE INFO */}
                    <div className="row g-2 mb-4">

                      <div className="col-4">
                        <div className="bg-light rounded-4 p-3 text-center h-100">
                          <div className="fs-4 mb-1">
                            ⏱️
                          </div>

                          <small className="text-secondary d-block">
                            Tiempo
                          </small>

                          <strong>
                            {recipe.time_minutes} min
                          </strong>
                        </div>
                      </div>

                      <div className="col-4">
                        <div className="bg-light rounded-4 p-3 text-center h-100">
                          <div className="fs-4 mb-1">
                            👥
                          </div>

                          <small className="text-secondary d-block">
                            Personas
                          </small>

                          <strong>
                            {recipe.servings}
                          </strong>
                        </div>
                      </div>

                      <div className="col-4">
                        <div className="bg-light rounded-4 p-3 text-center h-100">
                          <div className="fs-4 mb-1">
                            ⭐
                          </div>

                          <small className="text-secondary d-block">
                            Dificultad
                          </small>

                          <strong>
                            {recipe.difficulty}
                          </strong>
                        </div>
                      </div>

                    </div>

                    {/* INGREDIENTS */}
                    <div className="mb-5">

                      <h5 className="fw-bold mb-3">
                        🛒 Ingredientes
                      </h5>

                      <div className="list-group list-group-flush">

                        {recipe.ingredients?.map(
                          (ingredient, index) => (
                            <div
                              key={index}
                              className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center gap-3"
                            >
                              <div>
                                <span className="text-success me-2">
                                  ●
                                </span>

                                {ingredient.name}
                              </div>

                              <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                                {ingredient.amount}
                              </span>
                            </div>
                          )
                        )}

                      </div>

                    </div>

                    {/* PREPARATION */}
                    <div className="mb-5">

                      <h5 className="fw-bold mb-4">
                        👨‍🍳 Preparación
                      </h5>

                      <div className="d-flex flex-column gap-4">

                        {recipe.steps?.map(
                          (step, index) => (
                            <div
                              key={index}
                              className="d-flex gap-3"
                            >

                              <div
                                className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                                style={{
                                  width: "34px",
                                  height: "34px",
                                }}
                              >
                                {index + 1}
                              </div>

                              <p className="mb-0 pt-1 text-secondary">
                                {step}
                              </p>

                            </div>
                          )
                        )}

                      </div>

                    </div>

                    {/* NUTRITION */}
                    {recipe.nutrition && (
                      <div>

                        <h5 className="fw-bold mb-3">
                          📊 Información nutricional
                        </h5>

                        <div className="row g-2">

                          <div className="col-6 col-md-3">
                            <div className="border rounded-4 p-3 text-center h-100">
                              <strong className="fs-5">
                                {recipe.nutrition.calories}
                              </strong>

                              <small className="text-secondary d-block">
                                kcal
                              </small>
                            </div>
                          </div>

                          <div className="col-6 col-md-3">
                            <div className="border rounded-4 p-3 text-center h-100">
                              <strong className="fs-5">
                                {recipe.nutrition.protein}g
                              </strong>

                              <small className="text-secondary d-block">
                                Proteína
                              </small>
                            </div>
                          </div>

                          <div className="col-6 col-md-3">
                            <div className="border rounded-4 p-3 text-center h-100">
                              <strong className="fs-5">
                                {recipe.nutrition.carbs}g
                              </strong>

                              <small className="text-secondary d-block">
                                Carbohidratos
                              </small>
                            </div>
                          </div>

                          <div className="col-6 col-md-3">
                            <div className="border rounded-4 p-3 text-center h-100">
                              <strong className="fs-5">
                                {recipe.nutrition.fat}g
                              </strong>

                              <small className="text-secondary d-block">
                                Grasas
                              </small>
                            </div>
                          </div>

                        </div>

                      </div>
                    )}

                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

