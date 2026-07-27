import { useState } from "react";
import authService from "../services/apiServices";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Auth = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
    weight: "",
    objective: "",
    type: "login",
  });

  const handleType = () => {
    setFormData((prev) => ({
      ...prev,
      type: prev.type === "register" ? "login" : "register",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await authService.auth(formData);
      dispatch({
        type: "auth",
        payload: {
          user: data.data,
          age: Number(formData.age),
          weight: Number(formData.weight),
        },
      });
      console.log("logueado");
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isLogin = formData.type === "login";

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
                <h3 className="fw-bold mb-1">
                  {isLogin ? "Iniciar sesión" : "Crear cuenta"}
                </h3>

                <p className="text-muted mb-0">
                  {isLogin
                    ? "Accede con tus credenciales."
                    : "Completa tus datos para registrarte."}
                </p>
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

                {!isLogin && (
                  <>
                    <div className="col-12">
                      <hr />
                      <h5 className="fw-bold mb-0">Datos personales</h5>
                    </div>

                    {/* Nombre */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">Nombre</label>

                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>

                    {/* Edad */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">Edad</label>

                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="25"
                        required
                      />
                    </div>

                    {/* Peso */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold">
                        Peso (kg)
                      </label>

                      <input
                        type="number"
                        className="form-control form-control-lg"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="70"
                        required
                      />
                    </div>

                    {/* Objetivo */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">Objetivo</label>

                      <select
                        className="form-select form-select-lg"
                        name="objective"
                        value={formData.objective}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona un objetivo</option>
                        <option value="lose_weight">Perder peso</option>
                        <option value="maintain_weight">Mantener peso</option>
                        <option value="gain_muscle">Ganar masa muscular</option>
                        <option value="body_recomposition">
                          Recomposición corporal
                        </option>
                        <option value="sports_performance">
                          Mejorar rendimiento deportivo
                        </option>
                        <option value="competition_prep">
                          Preparación para competición
                        </option>
                        <option value="healthy_eating">
                          Alimentación saludable
                        </option>
                      </select>
                    </div>
                  </>
                )}

                {/* Botón */}
                <div className="col-12 mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 rounded-3"
                  >
                    {isLogin ? "Iniciar sesión" : "Crear cuenta"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Cambiar Login/Register */}
        <div className="text-center mt-4">
          <span className="text-muted">
            {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
          </span>

          <button
            type="button"
            className="btn btn-link text-decoration-none fw-semibold"
            onClick={handleType}
          >
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
