import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();

  const handleLogout = () => {
    dispatch({
      type: "logout",
    });
  };

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top"
      style={{
        background: "rgba(17, 24, 39, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,.1)",
      }}
    >
      <div className="container">
        <Link className="navbar-brand fw-bold text-white fs-4" to="/">
          What We eat
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbar">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item mx-2">
              <Link className="nav-link text-white" to="/">
                Inicio
              </Link>
            </li>

            <li className="nav-item mx-2">
              <Link className="nav-link text-white" to="/my-recipes">
                Recetas
              </Link>
            </li>

            <li className="nav-item mx-2">
              <Link className="nav-link text-white" to="/favorites">
                Favoritos
              </Link>
            </li>

            <li className="nav-item mx-2">
              <Link className="nav-link text-white" to="/contact">
                Contacto
              </Link>
            </li>
          </ul>

          <div className="d-flex gap-2 align-items-center">
            {store.auth ? (
              <>
                <span className="text-white">👋 {store.user?.name}</span>

                <button
                  onClick={handleLogout}
                  className="btn btn-outline-danger rounded-pill px-4"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="btn btn-outline-light rounded-pill px-4">
                    Iniciar sesión
                  </button>
                </Link>

                <Link to="/register">
                  <button
                    className="btn rounded-pill px-4 text-white"
                    style={{
                      background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                      border: "none",
                    }}
                  >
                    Registrarse
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
