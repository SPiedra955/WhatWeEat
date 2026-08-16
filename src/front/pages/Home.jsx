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
          objective,
        }),
      });

      const data = await response.json();

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
        error.message ||
          "Ha ocurrido un error generando la receta."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setIngredients(
      "media bolsa de arroz, un filete de lomo, un tomate, media lechuga, aguacate, cebolla"
    );

    setServings(1);
    setObjective("healthy_eating");
    setError("");

    document
      .getElementById("recipe-generator")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const scrollToGenerator = () => {
    document
      .getElementById("recipe-generator")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <div className="home-page">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="home-hero">

        <div className="home-hero-decoration decoration-one" />
        <div className="home-hero-decoration decoration-two" />

        <div className="container position-relative">

          <div className="row align-items-center g-5">

            {/* LEFT */}

            <div className="col-lg-6">

              <div className="home-badge">
                <span>✨</span>
                Inteligencia artificial para tu cocina
              </div>

              <h1 className="home-title">
                Convierte tus ingredientes en
                <span> recetas increíbles.</span>
              </h1>

              <p className="home-description">
                Dile a la IA qué tienes en la nevera y crea
                recetas personalizadas según tus ingredientes,
                tus raciones y tus objetivos.
              </p>

              <div className="home-buttons">

                <button
                  className="home-primary-btn"
                  onClick={scrollToGenerator}
                >
                  <span>✨</span>
                  Crear mi receta
                  <span className="arrow">→</span>
                </button>

                <button
                  className="home-secondary-btn"
                  onClick={loadExample}
                >
                  Ver cómo funciona
                </button>

              </div>

              {/* TRUST */}

              <div className="home-trust">

                <div className="trust-avatars">
                  <span>👩🏻</span>
                  <span>👨🏼</span>
                  <span>👩🏽</span>
                  <span>👨🏻</span>
                </div>

                <div>
                  <div className="trust-stars">
                    ★★★★★
                  </div>

                  <small>
                    Cocina más fácil con IA
                  </small>
                </div>

              </div>

            </div>


            {/* RIGHT */}

            <div
              className="col-lg-6"
              id="recipe-generator"
            >

              <div className="generator-wrapper">

                <div className="generator-glow" />

                <div className="generator-card">

                  {/* HEADER */}

                  <div className="generator-header">

                    <div className="generator-icon">
                      👨‍🍳
                    </div>

                    <div>

                      <div className="generator-title">
                        Crea tu receta
                      </div>

                      <div className="generator-subtitle">
                        Tu asistente de cocina con IA
                      </div>

                    </div>

                    <div className="ai-status">
                      <span />
                      IA activa
                    </div>

                  </div>


                  {isAuthenticated ? (
                    <>

                      {/* INGREDIENTES */}

                      <div className="generator-field">

                        <label>
                          🥕 ¿Qué tienes en casa?
                        </label>

                        <div className="ingredients-input">

                          <textarea
                            rows="4"
                            placeholder="Ej: pollo, arroz, tomate, aguacate..."
                            value={ingredients}
                            onChange={(event) =>
                              setIngredients(
                                event.target.value
                              )
                            }
                            disabled={loading}
                          />

                          <div className="input-bottom">

                            <small>
                              Separa los ingredientes con comas
                            </small>

                            <span>
                              ✨ IA
                            </span>

                          </div>

                        </div>

                      </div>


                      {/* OPCIONES */}

                      <div className="generator-options">

                        <div className="generator-field">

                          <label>
                            👥 Personas
                          </label>

                          <select
                            value={servings}
                            onChange={(event) =>
                              setServings(
                                Number(event.target.value)
                              )
                            }
                            disabled={loading}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(
                              (number) => (
                                <option
                                  key={number}
                                  value={number}
                                >
                                  {number}{" "}
                                  {number === 1
                                    ? "persona"
                                    : "personas"}
                                </option>
                              )
                            )}
                          </select>

                        </div>


                        <div className="generator-field">

                          <label>
                            🎯 Objetivo
                          </label>

                          <select
                            value={objective}
                            onChange={(event) =>
                              setObjective(
                                event.target.value
                              )
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


                      {/* BUTTON */}

                      <button
                        className="generate-btn"
                        onClick={generateRecipe}
                        disabled={loading}
                      >

                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                            />

                            La IA está cocinando...
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            Generar mi receta
                            <span className="generate-arrow">
                              →
                            </span>
                          </>
                        )}

                      </button>


                      {error && (
                        <div className="generator-error">
                          <strong>
                            ⚠️ Algo ha ocurrido
                          </strong>

                          <span>
                            {error}
                          </span>
                        </div>
                      )}

                    </>
                  ) : (

                    /* LOGIN */

                    <div className="login-generator">

                      <div className="login-icon">
                        🔒
                      </div>

                      <h3>
                        Desbloquea tu chef IA
                      </h3>

                      <p>
                        Crea una cuenta gratuita y empieza
                        a transformar tus ingredientes en
                        recetas personalizadas.
                      </p>

                      <button
                        className="generate-btn"
                        onClick={() =>
                          navigate("/register")
                        }
                      >
                        ✨ Crear cuenta gratis
                      </button>

                      <button
                        className="login-btn"
                        onClick={() =>
                          navigate("/login")
                        }
                      >
                        Ya tengo una cuenta
                      </button>

                      <small>
                        🔐 Tus recetas se guardan de forma
                        segura en tu cuenta.
                      </small>

                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          BENEFITS
      ====================================================== */}

      <section className="home-benefits">

        <div className="container">

          <div className="section-heading">

            <span>
              TODO EN UN SOLO LUGAR
            </span>

            <h2>
              Tu cocina, ahora más inteligente.
            </h2>

            <p>
              Desde encontrar qué cocinar hasta guardar
              tus recetas favoritas.
            </p>

          </div>


          <div className="row g-4">

            <div className="col-md-6 col-lg-3">

              <div className="benefit-card">

                <div className="benefit-icon green">
                  🤖
                </div>

                <h3>
                  Recetas con IA
                </h3>

                <p>
                  Introduce tus ingredientes y deja que
                  nuestra IA haga el resto.
                </p>

              </div>

            </div>


            <div className="col-md-6 col-lg-3">

              <div className="benefit-card">

                <div className="benefit-icon orange">
                  🎯
                </div>

                <h3>
                  A tu medida
                </h3>

                <p>
                  Adapta cada receta a tus raciones y
                  objetivos nutricionales.
                </p>

              </div>

            </div>


            <div className="col-md-6 col-lg-3">

              <div className="benefit-card">

                <div className="benefit-icon red">
                  ❤️
                </div>

                <h3>
                  Tus favoritas
                </h3>

                <p>
                  Guarda las recetas que más te gustan
                  y encuéntralas cuando quieras.
                </p>

              </div>

            </div>


            <div className="col-md-6 col-lg-3">

              <div className="benefit-card">

                <div className="benefit-icon blue">
                  📄
                </div>

                <h3>
                  Llévatelas contigo
                </h3>

                <p>
                  Descarga tus recetas en PDF o
                  compártelas fácilmente.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="home-how">

        <div className="container">

          <div className="section-heading">

            <span>
              TAN FÁCIL COMO 1, 2, 3
            </span>

            <h2>
              De la nevera al plato.
            </h2>

          </div>


          <div className="row g-4">

            <div className="col-md-4">

              <div className="step-card">

                <div className="step-number">
                  01
                </div>

                <div className="step-icon">
                  🥕
                </div>

                <h3>
                  Dinos qué tienes
                </h3>

                <p>
                  Escribe los ingredientes que tienes
                  disponibles en casa.
                </p>

              </div>

            </div>


            <div className="col-md-4">

              <div className="step-card featured">

                <div className="step-number">
                  02
                </div>

                <div className="step-icon">
                  🤖
                </div>

                <h3>
                  La IA crea tu receta
                </h3>

                <p>
                  Nuestra IA combina tus ingredientes
                  y crea una receta personalizada.
                </p>

              </div>

            </div>


            <div className="col-md-4">

              <div className="step-card">

                <div className="step-number">
                  03
                </div>

                <div className="step-icon">
                  🍽️
                </div>

                <h3>
                  Cocina y disfruta
                </h3>

                <p>
                  Sigue los pasos, consulta la nutrición
                  y disfruta de tu creación.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="home-cta">

        <div className="container">

          <div className="home-cta-box">

            <div className="cta-decoration">
              ✨
            </div>

            <span>
              TU PRÓXIMA RECETA ESTÁ A UN CLIC
            </span>

            <h2>
              ¿Qué tienes hoy en la nevera?
            </h2>

            <p>
              Deja que la IA convierta tus ingredientes
              en algo delicioso.
            </p>

            <button
              onClick={scrollToGenerator}
              className="cta-button"
            >
              ✨ Crear mi receta
              <span>→</span>
            </button>

          </div>

        </div>

      </section>

    </div>
  );
};