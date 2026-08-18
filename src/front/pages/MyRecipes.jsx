import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteError, setFavoriteError] = useState("");
  const [favoriteLoading, setFavoriteLoading] = useState(null);

  const token = localStorage.getItem("token");
  const url = import.meta.env.VITE_BACKEND_URL;

  const navigate = useNavigate();

  useEffect(() => {
    const getRecipes = async () => {
      try {
        const response = await fetch(`${url}/api/recipes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "No se pudieron cargar las recetas");
        }

        setRecipes(data.recipes);

        const favoriteIds = data.recipes
          .filter((recipe) => recipe.is_favorite)
          .map((recipe) => recipe.id);

        setFavorites(new Set(favoriteIds));
      } catch (error) {
        console.error("ERROR:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getRecipes();
    } else {
      setLoading(false);
      setError("Debes iniciar sesión.");
    }
  }, [token, url]);

  const toggleFavorite = async (recipeId) => {
    if (favoriteLoading === recipeId) return;

    const isFavorite = favorites.has(recipeId);

    setFavoriteLoading(recipeId);
    setFavoriteError("");

    try {
      const response = await fetch(`${url}/api/favorites/${recipeId}`, {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.error || "";

        if (
          !isFavorite &&
          (response.status === 409 ||
            message.toLowerCase().includes("ya está en favoritos") ||
            message.toLowerCase().includes("ya esta en favoritos") ||
            message.toLowerCase().includes("already"))
        ) {
          setFavorites((prev) => {
            const newFavorites = new Set(prev);
            newFavorites.add(recipeId);
            return newFavorites;
          });

          return;
        }

        throw new Error(message || "No se pudo actualizar el favorito");
      }

      setFavorites((prev) => {
        const newFavorites = new Set(prev);

        if (isFavorite) {
          newFavorites.delete(recipeId);
        } else {
          newFavorites.add(recipeId);
        }

        return newFavorites;
      });
    } catch (error) {
      console.error("FAVORITE ERROR:", error);
      setFavoriteError(error.message);
    } finally {
      setFavoriteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="recipes-page loading-page">
        <div className="loading-content">
          <div className="loading-logo">🍳</div>

          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>

          <p>Cargando tus recetas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipes-page">
        <div className="container py-5">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h3>Algo ha salido mal</h3>
            <p>{error}</p>
            <button
              className="btn btn-success rounded-pill px-4"
              onClick={() => window.location.reload()}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const favoriteCount = favorites.size;

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
    <div className="recipes-page">
      <div className="container py-5">
        {/* HEADER */}
        <header className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-4 mb-5">
          <div>
            <div className="premium-eyebrow mb-3">
              <span></span>
              TU COLECCIÓN PERSONAL
            </div>

            <h1 className="premium-title mb-3">
              Mis <em>recetas</em>
            </h1>

            <p className="premium-subtitle mb-0">
              Tu colección de recetas creadas con inteligencia artificial,
              cuidadosamente guardadas en un solo lugar.
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
        {recipes.length > 0 && (
          <div className="row g-3 mb-5">
            <div className="col-12 col-md-4">
              <div className="premium-stat">
                <div className="premium-stat-icon">
                  <i className="bi bi-journal-richtext"></i>
                </div>

                <div>
                  <span className="premium-stat-label">Colección</span>
                  <strong>{recipes.length}</strong>
                  <small>recetas creadas</small>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="premium-stat">
                <div className="premium-stat-icon favorite">
                  <i className="bi bi-heart-fill"></i>
                </div>

                <div>
                  <span className="premium-stat-label">Favoritos</span>
                  <strong>{favoriteCount}</strong>
                  <small>recetas guardadas</small>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="premium-stat">
                <div className="premium-stat-icon ai">
                  <i className="bi bi-stars"></i>
                </div>

                <div>
                  <span className="premium-stat-label">Tecnología</span>
                  <strong>IA</strong>
                  <small>recetas personalizadas</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ERROR FAVORITO */}
        {favoriteError && (
          <div className="alert premium-alert d-flex align-items-center gap-3 mb-4">
            <i className="bi bi-exclamation-circle-fill"></i>

            <span className="flex-grow-1">{favoriteError}</span>

            <button
              type="button"
              className="btn-close"
              onClick={() => setFavoriteError("")}
              aria-label="Cerrar"
            />
          </div>
        )}

        {/* EMPTY STATE */}
        {recipes.length === 0 ? (
          <div className="premium-empty">
            <div className="premium-empty-decoration"></div>

            <div className="premium-empty-icon">
              <i className="bi bi-stars"></i>
            </div>

            <span className="premium-eyebrow justify-content-center mb-3">
              EMPIEZA A CREAR
            </span>

            <h2>Tu cocina está esperando</h2>

            <p>
              Dile a la IA qué ingredientes tienes y descubre recetas
              personalizadas creadas especialmente para ti.
            </p>

            <button
              className="btn premium-primary-btn"
              onClick={() => navigate("/")}
            >
              <i className="bi bi-stars me-2"></i>
              Crear mi primera receta
            </button>
          </div>
        ) : (
          <>
            {/* SECTION TITLE */}
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <div className="premium-section-label">TU COLECCIÓN</div>

                <h2 className="premium-section-title mb-1">Tus recetas</h2>

                <p className="text-muted mb-0">
                  {recipes.length} {recipes.length === 1 ? "receta" : "recetas"}{" "}
                  en tu colección
                </p>
              </div>
            </div>

            {/* RECIPES */}
            <div className="row g-4">
              {recipes.map((recipe) => {
                const isFavorite = favorites.has(recipe.id);
                const theme = recipeThemes[recipe.id % recipeThemes.length];

                return (
                  <div key={recipe.id} className="col-12 col-md-6 col-xl-4">
                    <article className="premium-recipe-card">
                      {/* IMAGE / HERO */}
                      <div
                        className="premium-recipe-image"
                        style={{ background: theme.background }}
                      >
                        <div className="premium-image-overlay"></div>

                        <div className="premium-recipe-icon">
                          <i className={`bi ${theme.icon}`}></i>
                        </div>

                        <div className="premium-ai-badge">
                          <i className="bi bi-stars"></i>
                          Generada con IA
                        </div>

                        <button
                          type="button"
                          className={`premium-favorite ${
                            isFavorite ? "active" : ""
                          }`}
                          onClick={() => toggleFavorite(recipe.id)}
                          disabled={favoriteLoading === recipe.id}
                          title={
                            isFavorite
                              ? "Quitar de favoritos"
                              : "Añadir a favoritos"
                          }
                          aria-label={
                            isFavorite
                              ? "Quitar de favoritos"
                              : "Añadir a favoritos"
                          }
                        >
                          {favoriteLoading === recipe.id ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : (
                            <i
                              className={`bi ${
                                isFavorite ? "bi-heart-fill" : "bi-heart"
                              }`}
                            ></i>
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
          </>
        )}
      </div>
    </div>
  );
};

export default MyRecipes;
