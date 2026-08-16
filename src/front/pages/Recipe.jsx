import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jsPDF } from "jspdf";

const Recipe = () => {
  const { id } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");

  const [pdfLoading, setPdfLoading] = useState(false);

  const token = localStorage.getItem("token");
  const url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const getRecipe = async () => {
      try {
        const response = await fetch(`${url}/api/recipes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "No se pudo cargar la receta");
          return;
        }

        setRecipe(data.recipe);

        // Si el backend devuelve is_favorite
        setIsFavorite(Boolean(data.recipe.is_favorite));
      } catch (error) {
        console.error(error);
        setError("Error al conectar con el servidor");
      }
    };

    getRecipe();
  }, [id, token, url]);

  // =========================================
  // FAVORITOS
  // =========================================

  const toggleFavorite = async () => {
    if (favoriteLoading) return;

    setFavoriteLoading(true);
    setFavoriteError("");

    try {
      const response = await fetch(`${url}/api/favorites/${recipe.id}`, {
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
          setIsFavorite(true);
          return;
        }

        throw new Error(message || "No se pudo actualizar el favorito");
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("FAVORITE ERROR:", error);
      setFavoriteError(error.message);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // =========================================
  // PDF
  // =========================================

  const createPdf = () => {
    const doc = new jsPDF({
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const green = [25, 135, 84];
    const dark = [30, 40, 34];
    const gray = [105, 115, 108];

    let y = 0;

    // -----------------------------------------
    // HEADER
    // -----------------------------------------

    doc.setFillColor(...green);
    doc.rect(0, 0, pageWidth, 48, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);

    const titleLines = doc.splitTextToSize(recipe.title, pageWidth - 30);

    doc.text(titleLines, 15, 19);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text("Receta generada con IA", 15, 39);

    y = 62;

    // -----------------------------------------
    // DESCRIPTION
    // -----------------------------------------

    doc.setTextColor(...dark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const descriptionLines = doc.splitTextToSize(
      recipe.description || "",
      pageWidth - 30,
    );

    doc.text(descriptionLines, 15, y);

    y += descriptionLines.length * 6 + 10;

    // -----------------------------------------
    // INFO
    // -----------------------------------------

    doc.setFillColor(245, 248, 246);
    doc.roundedRect(15, y, pageWidth - 30, 27, 4, 4, "F");

    const infoItems = [
      ["Tiempo", `${recipe.prep_time} min`],
      ["Porciones", `${recipe.servings}`],
      ["Calorías", `${recipe.calories} kcal`],
      ["Proteína", `${recipe.protein} g`],
    ];

    const infoWidth = (pageWidth - 30) / 4;

    infoItems.forEach(([label, value], index) => {
      const x = 15 + index * infoWidth + infoWidth / 2;

      doc.setTextColor(...green);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      doc.text(value, x, y + 12, {
        align: "center",
      });

      doc.setTextColor(...gray);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);

      doc.text(label, x, y + 20, {
        align: "center",
      });
    });

    y += 42;

    // -----------------------------------------
    // INGREDIENTES
    // -----------------------------------------

    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    doc.text("Ingredientes", 15, y);

    y += 9;

    recipe.ingredients.forEach((ingredient) => {
      if (y > pageHeight - 25) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(232, 245, 237);

      doc.circle(18, y - 1.5, 1.5, "F");

      doc.setTextColor(...dark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(ingredient.name, 24, y);

      doc.setTextColor(...green);
      doc.setFont("helvetica", "bold");

      doc.text(ingredient.amount, pageWidth - 15, y, { align: "right" });

      y += 7;
    });

    // -----------------------------------------
    // PREPARACIÓN
    // -----------------------------------------

    y += 8;

    if (y > pageHeight - 45) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    doc.text("Preparación", 15, y);

    y += 10;

    const steps = recipe.instructions
      .split("\n")
      .filter((step) => step.trim() !== "");

    steps.forEach((step, index) => {
      const cleanStep = step.replace(/^\d+\.\s*/, "");

      const stepLines = doc.splitTextToSize(cleanStep, pageWidth - 48);

      if (y + stepLines.length * 5 + 10 > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(...green);

      doc.circle(19, y - 1.5, 4, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);

      doc.text(`${index + 1}`, 19, y + 1, { align: "center" });

      doc.setTextColor(...dark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      doc.text(stepLines, 28, y);

      y += stepLines.length * 5 + 8;
    });

    // -----------------------------------------
    // NUTRICIÓN
    // -----------------------------------------

    if (y + 55 > pageHeight - 15) {
      doc.addPage();
      y = 20;
    }

    y += 5;

    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    doc.text("Información nutricional", 15, y);

    y += 10;

    const nutrition = [
      ["Calorías", `${recipe.calories} kcal`],
      ["Proteína", `${recipe.protein} g`],
      ["Carbohidratos", `${recipe.carbs} g`],
      ["Grasas", `${recipe.fat} g`],
    ];

    nutrition.forEach(([label, value], index) => {
      const x = 15 + (index % 2) * 90;
      const rowY = y + Math.floor(index / 2) * 22;

      doc.setFillColor(247, 249, 247);

      doc.roundedRect(x, rowY, 82, 17, 3, 3, "F");

      doc.setTextColor(...green);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);

      doc.text(value, x + 5, rowY + 7);

      doc.setTextColor(...gray);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);

      doc.text(label, x + 5, rowY + 13);
    });

    // -----------------------------------------
    // FOOTER
    // -----------------------------------------

    const totalPages = doc.internal.getNumberOfPages();

    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);

      doc.setDrawColor(230, 235, 231);
      doc.line(15, pageHeight - 12, pageWidth - 15, pageHeight - 12);

      doc.setTextColor(...gray);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);

      doc.text("Mi Cocina IA", 15, pageHeight - 7);

      doc.text(
        `Página ${page} de ${totalPages}`,
        pageWidth - 15,
        pageHeight - 7,
        { align: "right" },
      );
    }

    return doc;
  };

  // =========================================
  // DESCARGAR PDF
  // =========================================

  const downloadPdf = () => {
    if (pdfLoading) return;

    setPdfLoading(true);

    try {
      const doc = createPdf();

      const filename = `${recipe.title
        .replace(/[^a-z0-9áéíóúñü ]/gi, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase()}.pdf`;

      doc.save(filename);
    } catch (error) {
      console.error("DOWNLOAD PDF ERROR:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  // =========================================
  // COMPARTIR PDF
  // =========================================

  const sharePdf = async () => {
    if (pdfLoading) return;

    setPdfLoading(true);

    try {
      const doc = createPdf();

      const filename = `${recipe.title
        .replace(/[^a-z0-9áéíóúñü ]/gi, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase()}.pdf`;

      const blob = doc.output("blob");

      const file = new File([blob], filename, {
        type: "application/pdf",
      });

      // -----------------------------------------
      // COMPARTIR ARCHIVO
      // -----------------------------------------

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [file],
        })
      ) {
        await navigator.share({
          title: recipe.title,
          text: `Te comparto esta receta: ${recipe.title}`,
          files: [file],
        });

        return;
      }

      // -----------------------------------------
      // FALLBACK
      // -----------------------------------------

      // Si el navegador no permite compartir archivos,
      // descargamos el PDF como alternativa.

      doc.save(filename);
    } catch (error) {
      // El usuario ha cancelado el menú de compartir.
      if (error?.name !== "AbortError") {
        console.error("SHARE PDF ERROR:", error);
      }
    } finally {
      setPdfLoading(false);
    }
  };
  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div className="recipe-page">
        <div className="container py-5">
          <div className="alert alert-danger text-center">{error}</div>
        </div>
      </div>
    );
  }

  // =========================================
  // LOADING
  // =========================================

  if (!recipe) {
    return (
      <div className="recipe-page recipe-loading">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>

          <p className="mt-3 text-muted">Preparando tu receta...</p>
        </div>
      </div>
    );
  }

  // =========================================
  // RECIPE
  // =========================================

  return (
    <div className="recipe-page">
      <div className="container py-5">
        <div className="recipe-hero mb-4">
          <div className="recipe-hero-content">
            <div className="recipe-hero-main">
              <span className="recipe-ai-badge">✨ Receta generada con IA</span>

              <h1>{recipe.title}</h1>

              <p>{recipe.description}</p>

              {/* ACTIONS */}

              <div className="recipe-actions">
                {/* FAVORITOS */}

                <button
                  type="button"
                  className={`recipe-action favorite-action ${
                    isFavorite ? "active" : ""
                  }`}
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                >
                  {favoriteLoading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    />
                  ) : (
                    <span>{isFavorite ? "♥" : "♡"}</span>
                  )}

                  <span>
                    {isFavorite ? "En favoritos" : "Añadir a favoritos"}
                  </span>
                </button>

                {/* DESCARGAR */}

                <button
                  type="button"
                  className="recipe-action pdf-action"
                  onClick={downloadPdf}
                  disabled={pdfLoading}
                >
                  {pdfLoading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    />
                  ) : (
                    <span>⬇️</span>
                  )}

                  <span>Descargar PDF</span>
                </button>

                {/* COMPARTIR */}

                <button
                  type="button"
                  className="recipe-action share-action"
                  onClick={sharePdf}
                  disabled={pdfLoading}
                >
                  <span>📤</span>

                  <span>Compartir</span>
                </button>
              </div>
              {favoriteError && (
                <div className="recipe-favorite-error">⚠️ {favoriteError}</div>
              )}
            </div>

            <div className="recipe-hero-visual">
              <div className="recipe-hero-circle">🍽️</div>
            </div>
          </div>

          {/* INFO */}

          <div className="recipe-info">
            <div>
              <span>⏱️</span>
              <small>Tiempo</small>
              <strong>{recipe.prep_time} min</strong>
            </div>

            <div>
              <span>👥</span>
              <small>Porciones</small>
              <strong>{recipe.servings}</strong>
            </div>

            <div>
              <span>🔥</span>
              <small>Calorías</small>
              <strong>{recipe.calories} kcal</strong>
            </div>

            <div>
              <span>💪</span>
              <small>Proteína</small>
              <strong>{recipe.protein} g</strong>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* INGREDIENTS */}

          <div className="col-lg-5">
            <div className="recipe-section-card h-100">
              <div className="recipe-section-header">
                <div>
                  <h2>🥕 Ingredientes</h2>

                  <p>Para {recipe.servings} personas</p>
                </div>
              </div>

              <div className="ingredients-list">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="ingredient-item">
                    <div className="ingredient-name">
                      <span>{index + 1}</span>

                      {ingredient.name}
                    </div>

                    <strong>{ingredient.amount}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="recipe-section-card">
              <div className="recipe-section-header">
                <div>
                  <h2>👨‍🍳 Preparación</h2>

                  <p>Sigue los pasos para preparar tu receta</p>
                </div>
              </div>

              <div className="instructions-list">
                {recipe.instructions
                  .split("\n")
                  .filter((step) => step.trim() !== "")
                  .map((step, index) => (
                    <div key={index} className="instruction-item">
                      <div className="step-number">{index + 1}</div>

                      <p>{step.replace(/^\d+\.\s*/, "")}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="recipe-section-card nutrition-card mt-4">
          <div className="recipe-section-header">
            <div>
              <h2>📊 Información nutricional</h2>

              <p>Valores aproximados por porción</p>
            </div>
          </div>

          <div className="nutrition-grid">
            <div>
              <strong className="calories">{recipe.calories}</strong>

              <span>kcal</span>

              <small>Calorías</small>
            </div>

            <div>
              <strong className="protein">{recipe.protein}g</strong>

              <small>Proteína</small>
            </div>

            <div>
              <strong className="carbs">{recipe.carbs}g</strong>

              <small>Carbohidratos</small>
            </div>

            <div>
              <strong className="fat">{recipe.fat}g</strong>

              <small>Grasas</small>
            </div>
          </div>
        </div>

        <div className="recipe-share-card mt-4">
          <div className="recipe-share-content">
            <span className="share-icon">📱</span>

            <div>
              <h3>Tu receta, siempre contigo</h3>

              <p>
                Descarga una copia en PDF para guardarla en tu móvil, imprimirla
                o enviársela a alguien por WhatsApp.
              </p>
            </div>
          </div>

          <div className="recipe-share-actions">
            <button
              type="button"
              onClick={downloadPdf}
              disabled={pdfLoading}
              className="share-download-btn"
            >
              <span>⬇️</span>
              Descargar
            </button>

            <button
              type="button"
              onClick={sharePdf}
              disabled={pdfLoading}
              className="share-pdf-btn"
            >
              <span>📤</span>
              Compartir
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Recipe;
