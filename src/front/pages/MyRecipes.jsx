import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [favorites, setFavorites] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [favoriteLoading, setFavoriteLoading] = useState(null);

    const token = localStorage.getItem("token");
    const url = import.meta.env.VITE_BACKEND_URL;

    const navigate = useNavigate();

    useEffect(() => {
        const getRecipes = async () => {
            try {
                const response = await fetch(
                    `${url}/api/recipes`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || "No se pudieron cargar las recetas"
                    );
                }

                setRecipes(data.recipes);

                // Si el backend devuelve is_favorite
                const favoriteIds = data.recipes
                    .filter(recipe => recipe.is_favorite)
                    .map(recipe => recipe.id);

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

        try {
            const response = await fetch(
                `${url}/api/favorites/${recipeId}`,
                {
                    method: isFavorite ? "DELETE" : "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "No se pudo actualizar el favorito"
                );
            }

            setFavorites(prev => {
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
            setError(error.message);
        } finally {
            setFavoriteLoading(null);
        }
    };


    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div
                    className="spinner-border text-success"
                    role="status"
                >
                    <span className="visually-hidden">
                        Cargando...
                    </span>
                </div>

                <p className="text-muted mt-3">
                    Cargando tus recetas...
                </p>
            </div>
        );
    }


    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    {error}
                </div>
            </div>
        );
    }


    return (
        <div className="bg-light min-vh-100 py-5">

            <div className="container">

                <div className="mb-5">
                    <h1 className="fw-bold">
                        🍽️ Mis recetas
                    </h1>

                    <p className="text-secondary">
                        Todas las recetas que has creado con la IA.
                    </p>
                </div>


                {recipes.length === 0 ? (

                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body text-center py-5">

                            <div className="fs-1 mb-3">
                                🍳
                            </div>

                            <h4 className="fw-bold">
                                Todavía no tienes recetas
                            </h4>

                            <p className="text-secondary">
                                Genera tu primera receta con los
                                ingredientes que tengas en casa.
                            </p>

                            <button
                                className="btn btn-success rounded-pill px-4"
                                onClick={() => navigate("/")}
                            >
                                ✨ Crear receta
                            </button>

                        </div>
                    </div>

                ) : (

                    <div className="row g-4">

                        {recipes.map((recipe) => {

                            const isFavorite = favorites.has(recipe.id);

                            return (
                                <div
                                    key={recipe.id}
                                    className="col-12 col-md-6 col-lg-4"
                                >

                                    <div className="card border-0 shadow-sm rounded-4 h-100">

                                        <div className="card-body p-4">

                                            <div className="d-flex justify-content-between align-items-start mb-3">

                                                <span className="badge bg-success-subtle text-success">
                                                    🤖 IA
                                                </span>

                                                <div className="d-flex align-items-center gap-2">

                                                    <small className="text-muted">
                                                        👥 {recipe.servings}
                                                    </small>

                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm rounded-circle ${
                                                            isFavorite
                                                                ? "btn-danger"
                                                                : "btn-outline-danger"
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
                                                    >
                                                        {favoriteLoading === recipe.id ? (
                                                            <span
                                                                className="spinner-border spinner-border-sm"
                                                                role="status"
                                                            />
                                                        ) : (
                                                            isFavorite
                                                                ? "❤️"
                                                                : "🤍"
                                                        )}
                                                    </button>

                                                </div>

                                            </div>


                                            <h4 className="fw-bold">
                                                {recipe.title}
                                            </h4>

                                            <p className="text-secondary small">
                                                {recipe.description}
                                            </p>


                                            <div className="d-flex gap-3 small text-muted mb-4">

                                                <span>
                                                    ⏱️ {recipe.prep_time} min
                                                </span>

                                                <span>
                                                    🔥 {recipe.calories} kcal
                                                </span>

                                            </div>


                                            <button
                                                className="btn btn-success w-100 rounded-pill"
                                                onClick={() =>
                                                    navigate(
                                                        `/recipe/${recipe.id}`
                                                    )
                                                }
                                            >
                                                Ver receta
                                            </button>

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                )}

            </div>

        </div>
    );
};

export default MyRecipes;