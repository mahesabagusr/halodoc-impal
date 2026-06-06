import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin, useRegister } from "../../hooks";
import { Eye, EyeOff } from "lucide-react";

const INITIAL_LOGIN_FORM = {
  email: "",
  password: "",
};

const INITIAL_REGISTER_FORM = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  telephoneNumber: "",
  dob: "",
  gender: "MALE",
};

function AuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const {
    mutateAsync: login,
    isPending: isLoginPending,
    error: loginError,
  } = useLogin();
  const {
    mutateAsync: register,
    isPending: isRegisterPending,
    error: registerError,
  } = useRegister();

  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM);
  const [registerForm, setRegisterForm] = useState(INITIAL_REGISTER_FORM);
  const [registerFormError, setRegisterFormError] = useState("");

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const getFieldError = (error, field) => {
    if (error && !(error instanceof Error) && typeof error === "object") {
      return error[field];
    }
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(loginForm);

      if (data?.token || data?.accessToken || data?.access_token) {
        localStorage.setItem(
          "token",
          data.token || data.accessToken || data.access_token,
        );
      }
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterFormError("");

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterFormError("Password tidak cocok!");
      return;
    }

    try {
      await register(registerForm);

      setActiveTab("login");
      setLoginForm({ ...INITIAL_LOGIN_FORM, email: registerForm.email });
      setRegisterForm(INITIAL_REGISTER_FORM);
    } catch (error) {
      console.error("Register failed:", error);
    }
  };

  const inputBaseClass = "w-full rounded-xl border bg-surface px-3 py-2.5 text-[14px] text-text-primary transition outline-none placeholder:text-[#9CA3AF] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden";
  const inputDefaultClass = `${inputBaseClass} border-border focus:border-primary focus:shadow-[0_0_0_3px_rgba(255,92,138,0.1)]`;
  const inputErrorClass = `${inputBaseClass} border-error focus:border-error`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[445px] rounded-[21px] bg-background p-5 shadow-xl sm:p-7">
        <div className="mb-6 rounded-xl bg-surface p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`rounded-xl px-3 py-2.5 text-[14px] font-semibold transition ${
                activeTab === "login"
                  ? "bg-background text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`rounded-xl px-3 py-2.5 text-[14px] font-semibold transition ${
                activeTab === "register"
                  ? "bg-background text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Daftar
            </button>
          </div>
        </div>

        {activeTab === "login" ? (
          <form className="space-y-4" onSubmit={handleLogin}>
            {loginError && loginError instanceof Error && (
              <div className="rounded-xl bg-error-light p-3 text-[14px] text-error">
                {loginError.message}
              </div>
            )}
            <div className="block">
              <label className="mb-1 block text-[14px] font-medium text-text-primary">
                Email
              </label>
              <input
                name="email"
                placeholder="Masukkan email"
                className={getFieldError(loginError, "email") ? inputErrorClass : inputDefaultClass}
                value={loginForm.email}
                onChange={handleLoginChange}
              />
              {getFieldError(loginError, "email") && (
                <span className="mt-1 block text-[11px] text-error">
                  {getFieldError(loginError, "email")}
                </span>
              )}
            </div>
            <div className="block">
              <label className="mb-1 block text-[14px] font-medium text-text-primary">
                Password
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  name="password"
                  placeholder="Masukkan password"
                  className={`${getFieldError(loginError, "password") ? inputErrorClass : inputDefaultClass} pr-10`}
                  value={loginForm.password}
                  onChange={handleLoginChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#9CA3AF] transition-colors hover:text-text-primary"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {getFieldError(loginError, "password") && (
                <span className="mt-1 block text-[11px] text-error">
                  {getFieldError(loginError, "password")}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoginPending}
              className="w-full rounded-xl bg-primary px-4 py-3 text-[14px] font-semibold text-white transition-all duration-150 hover:bg-primary-hover disabled:bg-border disabled:text-[#9CA3AF] disabled:cursor-not-allowed"
            >
              {isLoginPending ? "Memproses..." : "Masuk Sekarang"}
            </button>
            <p className="text-center text-[11px] text-text-secondary">
              Lupa password? Hubungi support HaloHealth.
            </p>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleRegister}>
            {((registerError && registerError instanceof Error) ||
              registerFormError) && (
              <div className="rounded-xl bg-error-light p-3 text-[14px] text-error">
                {registerFormError || registerError?.message}
              </div>
            )}
            <div className="block">
              <label className="mb-1 block text-[14px] font-medium text-text-primary">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Masukkan nama lengkap"
                className={getFieldError(registerError, "fullName") ? inputErrorClass : inputDefaultClass}
                value={registerForm.fullName}
                onChange={handleRegisterChange}
              />
              {getFieldError(registerError, "fullName") && (
                <span className="mt-1 block text-[11px] text-error">
                  {getFieldError(registerError, "fullName")}
                </span>
              )}
            </div>
            <div className="block">
              <label className="mb-1 block text-[14px] font-medium text-text-primary">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="nama@email.com"
                className={getFieldError(registerError, "email") ? inputErrorClass : inputDefaultClass}
                value={registerForm.email}
                onChange={handleRegisterChange}
              />
              {getFieldError(registerError, "email") && (
                <span className="mt-1 block text-[11px] text-error">
                  {getFieldError(registerError, "email")}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="block">
                <label className="mb-1 block text-[14px] font-medium text-text-primary">
                  No. Telepon
                </label>
                <input
                  type="tel"
                  name="telephoneNumber"
                  placeholder="08123456789"
                  className={getFieldError(registerError, "telephoneNumber") ? inputErrorClass : inputDefaultClass}
                  value={registerForm.telephoneNumber}
                  onChange={handleRegisterChange}
                />
                {getFieldError(registerError, "telephoneNumber") && (
                  <span className="mt-1 block text-[11px] text-error">
                    {getFieldError(registerError, "telephoneNumber")}
                  </span>
                )}
              </div>
              <div className="block">
                <label className="mb-1 block text-[14px] font-medium text-text-primary">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="dob"
                  className={getFieldError(registerError, "dob") ? inputErrorClass : inputDefaultClass}
                  value={registerForm.dob}
                  onChange={handleRegisterChange}
                />
                {getFieldError(registerError, "dob") && (
                  <span className="mt-1 block text-[11px] text-error">
                    {getFieldError(registerError, "dob")}
                  </span>
                )}
              </div>
            </div>
            <div className="block">
              <label className="mb-1 block text-[14px] font-medium text-text-primary">
                Jenis Kelamin
              </label>
              <select
                name="gender"
                className={`${getFieldError(registerError, "gender") ? inputErrorClass : inputDefaultClass} bg-surface`}
                value={registerForm.gender}
                onChange={handleRegisterChange}
              >
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
              {getFieldError(registerError, "gender") && (
                <span className="mt-1 block text-[11px] text-error">
                  {getFieldError(registerError, "gender")}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="block">
                <label className="mb-1 block text-[14px] font-medium text-text-primary">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Buat password"
                  className={getFieldError(registerError, "password") ? inputErrorClass : inputDefaultClass}
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                />
                {getFieldError(registerError, "password") && (
                  <span className="mt-1 block text-[11px] text-error">
                    {getFieldError(registerError, "password")}
                  </span>
                )}
              </div>
              <div className="block">
                <label className="mb-1 block text-[14px] font-medium text-text-primary">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Ulangi password"
                  className={getFieldError(registerError, "confirmPassword") ? inputErrorClass : inputDefaultClass}
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                />
                {getFieldError(registerError, "confirmPassword") && (
                  <span className="mt-1 block text-[11px] text-error">
                    {getFieldError(registerError, "confirmPassword")}
                  </span>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isRegisterPending}
              className="w-full rounded-xl bg-primary px-4 py-3 text-[14px] font-semibold text-white transition-all duration-150 hover:bg-primary-hover disabled:bg-border disabled:text-[#9CA3AF] disabled:cursor-not-allowed"
            >
              {isRegisterPending ? "Memproses..." : "Buat Akun"}
            </button>
            <p className="text-center text-[11px] text-text-secondary">
              Dengan mendaftar, Anda setuju dengan syarat layanan.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
