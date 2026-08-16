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

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "No se pudieron cargar los favoritos"
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

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "No se pudo eliminar el favorito"
                );
            }

            setFavorites((prevFavorites) =>
                prevFavorites.filter(
                    (favorite) =>
                        favorite.recipe_id !== recipeId
                )
            );

        } catch (error) {
            console.error(
                "REMOVE FAVORITE ERROR:",
                error
            );

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

                    <div className="favorites-loading-icon">
                        ♥
                    </div>

                    <div
                        className="spinner-border text-danger"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Cargando...
                        </span>
                    </div>

                    <p>
                        Cargando tus favoritos...
                    </p>

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

                        <div className="favorites-error-icon">
                            ⚠️
                        </div>

                        <h3>
                            Algo ha salido mal
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            className="favorites-primary-btn"
                            onClick={() =>
                                window.location.reload()
                            }
                        >
                            Intentar de nuevo
                        </button>

                    </div>

                </div>
            </div>
        );
    }


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="favorites-page">

            <div className="container favorites-container">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <header className="favorites-header">

                    <div>

                        <div className="favorites-eyebrow">
                            <span className="favorites-eyebrow-icon">
                                ♥
                            </span>

                            TU COLECCIÓN PERSONAL
                        </div>

                        <h1>
                            Recetas que{" "}
                            <span>te encantan</span>
                        </h1>

                        <p>
                            Guarda tus recetas favoritas y tenlas
                            siempre a mano cuando quieras volver
                            a prepararlas.
                        </p>

                    </div>

                    <button
                        className="favorites-create-btn"
                        onClick={() => navigate("/")}
                    >
                        <span>+</span>
                        Crear receta
                    </button>

                </header>


                {/* ==================================================
                    STATS
                ================================================== */}

                {favorites.length > 0 && (
                    <div className="favorites-stats">

                        <div className="favorite-stat-card">

                            <div className="favorite-stat-icon heart">
                                ♥
                            </div>

                            <div>
                                <strong>
                                    {favorites.length}
                                </strong>

                                <span>
                                    {favorites.length === 1
                                        ? "Receta favorita"
                                        : "Recetas favoritas"}
                                </span>
                            </div>

                        </div>

                        <div className="favorite-stat-card">

                            <div className="favorite-stat-icon recipe">
                                🍽️
                            </div>

                            <div>
                                <strong>
                                    Guardadas
                                </strong>

                                <span>
                                    Para volver cuando quieras
                                </span>
                            </div>

                        </div>

                        <div className="favorite-stat-card">

                            <div className="favorite-stat-icon ai">
                                ✨
                            </div>

                            <div>
                                <strong>
                                    IA
                                </strong>

                                <span>
                                    Recetas personalizadas
                                </span>
                            </div>

                        </div>

                    </div>
                )}


                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {favorites.length === 0 ? (

                    <div className="favorites-empty">

                        <div className="favorites-empty-visual">

                            <div className="empty-heart">
                                ♡
                            </div>

                            <span className="floating-item item-1">
                                🍅
                            </span>

                            <span className="floating-item item-2">
                                🥑
                            </span>

                            <span className="floating-item item-3">
                                ✨
                            </span>

                        </div>

                        <div className="favorites-empty-content">

                            <span className="favorites-empty-label">
                                TU COLECCIÓN ESTÁ VACÍA
                            </span>

                            <h2>
                                Guarda tus recetas favoritas
                            </h2>

                            <p>
                                Cuando encuentres una receta que
                                te encante, pulsa el corazón para
                                guardarla aquí y volver a ella
                                fácilmente.
                            </p>

                            <div className="empty-actions">

                                <button
                                    className="favorites-primary-btn"
                                    onClick={() =>
                                        navigate("/my-recipes")
                                    }
                                >
                                    🍽️ Ver mis recetas
                                </button>

                                <button
                                    className="favorites-secondary-btn"
                                    onClick={() =>
                                        navigate("/")
                                    }
                                >
                                    ✨ Crear una receta
                                </button>

                            </div>

                        </div>

                    </div>

                ) : (

                    <>
                        {/* ==================================================
                            SECTION TITLE
                        ================================================== */}

                        <div className="favorites-section-header">

                            <div>
                                <h2>
                                    Tus favoritas
                                </h2>

                                <p>
                                    Las recetas que has decidido guardar.
                                </p>
                            </div>

                            <span className="favorites-count">
                                {favorites.length}
                            </span>

                        </div>


                        {/* ==================================================
                            CARDS
                        ================================================== */}

                        <div className="row g-4">

                            {favorites.map((favorite) => {

                                const recipe =
                                    favorite.recipe;

                                if (!recipe) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={favorite.id}
                                        className="col-12 col-md-6 col-xl-4"
                                    >

                                        <article className="favorite-card">

                                            {/* VISUAL */}

                                            <div className="favorite-card-visual">

                                                <div className="favorite-card-bg" />

                                                <div className="favorite-food">
                                                    🍽️
                                                </div>

                                                <div className="favorite-ai-badge">
                                                    <span>✦</span>
                                                    Generada con IA
                                                </div>

                                                <button
                                                    type="button"
                                                    className="favorite-heart-button"
                                                    onClick={() =>
                                                        removeFavorite(
                                                            recipe.id
                                                        )
                                                    }
                                                    disabled={
                                                        removing ===
                                                        recipe.id
                                                    }
                                                    title="Quitar de favoritos"
                                                    aria-label="Quitar de favoritos"
                                                >

                                                    {removing ===
                                                    recipe.id ? (

                                                        <span
                                                            className="spinner-border spinner-border-sm"
                                                            role="status"
                                                        />

                                                    ) : (
                                                        "♥"
                                                    )}

                                                </button>

                                            </div>


                                            {/* CONTENT */}

                                            <div className="favorite-card-content">

                                                <div className="favorite-title-row">

                                                    <h3>
                                                        {recipe.title}
                                                    </h3>

                                                </div>

                                                <p className="favorite-description">
                                                    {recipe.description}
                                                </p>


                                                {/* META */}

                                                <div className="favorite-meta">

                                                    <div>
                                                        <span>
                                                            ⏱
                                                        </span>

                                                        {recipe.prep_time} min
                                                    </div>

                                                    <div>
                                                        <span>
                                                            🔥
                                                        </span>

                                                        {recipe.calories} kcal
                                                    </div>

                                                    <div>
                                                        <span>
                                                            👥
                                                        </span>

                                                        {recipe.servings}
                                                    </div>

                                                </div>


                                                {/* BUTTON */}

                                                <button
                                                    className="favorite-view-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/recipe/${recipe.id}`
                                                        )
                                                    }
                                                >

                                                    <span>
                                                        Ver receta
                                                    </span>

                                                    <span className="favorite-arrow">
                                                        →
                                                    </span>

                                                </button>

                                            </div>

                                        </article>

                                    </div>
                                );
                            })}

                        </div>


                        {/* ==================================================
                            BOTTOM CTA
                        ================================================== */}

                        <div className="favorites-bottom-cta">

                            <div className="bottom-cta-icon">
                                ✨
                            </div>

                            <div className="bottom-cta-content">

                                <h3>
                                    ¿Quieres descubrir algo nuevo?
                                </h3>

                                <p>
                                    Crea una nueva receta personalizada
                                    con los ingredientes que tengas en casa.
                                </p>

                            </div>

                            <button
                                className="favorites-primary-btn"
                                onClick={() => navigate("/")}
                            >
                                Crear receta
                                <span>→</span>
                            </button>

                        </div>

                    </>
                )}

            </div>
        </div>
    );
};

export default Favorites;