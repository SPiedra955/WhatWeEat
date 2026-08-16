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
          throw new Error(
            data.error || "No se pudieron cargar las recetas"
          );
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
          (
            response.status === 409 ||
            message.toLowerCase().includes("ya está en favoritos") ||
            message.toLowerCase().includes("ya esta en favoritos") ||
            message.toLowerCase().includes("already")
          )
        ) {
          setFavorites((prev) => {
            const newFavorites = new Set(prev);
            newFavorites.add(recipeId);
            return newFavorites;
          });

          return;
        }

        throw new Error(
          message || "No se pudo actualizar el favorito"
        );
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

          <div
            className="spinner-border text-success"
            role="status"
          >
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

  return (
    <div className="recipes-page">
      <div className="container recipes-container">

        {/* HEADER */}
        <header className="recipes-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              TU COLECCIÓN PERSONAL
            </div>

            <h1>
              Mis <span>recetas</span>
            </h1>

            <p className="header-description">
              Descubre, guarda y disfruta de todas las recetas
              que has creado con inteligencia artificial.
            </p>
          </div>

          <button
            className="create-recipe-btn"
            onClick={() => navigate("/")}
          >
            <span>+</span>
            Crear receta
          </button>
        </header>

        {/* STATS */}
        {recipes.length > 0 && (
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon green">🍽️</div>
              <div>
                <strong>{recipes.length}</strong>
                <span>Recetas creadas</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon red">♥</div>
              <div>
                <strong>{favoriteCount}</strong>
                <span>Favoritas</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">✨</div>
              <div>
                <strong>IA</strong>
                <span>Recetas personalizadas</span>
              </div>
            </div>
          </div>
        )}

        {/* FAVORITE ERROR */}
        {favoriteError && (
          <div className="favorite-error">
            <span>⚠️</span>

            <span>{favoriteError}</span>

            <button
              type="button"
              onClick={() => setFavoriteError("")}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {recipes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <span>🍳</span>
            </div>

            <div className="empty-content">
              <span className="empty-label">
                EMPIEZA A CREAR
              </span>

              <h2>
                Tu cocina está esperando
              </h2>

              <p>
                Dile a la IA qué ingredientes tienes y crea
                recetas deliciosas en segundos.
              </p>

              <button
                className="create-recipe-btn"
                onClick={() => navigate("/")}
              >
                ✨ Crear mi primera receta
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="section-heading">
              <div>
                <h2>Tus recetas</h2>
                <p>
                  {recipes.length}{" "}
                  {recipes.length === 1 ? "receta" : "recetas"} en tu colección
                </p>
              </div>
            </div>

            {/* RECIPES */}
            <div className="row g-4">
              {recipes.map((recipe) => {
                const isFavorite = favorites.has(recipe.id);

                return (
                  <div
                    key={recipe.id}
                    className="col-12 col-md-6 col-xl-4"
                  >
                    <article className="recipe-card">

                      {/* TOP VISUAL */}
                      <div className="recipe-visual">
                        <div className="recipe-gradient" />

                        <div className="recipe-emoji">
                          🍽️
                        </div>

                        <div className="recipe-badge">
                          <span>✦</span>
                          Generada con IA
                        </div>

                        <button
                          type="button"
                          className={`favorite-button ${
                            isFavorite ? "active" : ""
                          }`}
                          onClick={() =>
                            toggleFavorite(recipe.id)
                          }
                          disabled={
                            favoriteLoading === recipe.id
                          }
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
                            <span>
                              {isFavorite ? "♥" : "♡"}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* CONTENT */}
                      <div className="recipe-content">

                        <h3>{recipe.title}</h3>

                        <p className="recipe-description">
                          {recipe.description}
                        </p>

                        <div className="recipe-meta">
                          <div>
                            <span className="meta-icon">⏱</span>
                            <span>
                              {recipe.prep_time} min
                            </span>
                          </div>

                          <div>
                            <span className="meta-icon">🔥</span>
                            <span>
                              {recipe.calories} kcal
                            </span>
                          </div>

                          <div>
                            <span className="meta-icon">👥</span>
                            <span>
                              {recipe.servings}
                            </span>
                          </div>
                        </div>

                        <button
                          className="view-recipe-btn"
                          onClick={() =>
                            navigate(`/recipe/${recipe.id}`)
                          }
                        >
                          <span>Ver receta</span>
                          <span className="arrow">→</span>
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