import { useState } from "react";
import authService from "../services/apiServices";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

const Login = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await authService.login(formData);

      dispatch({
        type: "auth",
        payload: {
          user: data.data,
          token: data.token,
        },
      });

      navigate("/");
    } catch (error) {
      console.error(error);

      if (error.status === 401 || error.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Credenciales incorrectas",
          text: "El correo o la contraseña no son válidos",
          confirmButtonColor: "#6366f1",
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="login-page">
      <div className="login-background-shape shape-1"></div>
      <div className="login-background-shape shape-2"></div>

      <div className="container d-flex justify-content-center align-items-center min-vh-100 py-5">
        <div className="login-wrapper">
          {/* Logo / Brand */}
          <div className="text-center mb-4">
            <div className="login-logo">
              <i className="bi bi-shield-lock-fill"></i>
            </div>

            <h1 className="login-brand">Bienvenido</h1>

            <p className="login-subtitle">Inicia sesión para continuar</p>
          </div>

          {/* Card */}
          <div className="login-card">
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="login-label">
                  Correo electrónico
                </label>

                <div className="input-wrapper">
                  <i className="bi bi-envelope input-icon"></i>

                  <input
                    id="email"
                    type="email"
                    className="login-input"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label htmlFor="password" className="login-label mb-0">
                    Contraseña
                  </label>
                </div>

                <div className="input-wrapper">
                  <i className="bi bi-lock input-icon"></i>

                  <input
                    id="password"
                    type="password"
                    className="login-input"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {/* Button */}
              <button type="submit" className="login-button">
                <span>Iniciar sesión</span>
                <i className="bi bi-arrow-right"></i>
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <span>o</span>
            </div>

            {/* Register */}
            <div className="text-center">
              <p className="register-text mb-0">
                ¿Todavía no tienes una cuenta?
              </p>

              <Link to="/register" className="register-link">
                Crear una cuenta
                <i className="bi bi-arrow-up-right ms-1"></i>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="login-footer">
            © {new Date().getFullYear()} · Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
