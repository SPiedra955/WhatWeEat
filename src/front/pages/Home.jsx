import React from "react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();

  const goToAI = () => {
    navigate("/ai");
  };

  return (
    <div className="home-page">
      {/* HERO */}

      <section className="home-hero">
        <div className="home-hero-bg">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="hero-grid" />
        </div>

        <div className="container position-relative">
          <div className="row align-items-center g-5">
            {/* CONTENT */}

            <div className="col-lg-6">
              <div className="home-badge">
                <span className="badge-dot" />
                Potenciado por inteligencia artificial
              </div>

              <h1 className="home-title">
                Cocina mejor.
                <br />
                <span>Sin pensar qué cocinar.</span>
              </h1>

              <p className="home-description">
                Introduce lo que tienes en tu cocina y deja que nuestra IA cree
                una receta personalizada para ti.
              </p>

              <div className="home-buttons">
                <div className="home-buttons">
                  <button className="home-primary-btn" onClick={goToAI}>
                    <span>✨</span>
                    Crear mi receta
                    <span className="arrow">→</span>
                  </button>
                </div>
              </div>

              <div className="home-trust">
                <div className="trust-avatars">
                  <span>👩🏻</span>
                  <span>👨🏼</span>
                  <span>👩🏽</span>
                  <span>👨🏻</span>
                </div>

                <div className="trust-content">
                  <div className="trust-stars">★★★★★</div>

                  <span>Tu nuevo asistente de cocina</span>
                </div>
              </div>
            </div>

            {/* AI CARD */}

            <div className="col-lg-6">
              <div className="home-ai-container">
                <div className="ai-floating-card ai-floating-top">
                  <span>🥑</span>
                  Aguacate
                </div>

                <div className="ai-floating-card ai-floating-bottom">
                  <span>🔥</span>
                  Alto en proteína
                </div>

                <div className="home-ai-glow" />

                <div className="home-ai-card">
                  {/* TOP BAR */}

                  <div className="ai-card-top">
                    <div className="ai-brand">
                      <div className="ai-brand-icon">✦</div>

                      <div>
                        <strong>Chef IA</strong>

                        <small>Tu asistente personal</small>
                      </div>
                    </div>

                    <div className="ai-live">
                      <span />
                      Online
                    </div>
                  </div>

                  {/* CHAT */}

                  <div className="ai-chat">
                    <div className="chat-user">
                      <div className="chat-avatar">👤</div>

                      <div className="chat-bubble user">
                        Tengo pollo, arroz, tomate y aguacate.
                      </div>
                    </div>

                    <div className="chat-ai">
                      <div className="chat-avatar ai-avatar">✦</div>

                      <div className="chat-bubble ai">
                        <div className="ai-message-title">¡Tengo una idea!</div>

                        <p>Arroz cremoso con pollo, tomate y aguacate.</p>

                        <div className="recipe-preview">
                          <div className="recipe-image">🍗</div>

                          <div className="recipe-info">
                            <strong>Bowl de pollo</strong>

                            <span>520 kcal · 32g proteína</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INPUT */}

                  <div className="ai-input">
                    <span>¿Qué tienes en la nevera?</span>

                    <button onClick={goToAI}>→</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIMPLE VALUE SECTION */}

      <section className="home-value">
        <div className="container">
          <div className="home-value-header">
            <span>UNA COCINA MÁS INTELIGENTE</span>

            <h2>
              Todo lo que necesitas para
              <br />
              cocinar a tu manera.
            </h2>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="value-card">
                <div className="value-icon green">✦</div>

                <h3>Inteligencia real</h3>

                <p>
                  La IA entiende tus ingredientes y crea combinaciones pensadas
                  para ti.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="value-card">
                <div className="value-icon orange">🎯</div>

                <h3>Hecho a tu medida</h3>

                <p>
                  Ajusta las recetas según tus personas, preferencias y
                  objetivos.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="value-card">
                <div className="value-icon purple">❤️</div>

                <h3>Tu cocina, tu historial</h3>

                <p>Guarda tus recetas y vuelve a ellas cuando quieras.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="home-cta">
        <div className="container">
          <div className="home-cta-box">
            <div className="cta-glow" />

            <span className="cta-label">✦ CHEF IA</span>

            <h2>
              Tu próxima receta
              <br />
              empieza aquí.
            </h2>

            <p>Dinos qué tienes. Nosotros nos encargamos del resto.</p>

            <button onClick={goToAI} className="cta-button">
              Empezar a cocinar
              <span>→</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
