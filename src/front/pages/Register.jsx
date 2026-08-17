import { useState } from "react";
import authService from "../services/apiServices";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

const Register = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
    weight: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await authService.register(formData);

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

      if (error.status === 409) {
        Swal.fire({
          icon: "error",
          title: "Email ocupado",
          text: "Este correo ya está registrado",
          confirmButtonColor: "#6366f1",
        });
      }

      if (error.status === 400) {
        Swal.fire({
          icon: "error",
          title: "Datos incompletos",
          text: "Revisa todos los campos",
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
      {/* Background */}
      <div className="login-background-shape shape-1"></div>
      <div className="login-background-shape shape-2"></div>

      <div className="container d-flex justify-content-center align-items-center min-vh-100 py-5">
        <div className="login-wrapper">

          {/* Header */}
          <div className="text-center mb-4">
            <div className="login-logo">
              <i className="bi bi-person-plus-fill"></i>
            </div>

            <h1 className="login-brand">Crear cuenta</h1>

            <p className="login-subtitle">
              Regístrate para comenzar
            </p>
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
                <label htmlFor="password" className="login-label">
                  Contraseña
                </label>

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
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="register-section-title">
                <span>Datos personales</span>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label htmlFor="name" className="login-label">
                  Nombre
                </label>

                <div className="input-wrapper">
                  <i className="bi bi-person input-icon"></i>

                  <input
                    id="name"
                    type="text"
                    className="login-input"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Age + Weight */}
              <div className="row g-3 mb-4">

                {/* Age */}
                <div className="col-12 col-md-6">
                  <label htmlFor="age" className="login-label">
                    Edad
                  </label>

                  <div className="input-wrapper">
                    <i className="bi bi-calendar3 input-icon"></i>

                    <input
                      id="age"
                      type="number"
                      className="login-input"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="25"
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Weight */}
                <div className="col-12 col-md-6">
                  <label htmlFor="weight" className="login-label">
                    Peso (kg)
                  </label>

                  <div className="input-wrapper">
                    <i className="bi bi-speedometer2 input-icon"></i>

                    <input
                      id="weight"
                      type="number"
                      className="login-input"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="70"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Button */}
              <button type="submit" className="login-button">
                <span>Crear cuenta</span>
                <i className="bi bi-arrow-right"></i>
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <span>o</span>
            </div>

            {/* Login */}
            <div className="text-center">
              <p className="register-text mb-0">
                ¿Ya tienes una cuenta?
              </p>

              <Link to="/login" className="register-link">
                Iniciar sesión
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

export default Register;