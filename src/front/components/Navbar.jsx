import { Link, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();
  const location = useLocation();

  const handleLogout = () => {
    dispatch({
      type: "logout",
    });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top"
      style={{
        background: "rgba(15, 23, 42, 0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      }}
    >
      <div className="container py-2">

        {/* LOGO */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 text-white fw-bold"
          style={{ letterSpacing: "-0.5px" }}
        >
          <span
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{
              width: "42px",
              height: "42px",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              boxShadow: "0 6px 20px rgba(139,92,246,0.35)",
              fontSize: "21px",
            }}
          >
            🍽️
          </span>

          <span style={{ fontSize: "1.2rem" }}>
            What We <span style={{ color: "#a78bfa" }}>Eat</span>
          </span>
        </Link>

        {/* MOBILE BUTTON */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar"
          aria-controls="navbar"
          aria-expanded="false"
          aria-label="Abrir navegación"
        >
          <span
            className="navbar-toggler-icon"
            style={{
              filter: "invert(1)",
            }}
          />
        </button>

        <div className="collapse navbar-collapse" id="navbar">

          {/* NAV LINKS */}
          <ul className="navbar-nav mx-auto align-items-lg-center gap-lg-2 mt-3 mt-lg-0">

            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link px-3 py-2 rounded-pill ${
                  isActive("/") ? "active-nav" : ""
                }`}
              >
                <span className="me-1">⌂</span>
                Inicio
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/my-recipes"
                className={`nav-link px-3 py-2 rounded-pill ${
                  isActive("/my-recipes") ? "active-nav" : ""
                }`}
              >
                <span className="me-1">🍴</span>
                Recetas
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/favorites"
                className={`nav-link px-3 py-2 rounded-pill ${
                  isActive("/favorites") ? "active-nav" : ""
                }`}
              >
                <span className="me-1">♡</span>
                Favoritos
              </Link>
            </li>

          </ul>

          {/* USER ACTIONS */}
          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3 mt-3 mt-lg-0">

            {store.auth ? (
              <>
                {/* USER */}
                <div
                  className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: "32px",
                      height: "32px",
                      background:
                        "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      fontSize: "14px",
                    }}
                  >
                    👤
                  </div>

                  <span className="text-white small fw-semibold">
                    {store.user?.name || "Usuario"}
                  </span>
                </div>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="btn rounded-pill px-4 fw-semibold"
                  style={{
                    color: "#fca5a5",
                    border: "1px solid rgba(248,113,113,0.35)",
                    background: "rgba(248,113,113,0.08)",
                    transition: "all .2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(248,113,113,0.18)";
                    e.currentTarget.style.borderColor =
                      "rgba(248,113,113,0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(248,113,113,0.08)";
                    e.currentTarget.style.borderColor =
                      "rgba(248,113,113,0.35)";
                  }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                {/* LOGIN */}
                <Link
                  to="/login"
                  className="btn rounded-pill px-4 fw-semibold"
                  style={{
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  Iniciar sesión
                </Link>

                {/* REGISTER */}
                <Link
                  to="/register"
                  className="btn rounded-pill px-4 fw-semibold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "none",
                    boxShadow: "0 6px 18px rgba(99,102,241,0.3)",
                  }}
                >
                  Crear cuenta
                </Link>
              </>
            )}

          </div>
        </div>
      </div>

      {/* NAVBAR STYLES */}
      <style>
        {`
          .navbar .nav-link {
            color: rgba(255,255,255,0.68) !important;
            font-weight: 500;
            transition: all 0.2s ease;
          }

          .navbar .nav-link:hover {
            color: white !important;
            background: rgba(255,255,255,0.07);
          }

          .navbar .nav-link.active-nav {
            color: white !important;
            background: rgba(139,92,246,0.16);
            box-shadow: inset 0 0 0 1px rgba(139,92,246,0.18);
          }

          .navbar-brand {
            text-decoration: none;
          }

          .navbar-brand:hover span:last-child {
            color: #c4b5fd !important;
          }

          @media (max-width: 991px) {
            .navbar-collapse {
              padding-top: 15px;
            }

            .navbar-nav {
              width: 100%;
            }

            .navbar-nav .nav-link {
              width: 100%;
            }
          }
        `}
      </style>
    </nav>
  );
};

