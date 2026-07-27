import React, { useEffect } from "react";
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
  return (
    <div className="container py-5">
      <div className="row align-items-center min-vh-100">
        {/* Hero */}
        <div className="col-lg-6 mb-5 mb-lg-0">
          <span className="badge text-bg-success mb-3">🤖 AI Powered</span>

          <h1 className="display-3 fw-bold">What We Eat</h1>

          <p className="lead text-secondary my-4">
            Convierte los ingredientes que tienes en casa en recetas increíbles
            creadas con Inteligencia Artificial.
          </p>

          <div className="d-flex flex-wrap gap-3 mb-5">
            <button className="btn btn-success btn-lg">Comenzar</button>

            <button className="btn btn-outline-secondary btn-lg">
              Ver ejemplo
            </button>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5>🍳 Recetas IA</h5>
                  <p className="card-text">
                    Genera recetas usando únicamente los ingredientes que
                    tienes.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5>🔥 Nutrición</h5>
                  <p className="card-text">
                    Obtén calorías, proteínas, grasas y carbohidratos.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5>💪 Dietas</h5>
                  <p className="card-text">
                    Planes personalizados para perder grasa o ganar músculo.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5>📚 Mis recetas</h5>
                  <p className="card-text">
                    Guarda tus recetas favoritas y consúltalas cuando quieras.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo */}
        <div className="col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              Generador de recetas
            </div>

            <div className="card-body">
              <label className="form-label fw-semibold">
                ¿Qué ingredientes tienes?
              </label>

              <textarea
                className="form-control"
                rows="6"
                defaultValue={`Pollo
				Arroz
				Cebolla
				Ajo`}
              />

              <button className="btn btn-success w-100 mt-3">
                ✨ Generar receta
              </button>

              <hr />

              <h5>Resultado</h5>

              <div className="alert alert-success">
                <h6>Pollo con arroz y cebolla</h6>

                <p>
                  Sofríe la cebolla y el ajo, añade el pollo cortado en dados y
                  cocina durante 8 minutos. Incorpora el arroz, agrega agua y
                  cocina hasta que esté listo.
                </p>

                <div className="row text-center">
                  <div className="col">
                    <strong>520</strong>
                    <div className="small text-muted">Kcal</div>
                  </div>

                  <div className="col">
                    <strong>38 g</strong>
                    <div className="small text-muted">Proteína</div>
                  </div>

                  <div className="col">
                    <strong>55 g</strong>
                    <div className="small text-muted">Carbs</div>
                  </div>

                  <div className="col">
                    <strong>12 g</strong>
                    <div className="small text-muted">Grasas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
