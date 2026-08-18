import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(null);

  const token = localStorage.getItem("token");
  const url = import.meta.env.VITE_BACKEND_URL;

  const [selectedObjective, setSelectedObjective] = useState("all");

  const navigate = useNavigate();

  // ============================================================
  // OBTENER FAVORITOS
  // ============================================================

  useEffect(() => {
    const getFavorites = async () => {
      try {
        const response = await fetch(`${url}/api/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "No se pudieron cargar los favoritos");
        }

        setFavorites(data.favorites || []);
      } catch (error) {
        console.error("FAVORITES ERROR:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getFavorites();
    } else {
      setLoading(false);
      setError("Debes iniciar sesión.");
    }
  }, [token, url]);

  // ============================================================
  // ELIMINAR FAVORITO
  // ============================================================

  const removeFavorite = async (recipeId) => {
    if (removing === recipeId) {
      return;
    }

    setRemoving(recipeId);

    try {
      const response = await fetch(`${url}/api/favorites/${recipeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo eliminar el favorito");
      }

      setFavorites((prevFavorites) =>
        prevFavorites.filter((favorite) => favorite.recipe_id !== recipeId),
      );
    } catch (error) {
      console.error("REMOVE FAVORITE ERROR:", error);

      setError(error.message);
    } finally {
      setRemoving(null);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="favorites-page favorites-loading">
        <div className="favorites-loading-content">
          <div className="favorites-loading-icon">♥</div>

          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>

          <p>Cargando tus favoritos...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="favorites-page">
        <div className="container py-5">
          <div className="favorites-error">
            <div className="favorites-error-icon">⚠️</div>

            <h3>Algo ha salido mal</h3>

            <p>{error}</p>

            <button
              className="favorites-primary-btn"
              onClick={() => window.location.reload()}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const objectiveLabels = {
    lose_weight: {
      label: "Perder peso",
      icon: "🔥",
      color: "#ef4444",
      background: "rgba(239, 68, 68, 0.12)",
    },
    maintain_weight: {
      label: "Mantener peso",
      icon: "⚖️",
      color: "#3b82f6",
      background: "rgba(59, 130, 246, 0.12)",
    },
    gain_muscle: {
      label: "Ganar masa muscular",
      icon: "💪",
      color: "#8b5cf6",
      background: "rgba(139, 92, 246, 0.12)",
    },
    body_recomposition: {
      label: "Perder grasa y ganar músculo",
      icon: "🏋️",
      color: "#f97316",
      background: "rgba(249, 115, 22, 0.12)",
    },
    sports_performance: {
      label: "Rendimiento deportivo",
      icon: "🏃",
      color: "#10b981",
      background: "rgba(16, 185, 129, 0.12)",
    },
    competition_prep: {
      label: "Preparación competición",
      icon: "🏆",
      color: "#eab308",
      background: "rgba(234, 179, 8, 0.12)",
    },
    healthy_eating: {
      label: "Alimentación saludable",
      icon: "🥗",
      color: "#22c55e",
      background: "rgba(34, 197, 94, 0.12)",
    },
  };

  const filteredFavorites =
    selectedObjective === "all"
      ? favorites
      : favorites.filter(
          (favorite) => favorite.recipe?.objective === selectedObjective,
        );

  const objectiveCounts = favorites.reduce((acc, favorite) => {
    const objective = favorite.recipe?.objective;

    if (objective) {
      acc[objective] = (acc[objective] || 0) + 1;
    }

    return acc;
  }, {});

  // ============================================================
  // RENDER
  // ============================================================

  const recipeThemes = [
    {
      background: "linear-gradient(135deg, #dce9d9, #688a6c)",
      icon: "bi-egg-fried",
    },
    {
      background: "linear-gradient(135deg, #f5dfc8, #c98b5b)",
      icon: "bi-cup-hot",
    },
    {
      background: "linear-gradient(135deg, #f3d8d5, #bd7770)",
      icon: "bi-heart",
    },
    {
      background: "linear-gradient(135deg, #e5dfca, #a49463)",
      icon: "bi-basket",
    },
    {
      background: "linear-gradient(135deg, #d8e4ed, #6d8fa5)",
      icon: "bi-droplet",
    },
    {
      background: "linear-gradient(135deg, #e8dfed, #9279a5)",
      icon: "bi-stars",
    },
  ];

  return (
    <div className="favorites-page">
      <div className="container py-5">
        {/* HEADER */}
        <header className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-4 mb-5">
          <div>
            <div className="premium-eyebrow mb-3 favorites-eyebrow">
              <span></span>
              TU COLECCIÓN PERSONAL
            </div>

            <h1 className="premium-title mb-3">
              Recetas que <em>te encantan</em>
            </h1>

            <p className="premium-subtitle mb-0">
              Guarda tus recetas favoritas y tenlas siempre a mano cuando
              quieras volver a prepararlas.
            </p>
          </div>

          <button
            className="btn premium-primary-btn"
            onClick={() => navigate("/")}
          >
            <span className="plus-icon">+</span>
            Crear receta
          </button>
        </header>

        {/* STATS */}
        {favorites.length > 0 && (
          <div className="row g-3 mb-5">
            <div className="col-12 col-md-4">
              <div className="premium-stat">
                <div className="premium-stat-icon favorite">
                  <i className="bi bi-heart-fill"></i>
                </div>

                <div>
                  <span className="premium-stat-label">Colección</span>

                  <strong>{favorites.length}</strong>

                  <small>
                    {favorites.length === 1
                      ? "receta favorita"
                      : "recetas favoritas"}
                  </small>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="premium-stat">
                <div className="premium-stat-icon">
                  <i className="bi bi-bookmark-heart"></i>
                </div>

                <div>
                  <span className="premium-stat-label">Guardadas</span>

                  <strong>♡</strong>

                  <small>para volver cuando quieras</small>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="premium-stat">
                <div className="premium-stat-icon ai">
                  <i className="bi bi-stars"></i>
                </div>

                <div>
                  <span className="premium-stat-label">Personalizadas</span>

                  <strong>IA</strong>

                  <small>según tus objetivos</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {favorites.length === 0 ? (
          <div className="premium-empty favorites-empty">
            <div className="premium-empty-decoration"></div>

            <div className="premium-empty-icon favorites-empty-icon">
              <i className="bi bi-heart"></i>
            </div>

            <span className="premium-eyebrow justify-content-center mb-3">
              TU COLECCIÓN ESTÁ VACÍA
            </span>

            <h2>Guarda tus recetas favoritas</h2>

            <p>
              Cuando encuentres una receta que te encante, pulsa el corazón para
              guardarla aquí y volver a ella fácilmente.
            </p>

            <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
              <button
                className="btn premium-primary-btn"
                onClick={() => navigate("/my-recipes")}
              >
                <i className="bi bi-journal-richtext me-2"></i>
                Ver mis recetas
              </button>

              <button
                className="btn favorites-secondary-btn"
                onClick={() => navigate("/")}
              >
                <i className="bi bi-stars me-2"></i>
                Crear una receta
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* SECTION HEADER */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
              <div>
                <div className="premium-section-label">TU COLECCIÓN</div>

                <h2 className="premium-section-title mb-1">Tus favoritas</h2>

                <p className="text-muted mb-0">
                  Las recetas que has decidido guardar.
                </p>
              </div>

              <div className="favorites-total">
                {filteredFavorites.length}
                <span>
                  {filteredFavorites.length === 1 ? " receta" : " recetas"}
                </span>
              </div>
            </div>

            {/* FILTERS */}
            <div className="favorites-filters mb-5">
              <button
                type="button"
                className={`favorites-filter ${
                  selectedObjective === "all" ? "active" : ""
                }`}
                onClick={() => setSelectedObjective("all")}
              >
                <i className="bi bi-grid"></i>
                Todas
                <strong>{favorites.length}</strong>
              </button>

              {Object.entries(objectiveLabels).map(([value, objective]) => {
                const count = objectiveCounts[value] || 0;

                if (count === 0) return null;

                return (
                  <button
                    key={value}
                    type="button"
                    className={`favorites-filter ${
                      selectedObjective === value ? "active" : ""
                    }`}
                    onClick={() => setSelectedObjective(value)}
                    style={{
                      "--filter-color": objective.color,
                      "--filter-background": objective.background,
                    }}
                  >
                    <span>{objective.icon}</span>

                    {objective.label}

                    <strong>{count}</strong>
                  </button>
                );
              })}
            </div>

            {/* CARDS */}
            <div className="row g-4">
              {filteredFavorites.map((favorite) => {
                const recipe = favorite.recipe;
                const theme = recipeThemes[recipe.id % recipeThemes.length];
                if (!recipe) return null;

                const objective = objectiveLabels[recipe.objective];

                return (
                  <div key={favorite.id} className="col-12 col-md-6 col-xl-4">
                    <article className="premium-recipe-card favorite-premium-card">
                      {/* VISUAL */}
                      <div
                        className="premium-recipe-image"
                        style={{ background: theme.background }}
                      >
                        <div className="premium-image-overlay"></div>

                        <div className="premium-recipe-icon">
                          <i className={`bi ${theme.icon}`}></i>
                        </div>

                        {/* OBJECTIVE */}
                        {objective && (
                          <div
                            className="favorite-objective-badge"
                            style={{
                              "--objective-color": objective.color,
                              "--objective-background": objective.background,
                            }}
                          >
                            <span>{objective.icon}</span>
                            {objective.label}
                          </div>
                        )}

                        {/* FAVORITE */}
                        <button
                          type="button"
                          className="premium-favorite active"
                          onClick={() => removeFavorite(recipe.id)}
                          disabled={removing === recipe.id}
                          title="Quitar de favoritos"
                          aria-label="Quitar de favoritos"
                        >
                          {removing === recipe.id ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                            />
                          ) : (
                            <i className="bi bi-heart-fill"></i>
                          )}
                        </button>
                      </div>

                      {/* CONTENT */}
                      <div className="premium-recipe-body">
                        <h3>{recipe.title}</h3>

                        <p className="premium-recipe-description">
                          {recipe.description}
                        </p>

                        <div className="premium-recipe-meta">
                          <div>
                            <i className="bi bi-clock"></i>
                            <span>{recipe.prep_time} min</span>
                          </div>

                          <div>
                            <i className="bi bi-fire"></i>
                            <span>{recipe.calories} kcal</span>
                          </div>

                          <div>
                            <i className="bi bi-people"></i>
                            <span>{recipe.servings}</span>
                          </div>
                        </div>

                        <button
                          className="premium-view-btn"
                          onClick={() => navigate(`/recipe/${recipe.id}`)}
                        >
                          <span>Ver receta</span>

                          <span className="premium-arrow">
                            <i className="bi bi-arrow-up-right"></i>
                          </span>
                        </button>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>

            {/* BOTTOM CTA */}
            <div className="favorites-bottom-cta mt-5">
              <div className="favorites-bottom-icon">
                <i className="bi bi-stars"></i>
              </div>

              <div className="flex-grow-1">
                <div className="premium-section-label mb-1">INSPIRACIÓN</div>

                <h3>¿Quieres descubrir algo nuevo?</h3>

                <p>
                  Crea una nueva receta personalizada con los ingredientes que
                  tengas en casa.
                </p>
              </div>

              <button
                className="btn premium-primary-btn"
                onClick={() => navigate("/")}
              >
                Crear receta
                <i className="bi bi-arrow-up-right"></i>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;
