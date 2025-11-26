const API_BASE_URL = "http://localhost:3000/api";

const storageKeys = {
  verifyEmailUserId: "russo_bet_verify_user_id",
  verifyEmailEmail: "russo_bet_verify_email",
  loginUserId: "russo_bet_login_user_id",
  loginEmail: "russo_bet_login_email",
  authToken: "russo_bet_auth_token"
};

const navigate = (path) => {
  window.location.href = path;
};

const setText = (selector, text) => {
  const el = document.querySelector(selector);
  if (el) {
    el.textContent = text;
  }
};

const setError = (message) => {
  setText("[data-feedback-error]", message || "");
};

const setSuccess = (message) => {
  setText("[data-feedback-success]", message || "");
};

const clearFeedback = () => {
  setError("");
  setSuccess("");
};

const handleRegisterPage = () => {
  const form = document.querySelector("[data-form-register]");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFeedback();

    const fullName = form.fullName.value.trim();
    const birthDate = form.birthDate.value.trim();
    const cpf = form.cpf.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!fullName || !birthDate || !cpf || !phone || !email || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          birthDate,
          cpf,
          phone,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "email_in_use") {
          setError("Esse e-mail já está em uso.");
        } else if (data.error === "cpf_in_use") {
          setError("Esse CPF já está em uso.");
        } else if (data.error === "invalid_cpf") {
          setError("CPF inválido.");
        } else if (data.error === "invalid_phone") {
          setError("Telefone inválido.");
        } else if (data.error === "invalid_email") {
          setError("E-mail inválido.");
        } else {
          setError("Não foi possível concluir o cadastro.");
        }
        return;
      }

      localStorage.setItem(storageKeys.verifyEmailUserId, String(data.userId));
      localStorage.setItem(storageKeys.verifyEmailEmail, email);

      navigate("./verify-email.html");
    } catch (error) {
      setError("Erro de conexão com o servidor.");
    }
  });
};

const handleVerifyEmailPage = () => {
  const form = document.querySelector("[data-form-verify-email]");
  if (!form) {
    return;
  }

  const userId = localStorage.getItem(storageKeys.verifyEmailUserId);
  const email = localStorage.getItem(storageKeys.verifyEmailEmail);

  if (!userId) {
    navigate("./register.html");
    return;
  }

  if (email) {
    setText("[data-verify-email-label]", email);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFeedback();

    const code = form.code.value.trim();

    if (!code) {
      setError("Informe o código recebido por e-mail.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: Number(userId),
          code
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "invalid_code") {
          if (data.reason === "expired") {
            setError("Código expirado. Faça o cadastro novamente.");
          } else {
            setError("Código inválido.");
          }
        } else {
          setError("Não foi possível validar o e-mail.");
        }
        return;
      }

      localStorage.removeItem(storageKeys.verifyEmailUserId);
      localStorage.removeItem(storageKeys.verifyEmailEmail);

      setSuccess("E-mail verificado com sucesso.");
      setTimeout(() => {
        navigate("./login.html");
      }, 900);
    } catch (error) {
      setError("Erro de conexão com o servidor.");
    }
  });
};

const handleLoginPage = () => {
  const form = document.querySelector("[data-form-login]");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFeedback();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      setError("Informe e-mail e senha.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "email_not_found" || data.error === "invalid_credentials") {
          setError("Credenciais inválidas.");
        } else if (data.error === "user_not_active") {
          setError("Seu e-mail ainda não foi verificado.");
        } else if (data.error === "wrong_password") {
          setError("Senha incorreta.");
        } else {
          setError("Não foi possível iniciar o login.");
        }
        return;
      }

      localStorage.setItem(storageKeys.loginUserId, String(data.userId));
      localStorage.setItem(storageKeys.loginEmail, email);

      navigate("./verify-login.html");
    } catch (error) {
      setError("Erro de conexão com o servidor.");
    }
  });
};

const handleVerifyLoginPage = () => {
  const form = document.querySelector("[data-form-verify-login]");
  if (!form) {
    return;
  }

  const userId = localStorage.getItem(storageKeys.loginUserId);
  const email = localStorage.getItem(storageKeys.loginEmail);

  if (!userId) {
    navigate("./login.html");
    return;
  }

  if (email) {
    setText("[data-verify-login-email]", email);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFeedback();

    const code = form.code.value.trim();

    if (!code) {
      setError("Informe o código recebido por e-mail.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: Number(userId),
          code
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "invalid_code") {
          if (data.reason === "expired") {
            setError("Código expirado, faça login novamente.");
          } else {
            setError("Código inválido.");
          }
        } else {
          setError("Não foi possível concluir o login.");
        }
        return;
      }

      localStorage.removeItem(storageKeys.loginUserId);
      localStorage.removeItem(storageKeys.loginEmail);
      localStorage.setItem(storageKeys.authToken, data.token);

      navigate("./dashboard.html");
    } catch (error) {
      setError("Erro de conexão com o servidor.");
    }
  });
};

const ensureAuthForDashboard = () => {
  const body = document.body;
  if (!body || !body.dataset.page) {
    return;
  }
  if (body.dataset.page !== "dashboard") {
    return;
  }
  const token = localStorage.getItem(storageKeys.authToken);
  if (!token) {
    navigate("./login.html");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page || "";

  if (page === "register") {
    handleRegisterPage();
  } else if (page === "verify-email") {
    handleVerifyEmailPage();
  } else if (page === "login") {
    handleLoginPage();
  } else if (page === "verify-login") {
    handleVerifyLoginPage();
  }

  ensureAuthForDashboard();
});