import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Recipe = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");
    const url = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const getRecipe = async () => {
            try {
                const response = await fetch(`${url}/api/recipes/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || "No se pudo cargar la receta");
                    return;
                }

                setRecipe(data.recipe);
            } catch (error) {
                console.error(error);
                setError("Error al conectar con el servidor");
            }
        };

        getRecipe();
    }, [id, token]);

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger text-center">
                    {error}
                </div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Preparando tu receta...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="container">

                {/* Header */}
                <div className="card border-0 shadow-sm overflow-hidden mb-4">
                    <div
                        className="bg-success text-white p-5"
                        style={{
                            background:
                                "linear-gradient(135deg, #198754 0%, #20c997 100%)"
                        }}
                    >
                        <div className="row align-items-center">

                            <div className="col-lg-8">
                                <span className="badge bg-white text-success mb-3">
                                    ✨ Receta generada con IA
                                </span>

                                <h1 className="display-5 fw-bold mb-3">
                                    {recipe.title}
                                </h1>

                                <p className="lead mb-0">
                                    {recipe.description}
                                </p>
                            </div>

                            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                                <div className="fs-1">🍽️</div>
                            </div>

                        </div>
                    </div>

                    {/* Recipe info */}
                    <div className="card-body py-4">
                        <div className="row text-center">

                            <div className="col-6 col-md-3 mb-3 mb-md-0">
                                <div className="text-success fs-4">
                                    ⏱️
                                </div>
                                <small className="text-muted d-block">
                                    Tiempo
                                </small>
                                <strong>
                                    {recipe.prep_time} min
                                </strong>
                            </div>

                            <div className="col-6 col-md-3 mb-3 mb-md-0">
                                <div className="text-success fs-4">
                                    👥
                                </div>
                                <small className="text-muted d-block">
                                    Porciones
                                </small>
                                <strong>
                                    {recipe.servings}
                                </strong>
                            </div>

                            <div className="col-6 col-md-3">
                                <div className="text-success fs-4">
                                    🔥
                                </div>
                                <small className="text-muted d-block">
                                    Calorías
                                </small>
                                <strong>
                                    {recipe.calories} kcal
                                </strong>
                            </div>

                            <div className="col-6 col-md-3">
                                <div className="text-success fs-4">
                                    💪
                                </div>
                                <small className="text-muted d-block">
                                    Proteína
                                </small>
                                <strong>
                                    {recipe.protein} g
                                </strong>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="row g-4">

                    {/* Ingredients */}
                    <div className="col-lg-5">
                        <div className="card border-0 shadow-sm h-100">

                            <div className="card-header bg-white border-0 pt-4 px-4">
                                <h3 className="fw-bold mb-1">
                                    🥕 Ingredientes
                                </h3>
                                <p className="text-muted mb-0">
                                    Para {recipe.servings} personas
                                </p>
                            </div>

                            <div className="card-body px-4">

                                <div className="list-group list-group-flush">
                                    {recipe.ingredients.map(
                                        (ingredient, index) => (
                                            <div
                                                key={index}
                                                className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center"
                                            >
                                                <span>
                                                    {ingredient.name}
                                                </span>

                                                <span className="badge bg-success-subtle text-success rounded-pill">
                                                    {ingredient.amount}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-sm">

                            <div className="card-header bg-white border-0 pt-4 px-4">
                                <h3 className="fw-bold mb-1">
                                    👨‍🍳 Preparación
                                </h3>
                                <p className="text-muted mb-0">
                                    Sigue estos pasos para preparar tu receta
                                </p>
                            </div>

                            <div className="card-body px-4">

                                {recipe.instructions
                                    .split("\n")
                                    .filter(step => step.trim() !== "")
                                    .map((step, index) => (
                                        <div
                                            key={index}
                                            className="d-flex gap-3 mb-4"
                                        >
                                            <div
                                                className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{
                                                    width: "38px",
                                                    height: "38px"
                                                }}
                                            >
                                                <strong>
                                                    {index + 1}
                                                </strong>
                                            </div>

                                            <div className="pt-1">
                                                <p className="mb-0 text-secondary">
                                                    {step.replace(
                                                        /^\d+\.\s*/,
                                                        ""
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                            </div>
                        </div>
                    </div>

                </div>

                {/* Nutrition */}
                <div className="card border-0 shadow-sm mt-4">
                    <div className="card-body p-4">

                        <h3 className="fw-bold mb-4">
                            📊 Información nutricional
                        </h3>

                        <div className="row text-center">

                            <div className="col-6 col-md-3 mb-3 mb-md-0">
                                <div className="p-3 rounded-3 bg-light">
                                    <div className="fw-bold fs-4 text-danger">
                                        {recipe.calories}
                                    </div>
                                    <small className="text-muted">
                                        Calorías
                                    </small>
                                </div>
                            </div>

                            <div className="col-6 col-md-3 mb-3 mb-md-0">
                                <div className="p-3 rounded-3 bg-light">
                                    <div className="fw-bold fs-4 text-primary">
                                        {recipe.protein}g
                                    </div>
                                    <small className="text-muted">
                                        Proteína
                                    </small>
                                </div>
                            </div>

                            <div className="col-6 col-md-3">
                                <div className="p-3 rounded-3 bg-light">
                                    <div className="fw-bold fs-4 text-warning">
                                        {recipe.carbs}g
                                    </div>
                                    <small className="text-muted">
                                        Carbohidratos
                                    </small>
                                </div>
                            </div>

                            <div className="col-6 col-md-3">
                                <div className="p-3 rounded-3 bg-light">
                                    <div className="fw-bold fs-4 text-success">
                                        {recipe.fat}g
                                    </div>
                                    <small className="text-muted">
                                        Grasas
                                    </small>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Recipe;