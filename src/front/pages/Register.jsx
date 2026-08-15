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
          confirmButtonColor: "#dc3545",
        });
      }

      if (error.status === 400) {
        Swal.fire({
          icon: "error",
          title: "Datos incompletos",
          text: "Revisa todos los campos",
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
    <div className="min-vh-100 bg-light pt-5 pb-5 px-3">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-header bg-white border-0 p-4">
                <div className="d-flex align-items-center">
                  <div
                    className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3 flex-shrink-0"
                    style={{ width: "55px", height: "55px" }}
                  >
                    <i className="bi bi-person-plus-fill fs-4"></i>
                  </div>

                  <div>
                    <h3 className="fw-bold mb-1">Crear cuenta</h3>

                    <p className="text-muted mb-0 small">
                      Completa tus datos para registrarte.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-body p-3 p-md-5">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Email</label>

                      <input
                        type="email"
                        className="form-control form-control-lg"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="correo@email.com"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Contraseña
                      </label>

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

                    <div className="col-12">
                      <hr />
                      <h5 className="fw-bold">Datos personales</h5>
                    </div>

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

                    <div className="col-12 mt-3">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 rounded-pill"
                      >
                        Crear cuenta
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="text-center mt-4">
              <span className="text-muted">¿Ya tienes una cuenta?</span>

              <Link
                to="/login"
                className="btn btn-link fw-semibold text-decoration-none"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
