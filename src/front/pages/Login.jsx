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
          confirmButtonColor: "#dc3545",
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
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="w-100" style={{ maxWidth: "520px" }}>
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="card-header bg-white border-0 py-4 px-4">
            <div className="d-flex align-items-center">
              <div
                className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3"
                style={{ width: 55, height: 55 }}
              >
                <i className="bi bi-person-fill fs-4"></i>
              </div>

              <div>
                <h3 className="fw-bold mb-1">Iniciar sesión</h3>

                <p className="text-muted mb-0">Accede con tus credenciales.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* Email */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Email</label>

                  <input
                    type="email"
                    className="form-control form-control-lg"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@email.com"
                    required
                  />
                </div>

                {/* Password */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Contraseña</label>

                  <input
                    type="password"
                    className="form-control form-control-lg"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="********"
                    required
                  />
                </div>

                {/* Button */}
                <div className="col-12 mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 rounded-3"
                  >
                    Iniciar sesión
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Register link */}
        <div className="text-center mt-4">
          <span className="text-muted">¿No tienes una cuenta?</span>

          <Link
            to="/register"
            className="btn btn-link text-decoration-none fw-semibold"
          >
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
