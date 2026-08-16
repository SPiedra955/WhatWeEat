import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removing, setRemoving] = useState(null);

    const token = localStorage.getItem("token");
    const url = import.meta.env.VITE_BACKEND_URL;

    const navigate = useNavigate();

    // ============================================================
    // OBTENER FAVORITOS
    // ============================================================

    useEffect(() => {
        const getFavorites = async () => {
            try {
                const response = await fetch(
                    `${url}/api/favorites`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                console.log("FAVORITES RESPONSE:", data);

                if (!response.ok) {
                    throw new Error(
                        data.error || "No se pudieron cargar los favoritos"
                    );
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
            const response = await fetch(
                `${url}/api/favorites/${recipeId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            console.log("REMOVE FAVORITE RESPONSE:", data);

            if (!response.ok) {
                throw new Error(
                    data.error || "No se pudo eliminar el favorito"
                );
            }

            // Eliminarlo de la lista sin hacer otra petición
            setFavorites((prevFavorites) =>
                prevFavorites.filter(
                    (favorite) => favorite.recipe_id !== recipeId
                )
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
                    Cargando tus favoritos...
                </p>

            </div>
        );
    }


    // ============================================================
    // ERROR
    // ============================================================

    if (error) {
        return (
            <div className="container py-5">

                <div className="alert alert-danger">
                    {error}
                </div>

            </div>
        );
    }


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="bg-light min-vh-100 py-5">

            <div className="container">

                <div className="mb-5">

                    <h1 className="fw-bold">
                        ❤️ Mis favoritos
                    </h1>

                    <p className="text-secondary">
                        Las recetas que has guardado como favoritas.
                    </p>

                </div>


                {favorites.length === 0 ? (

                    // ====================================================
                    // SIN FAVORITOS
                    // ====================================================

                    <div className="card border-0 shadow-sm rounded-4">

                        <div className="card-body text-center py-5">

                            <div className="fs-1 mb-3">
                                🤍
                            </div>

                            <h4 className="fw-bold">
                                Todavía no tienes favoritos
                            </h4>

                            <p className="text-secondary">
                                Guarda tus recetas favoritas para
                                encontrarlas fácilmente después.
                            </p>

                            <button
                                className="btn btn-success rounded-pill px-4"
                                onClick={() => navigate("/my-recipes")}
                            >
                                🍽️ Ver mis recetas
                            </button>

                        </div>

                    </div>

                ) : (

                    // ====================================================
                    // LISTA DE FAVORITOS
                    // ====================================================

                    <div className="row g-4">

                        {favorites.map((favorite) => {

                            /*
                             * Aquí asumimos que el backend devuelve:
                             *
                             * {
                             *   id: 1,
                             *   recipe_id: 5,
                             *   recipe: {
                             *      id: 5,
                             *      title: "...",
                             *      description: "...",
                             *      ...
                             *   }
                             * }
                             */

                            const recipe = favorite.recipe;

                            if (!recipe) {
                                return null;
                            }

                            return (
                                <div
                                    key={favorite.id}
                                    className="col-12 col-md-6 col-lg-4"
                                >

                                    <div className="card border-0 shadow-sm rounded-4 h-100">

                                        <div className="card-body p-4">

                                            {/* HEADER */}

                                            <div className="d-flex justify-content-between align-items-start mb-3">

                                                <span className="badge bg-danger-subtle text-danger">
                                                    ❤️ Favorita
                                                </span>

                                                <small className="text-muted">
                                                    👥 {recipe.servings}
                                                </small>

                                            </div>


                                            {/* TITLE */}

                                            <h4 className="fw-bold">
                                                {recipe.title}
                                            </h4>


                                            {/* DESCRIPTION */}

                                            <p className="text-secondary small">
                                                {recipe.description}
                                            </p>


                                            {/* INFO */}

                                            <div className="d-flex gap-3 small text-muted mb-4">

                                                <span>
                                                    ⏱️ {recipe.prep_time} min
                                                </span>

                                                <span>
                                                    🔥 {recipe.calories} kcal
                                                </span>

                                            </div>


                                            {/* BUTTONS */}

                                            <div className="d-flex gap-2">

                                                <button
                                                    className="btn btn-success flex-grow-1 rounded-pill"
                                                    onClick={() =>
                                                        navigate(
                                                            `/recipe/${recipe.id}`
                                                        )
                                                    }
                                                >
                                                    Ver receta
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger rounded-pill px-3"
                                                    onClick={() =>
                                                        removeFavorite(
                                                            recipe.id
                                                        )
                                                    }
                                                    disabled={
                                                        removing === recipe.id
                                                    }
                                                    title="Eliminar de favoritos"
                                                >

                                                    {removing === recipe.id ? (

                                                        <span
                                                            className="spinner-border spinner-border-sm"
                                                            role="status"
                                                        />

                                                    ) : (
                                                        "🗑️"
                                                    )}

                                                </button>

                                            </div>

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

export default Favorites;