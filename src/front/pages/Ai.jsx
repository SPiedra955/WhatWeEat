import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Ai = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [ingredients, setIngredients] = useState("");
  const [newIngredient, setNewIngredient] = useState("");
  const [servings, setServings] = useState(2);
  const [objective, setObjective] = useState("healthy_eating");

  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const url = import.meta.env.VITE_BACKEND_URL;

  const objectives = [
    {
      value: "lose_weight",
      label: "Perder peso",
      description: "Recetas ligeras y equilibradas",
      icon: "🔥",
    },
    {
      value: "maintain_weight",
      label: "Mantener peso",
      description: "Una alimentación equilibrada",
      icon: "⚖️",
    },
    {
      value: "gain_muscle",
      label: "Ganar masa muscular",
      description: "Más proteína y energía",
      icon: "💪",
    },
    {
      value: "body_recomposition",
      label: "Perder grasa y ganar músculo",
      description: "Equilibrio entre proteína y calorías",
      icon: "🏋️",
    },
    {
      value: "sports_performance",
      label: "Mejorar rendimiento deportivo",
      description: "Energía para entrenar mejor",
      icon: "🏃",
    },
    {
      value: "competition_prep",
      label: "Preparación para competición",
      description: "Alimentación orientada al rendimiento",
      icon: "🏆",
    },
    {
      value: "healthy_eating",
      label: "Alimentación saludable",
      description: "Comer mejor sin complicaciones",
      icon: "🥗",
    },
  ];

  const selectedObjective = objectives.find((item) => item.value === objective);

  /*
   * =========================================================
   * INGREDIENTES
   * =========================================================
   */

  const getIngredientList = () => {
    return ingredients
      .split(",")
      .map((ingredient) => ingredient.trim())
      .filter(Boolean);
  };

  const addIngredient = (ingredient) => {
    const cleanIngredient = ingredient.trim();

    if (!cleanIngredient) {
      return false;
    }

    const currentIngredients = getIngredientList();

    const exists = currentIngredients.some(
      (item) => item.toLowerCase() === cleanIngredient.toLowerCase(),
    );

    if (exists) {
      return false;
    }

    setIngredients([...currentIngredients, cleanIngredient].join(", "));

    return true;
  };

  const removeIngredient = (ingredientToRemove) => {
    const updatedIngredients = getIngredientList().filter(
      (ingredient) =>
        ingredient.toLowerCase() !== ingredientToRemove.toLowerCase(),
    );

    setIngredients(updatedIngredients.join(", "));
  };

  const handleAddIngredient = () => {
    const added = addIngredient(newIngredient);

    if (added) {
      setNewIngredient("");
    }
  };

  const handleIngredientKeyDown = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    handleAddIngredient();
  };

  /*
   * =========================================================
   * SUGERENCIAS IA
   * =========================================================
   */

  const getSuggestions = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Debes iniciar sesión para utilizar la IA.");
      return false;
    }

    if (!url) {
      setError(
        "No se ha configurado la URL del servidor. Revisa VITE_BACKEND_URL.",
      );
      return false;
    }

    const finalIngredients = getIngredientList();

    if (!finalIngredients.length) {
      setError("Necesitas al menos un ingrediente.");
      return false;
    }

    setLoadingSuggestions(true);
    setError("");

    try {
      const response = await fetch(`${url}/api/recipes/suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ingredients: finalIngredients,
          servings: Number(servings),
          objective,
        }),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        throw new Error("El servidor devolvió una respuesta que no es válida.");
      }

      if (!response.ok) {
        throw new Error(data?.error || "No se pudieron obtener sugerencias.");
      }

      const receivedSuggestions = Array.isArray(data?.suggestions)
        ? data.suggestions
        : [];

      setSuggestions(receivedSuggestions);

      return true;
    } catch (err) {
      console.error("SUGGESTIONS ERROR:", err);

      setSuggestions([]);

      setError(err?.message || "No se pudieron obtener sugerencias.");

      return false;
    } finally {
      setLoadingSuggestions(false);
    }
  };

  /*
   * =========================================================
   * RECARGAR SUGERENCIAS
   * =========================================================
   */

  const reloadSuggestions = async () => {
    setError("");

    const success = await getSuggestions();

    if (!success) {
      return;
    }
  };

  /*
   * =========================================================
   * GENERAR RECETA
   * =========================================================
   */

  const generateRecipe = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Debes iniciar sesión para utilizar la IA.");
      return;
    }

    if (!url) {
      setError(
        "No se ha configurado la URL del servidor. Revisa VITE_BACKEND_URL.",
      );
      return;
    }

    const finalIngredients = getIngredientList();

    if (!finalIngredients.length) {
      setError("Necesitas al menos un ingrediente.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${url}/api/recipes/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ingredients: finalIngredients,
          servings: Number(servings),
          objective,
        }),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        throw new Error("El servidor devolvió una respuesta que no es válida.");
      }

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo generar la receta.");
      }

      if (data?.recipe?.id) {
        navigate(`/recipe/${data.recipe.id}`);
        return;
      }

      throw new Error("La receta no tiene un ID válido.");
    } catch (err) {
      console.error("RECIPE ERROR:", err);

      setError(err?.message || "Ha ocurrido un error generando la receta.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * NAVEGACIÓN
   * =========================================================
   */

  const previousStep = () => {
    if (loading || loadingSuggestions) {
      return;
    }

    setError("");

    setStep((current) => Math.max(1, current - 1));
  };

  const nextStep = async () => {
    if (loading || loadingSuggestions) {
      return;
    }

    setError("");

    /*
     * PASO 1
     */

    if (step === 1) {
      const finalIngredients = getIngredientList();

      if (!finalIngredients.length) {
        setError("Introduce al menos un ingrediente.");
        return;
      }
    }

    /*
     * PASO 3
     *
     * Antes de pasar al paso 4 pedimos las sugerencias.
     */

    if (step === 3) {
      const success = await getSuggestions();

      if (!success) {
        return;
      }
    }

    setStep((current) => Math.min(5, current + 1));
  };

  const ingredientList = getIngredientList();

  return (
    <div
      className="ai-page min-vh-100"
      style={{
        background: "#f7f9f5",
      }}
    >
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <nav className="container py-4">
        <div className="d-flex align-items-center justify-content-between">
          <button
            type="button"
            className="btn btn-link text-dark text-decoration-none px-0 fw-semibold"
            onClick={() => navigate("/")}
            disabled={loading || loadingSuggestions}
          >
            ← Volver
          </button>

          <div className="fw-bold fs-5">
            <span className="me-2">✨</span>
            Chef IA
          </div>

          <div className="small text-secondary">Paso {step} de 5</div>
        </div>
      </nav>

      {/* =====================================================
          PROGRESS
      ===================================================== */}

      <div className="container">
        <div
          className="progress"
          style={{
            height: "5px",
            backgroundColor: "#e8eee5",
          }}
        >
          <div
            className="progress-bar"
            style={{
              width: `${(step / 5) * 100}%`,
              backgroundColor: "#62a45e",
              transition: "width .3s ease",
            }}
          />
        </div>
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-7">
            <div className="text-center py-5">
              {/* =================================================
                  STEP 1
              ================================================= */}

              {step === 1 && (
                <>
                  <StepIcon icon="🥕" />

                  <StepLabel>Paso 1 · Ingredientes</StepLabel>

                  <h1 className="display-5 fw-bold mb-3">
                    ¿Qué tienes en la cocina?
                  </h1>

                  <p className="text-secondary fs-5 mb-4">
                    Cuéntame qué ingredientes tienes disponibles.
                  </p>

                  <div className="text-start">
                    <textarea
                      className="form-control form-control-lg border-0 shadow-sm rounded-4 p-4"
                      rows="5"
                      value={ingredients}
                      onChange={(event) => setIngredients(event.target.value)}
                      placeholder="Ej: pollo, arroz, tomate, aguacate, cebolla..."
                      autoFocus
                      disabled={loading}
                    />

                    <div className="d-flex justify-content-between mt-2 px-2">
                      <small className="text-secondary">
                        Separa los ingredientes con comas
                      </small>

                      <small className="text-success fw-semibold">✨ IA</small>
                    </div>
                  </div>
                </>
              )}

              {/* =================================================
                  STEP 2
              ================================================= */}

              {step === 2 && (
                <>
                  <StepIcon icon="👥" />

                  <StepLabel>Paso 2 · Raciones</StepLabel>

                  <h1 className="display-5 fw-bold mb-3">
                    ¿Para cuántas personas?
                  </h1>

                  <p className="text-secondary fs-5 mb-5">
                    Ajustaremos las cantidades automáticamente.
                  </p>

                  <div className="row g-3">
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((number) => {
                      const active = servings === number;

                      return (
                        <div className="col-4 col-md-3" key={number}>
                          <button
                            type="button"
                            onClick={() => setServings(number)}
                            disabled={loading}
                            className="w-100 rounded-4 p-3 bg-white"
                            style={{
                              border: `1px solid ${
                                active ? "#62a45e" : "#e9ece8"
                              }`,
                              backgroundColor: active ? "#f0f8ed" : "white",
                              transition: "all .2s ease",
                            }}
                          >
                            <div className="fs-4 fw-bold">{number}</div>

                            <small>
                              {number === 1 ? "persona" : "personas"}
                            </small>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* =================================================
                  STEP 3
              ================================================= */}

              {step === 3 && (
                <>
                  <StepIcon icon="🎯" />

                  <StepLabel>Paso 3 · Objetivo</StepLabel>

                  <h1 className="display-5 fw-bold mb-3">
                    ¿Cuál es tu objetivo?
                  </h1>

                  <p className="text-secondary fs-5 mb-4">
                    Adaptaremos la receta a tus necesidades.
                  </p>

                  <div className="d-flex flex-column gap-2 text-start">
                    {objectives.map((item) => {
                      const active = objective === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setObjective(item.value)}
                          disabled={loading}
                          className="btn text-start border rounded-4 p-3 bg-white"
                          style={{
                            borderColor: active ? "#62a45e" : "#e9ece8",
                            backgroundColor: active ? "#f2f9ef" : "white",
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <div
                              className="d-flex align-items-center justify-content-center rounded-3 me-3"
                              style={{
                                width: 45,
                                height: 45,
                                background: active ? "#dff0da" : "#f4f6f3",
                                fontSize: 20,
                                flexShrink: 0,
                              }}
                            >
                              {item.icon}
                            </div>

                            <div className="flex-grow-1">
                              <div className="fw-bold">{item.label}</div>

                              <small className="text-secondary">
                                {item.description}
                              </small>
                            </div>

                            {active && (
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: 26,
                                  height: 26,
                                  background: "#62a45e",
                                  color: "white",
                                }}
                              >
                                ✓
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* =================================================
                  STEP 4
              ================================================= */}

              {step === 4 && (
                <>
                  <StepIcon icon="✨" />

                  <StepLabel>Paso 4 · Mejorar receta</StepLabel>

                  <h1 className="display-5 fw-bold mb-3">
                    ¿Quieres mejorar tus ingredientes?
                  </h1>

                  <p className="text-secondary fs-5 mb-4">
                    Analizaré lo que tienes y te propondré ingredientes que
                    podrían mejorar la receta.
                  </p>

                  {/* INGREDIENTES */}

                  <div className="card border-0 shadow-sm rounded-4 text-start mb-4">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <strong>🥕 Tus ingredientes</strong>

                        <span className="badge rounded-pill text-bg-light">
                          {ingredientList.length}
                        </span>
                      </div>

                      {ingredientList.length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {ingredientList.map((ingredient) => (
                            <span
                              key={ingredient}
                              className="badge rounded-pill px-3 py-2"
                              style={{
                                background: "#eef6eb",
                                color: "#477845",
                                fontSize: 13,
                              }}
                            >
                              {ingredient}

                              <button
                                type="button"
                                className="btn btn-sm p-0 ms-2"
                                style={{
                                  color: "#477845",
                                  lineHeight: 1,
                                }}
                                onClick={() => removeIngredient(ingredient)}
                                disabled={loading}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-secondary small">
                          No tienes ingredientes.
                        </div>
                      )}

                      {/* AÑADIR MANUALMENTE */}

                      <div className="input-group mt-4">
                        <input
                          type="text"
                          className="form-control rounded-start-3"
                          placeholder="Añadir ingrediente..."
                          value={newIngredient}
                          onChange={(event) =>
                            setNewIngredient(event.target.value)
                          }
                          onKeyDown={handleIngredientKeyDown}
                          disabled={loading}
                        />

                        <button
                          type="button"
                          className="btn btn-dark"
                          onClick={handleAddIngredient}
                          disabled={loading || !newIngredient.trim()}
                        >
                          Añadir
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SUGERENCIAS */}

                  <div
                    className="card border-0 rounded-4 text-start overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(145deg, #ffffff 0%, #f7fbf5 100%)",
                      boxShadow: "0 12px 40px rgba(50, 80, 45, 0.08)",
                      border: "1px solid rgba(98, 164, 94, 0.10)",
                    }}
                  >
                    <div className="card-body p-4 p-md-5">
                      {/* HEADER */}

                      <div className="d-flex align-items-start justify-content-between gap-3 mb-4">
                        <div className="d-flex align-items-center">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-4 me-3"
                            style={{
                              width: 52,
                              height: 52,
                              background:
                                "linear-gradient(135deg, #dff3da 0%, #edf8e9 100%)",
                              boxShadow: "0 6px 18px rgba(98, 164, 94, 0.12)",
                              fontSize: 23,
                            }}
                          >
                            ✨
                          </div>

                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <strong
                                style={{
                                  fontSize: 17,
                                  color: "#172017",
                                }}
                              >
                                Sugerencias de la IA
                              </strong>

                              <span
                                className="badge rounded-pill"
                                style={{
                                  background: "#e5f4e0",
                                  color: "#4f8b4b",
                                  fontSize: 10,
                                  letterSpacing: "0.5px",
                                  padding: "5px 8px",
                                }}
                              >
                                IA
                              </span>
                            </div>

                            <div
                              className="small mt-1"
                              style={{
                                color: "#7a8578",
                              }}
                            >
                              Mejora tu receta con ingredientes seleccionados.
                            </div>
                          </div>
                        </div>

                        {/* REGENERAR */}

                        <button
                          type="button"
                          onClick={reloadSuggestions}
                          disabled={loadingSuggestions}
                          className="btn rounded-3 px-3 py-2 fw-semibold d-flex align-items-center"
                          style={{
                            background: loadingSuggestions
                              ? "#f0f3ef"
                              : "#ffffff",
                            border: "1px solid #dfe8dc",
                            color: "#477845",
                            whiteSpace: "nowrap",
                            boxShadow: "0 3px 10px rgba(40, 70, 35, 0.05)",
                          }}
                        >
                          {loadingSuggestions ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              />
                              Analizando
                            </>
                          ) : (
                            <>
                              <span
                                style={{
                                  fontSize: 17,
                                  lineHeight: 1,
                                  marginRight: 6,
                                }}
                              >
                                ↻
                              </span>
                              Regenerar
                            </>
                          )}
                        </button>
                      </div>

                      {/* SEPARATOR */}

                      <div
                        style={{
                          height: 1,
                          background:
                            "linear-gradient(90deg, transparent, #e4ece1, transparent)",
                          marginBottom: 22,
                        }}
                      />

                      {/* LOADING */}

                      {loadingSuggestions && (
                        <div
                          className="rounded-4 p-4 text-center"
                          style={{
                            background: "#f5f9f3",
                            border: "1px solid #e7efe4",
                          }}
                        >
                          <div
                            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                            style={{
                              width: 48,
                              height: 48,
                              background: "#e2f1de",
                            }}
                          >
                            <span
                              className="spinner-border spinner-border-sm"
                              style={{
                                color: "#62a45e",
                              }}
                            />
                          </div>

                          <div
                            className="fw-semibold"
                            style={{
                              color: "#263226",
                            }}
                          >
                            Analizando tus ingredientes...
                          </div>

                          <div
                            className="small mt-1"
                            style={{
                              color: "#7b8779",
                            }}
                          >
                            Buscando combinaciones que encajen con tu objetivo.
                          </div>
                        </div>
                      )}

                      {/* EMPTY */}

                      {!loadingSuggestions && suggestions.length === 0 && (
                        <div
                          className="rounded-4 p-4 p-md-5 text-center"
                          style={{
                            background:
                              "linear-gradient(135deg, #f7faf5 0%, #eef6eb 100%)",
                            border: "1px dashed #cdddc8",
                          }}
                        >
                          <div
                            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                            style={{
                              width: 64,
                              height: 64,
                              background: "#e1f0dd",
                              fontSize: 27,
                              boxShadow: "0 8px 20px rgba(98, 164, 94, 0.10)",
                            }}
                          >
                            ✨
                          </div>

                          <div
                            className="fw-bold mb-1"
                            style={{
                              color: "#263226",
                              fontSize: 16,
                            }}
                          >
                            Descubre cómo mejorar tu receta
                          </div>

                          <div
                            className="small"
                            style={{
                              color: "#7b8779",
                              maxWidth: 420,
                              margin: "0 auto",
                              lineHeight: 1.6,
                            }}
                          >
                            Nuestra IA analizará tus ingredientes y te propondrá
                            combinaciones para conseguir una receta todavía
                            mejor.
                          </div>

                          <button
                            type="button"
                            onClick={reloadSuggestions}
                            className="btn rounded-3 mt-4 px-4 py-2 fw-semibold"
                            style={{
                              background: "#121713",
                              color: "#ffffff",
                            }}
                            disabled={loadingSuggestions}
                          >
                            ✨ Analizar ingredientes
                          </button>
                        </div>
                      )}

                      {/* SUGGESTIONS */}

                      {!loadingSuggestions && suggestions.length > 0 && (
                        <div className="d-flex flex-column gap-3">
                          {suggestions.map((suggestion, index) => {
                            const alreadyAdded = ingredientList.some(
                              (ingredient) =>
                                ingredient.toLowerCase() ===
                                suggestion.name.toLowerCase(),
                            );

                            return (
                              <div
                                key={`${suggestion.name}-${index}`}
                                className="suggestion-card rounded-4 p-3 p-md-4"
                                style={{
                                  background: "#ffffff",
                                  border: "1px solid #e8eee5",
                                  boxShadow:
                                    "0 4px 16px rgba(40, 65, 35, 0.04)",
                                  transition:
                                    "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateY(-2px)";
                                  e.currentTarget.style.boxShadow =
                                    "0 10px 25px rgba(40, 65, 35, 0.08)";
                                  e.currentTarget.style.borderColor = "#d2e4cd";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateY(0)";
                                  e.currentTarget.style.boxShadow =
                                    "0 4px 16px rgba(40, 65, 35, 0.04)";
                                  e.currentTarget.style.borderColor = "#e8eee5";
                                }}
                              >
                                <div className="d-flex align-items-center gap-3">
                                  {/* ICON */}

                                  <div
                                    className="d-flex align-items-center justify-content-center rounded-4 flex-shrink-0"
                                    style={{
                                      width: 54,
                                      height: 54,
                                      background:
                                        "linear-gradient(135deg, #edf7ea 0%, #e1f0dd 100%)",
                                      fontSize: 25,
                                    }}
                                  >
                                    {suggestion.icon || "🥕"}
                                  </div>

                                  {/* CONTENT */}

                                  <div className="flex-grow-1 min-w-0">
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                      <span
                                        className="fw-bold"
                                        style={{
                                          color: "#202a20",
                                          fontSize: 15,
                                        }}
                                      >
                                        {suggestion.name}
                                      </span>

                                      {suggestion.type === "add" && (
                                        <span
                                          className="badge rounded-pill"
                                          style={{
                                            background: "#eef7eb",
                                            color: "#5b9456",
                                            fontSize: 10,
                                          }}
                                        >
                                          RECOMENDADO
                                        </span>
                                      )}

                                      {suggestion.type === "replace" && (
                                        <span
                                          className="badge rounded-pill"
                                          style={{
                                            background: "#f8f1df",
                                            color: "#9a7a32",
                                            fontSize: 10,
                                          }}
                                        >
                                          ALTERNATIVA
                                        </span>
                                      )}
                                    </div>

                                    <div
                                      className="small mt-1"
                                      style={{
                                        color: "#7b8579",
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {suggestion.reason}
                                    </div>

                                    {suggestion.type === "replace" &&
                                      suggestion.replace && (
                                        <div
                                          className="small mt-2 fw-semibold"
                                          style={{
                                            color: "#8b7135",
                                          }}
                                        >
                                          Sustituye a: {suggestion.replace}
                                        </div>
                                      )}
                                  </div>

                                  {/* ACTION */}

                                  <div className="flex-shrink-0">
                                    {alreadyAdded ? (
                                      <span
                                        className="d-inline-flex align-items-center gap-1 rounded-pill px-3 py-2 fw-semibold"
                                        style={{
                                          background: "#e8f5e5",
                                          color: "#4d8b49",
                                          fontSize: 12,
                                        }}
                                      >
                                        <span>✓</span>
                                        Añadido
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        className="btn rounded-3 px-3 py-2 fw-semibold"
                                        onClick={() =>
                                          addIngredient(suggestion.name)
                                        }
                                        style={{
                                          background: "#121713",
                                          color: "#ffffff",
                                          fontSize: 12,
                                          boxShadow:
                                            "0 4px 12px rgba(18, 23, 19, 0.12)",
                                        }}
                                      >
                                        + Añadir
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* FOOTER */}

                          <div
                            className="d-flex align-items-center justify-content-center gap-2 pt-2"
                            style={{
                              color: "#879184",
                              fontSize: 12,
                            }}
                          >
                            <span>✨</span>

                            <span>
                              Puedes añadir o ignorar cualquier sugerencia.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* =================================================
                  STEP 5
              ================================================= */}

              {step === 5 && (
                <>
                  <StepIcon icon="🍽️" />

                  <StepLabel>Paso 5 · Confirmación</StepLabel>

                  <h1 className="display-5 fw-bold mb-3">
                    Tu receta está lista para crearse.
                  </h1>

                  <p className="text-secondary fs-5 mb-4">
                    Comprueba tus preferencias y deja que la IA haga el resto.
                  </p>

                  <div className="card border-0 shadow-sm rounded-4 text-start">
                    <div className="card-body p-4">
                      {/* INGREDIENTES */}

                      <div className="mb-4">
                        <small className="text-secondary d-block mb-2">
                          🥕 Ingredientes
                        </small>

                        <div className="d-flex flex-wrap gap-2">
                          {ingredientList.map((ingredient) => (
                            <span
                              key={ingredient}
                              className="badge rounded-pill"
                              style={{
                                background: "#eef6eb",
                                color: "#477845",
                                padding: "8px 12px",
                              }}
                            >
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* RACIONES */}

                      <div className="d-flex gap-3 mb-4">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: 45,
                            height: 45,
                            background: "#e7f4e3",
                            flexShrink: 0,
                          }}
                        >
                          👥
                        </div>

                        <div>
                          <small className="text-secondary d-block">
                            Raciones
                          </small>

                          <strong>
                            {servings} {servings === 1 ? "persona" : "personas"}
                          </strong>
                        </div>
                      </div>

                      {/* OBJETIVO */}

                      <div className="d-flex gap-3">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: 45,
                            height: 45,
                            background: "#e7f4e3",
                            flexShrink: 0,
                          }}
                        >
                          {selectedObjective?.icon}
                        </div>

                        <div>
                          <small className="text-secondary d-block">
                            Objetivo
                          </small>

                          <strong>{selectedObjective?.label}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="alert border-0 rounded-4 mt-3 text-start d-flex align-items-center gap-3"
                    style={{
                      background: "#f0f8ed",
                      color: "#416c3f",
                    }}
                  >
                    <span className="fs-4">✨</span>

                    <div>
                      <strong>Tu chef IA está preparado</strong>

                      <div className="small mt-1">
                        Crearemos una receta personalizada utilizando tus
                        ingredientes.
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="alert alert-danger mt-4 rounded-4 text-start">
                  ⚠️ {error}
                </div>
              )}

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="d-flex align-items-center gap-3 mt-5">
                {step > 1 && (
                  <button
                    type="button"
                    className="btn btn-light rounded-3 px-4 py-3 fw-semibold"
                    onClick={previousStep}
                    disabled={loading || loadingSuggestions}
                  >
                    ← Atrás
                  </button>
                )}

                <div className="flex-grow-1" />

                {step < 5 ? (
                  <button
                    type="button"
                    className="btn rounded-3 px-4 py-3 fw-bold text-white"
                    style={{
                      background: "#121713",
                    }}
                    onClick={nextStep}
                    disabled={loading || loadingSuggestions}
                  >
                    {loadingSuggestions ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                        Analizando...
                      </>
                    ) : (
                      <>
                        Continuar
                        <span className="ms-3">→</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn rounded-3 px-4 py-3 fw-bold text-white"
                    style={{
                      background: "#121713",
                    }}
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
                        Creando receta...
                      </>
                    ) : (
                      <>
                        ✨ Generar mi receta
                        <span className="ms-3">→</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/*
 * =========================================================
 * COMPONENTES AUXILIARES
 * =========================================================
 */

const StepIcon = ({ icon }) => (
  <div
    className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-4"
    style={{
      width: 64,
      height: 64,
      background: "#e7f4e3",
      fontSize: 28,
    }}
  >
    {icon}
  </div>
);

const StepLabel = ({ children }) => (
  <div
    className="text-uppercase fw-bold small mb-3"
    style={{
      color: "#62a45e",
      letterSpacing: "2px",
    }}
  >
    {children}
  </div>
);

export default Ai;
