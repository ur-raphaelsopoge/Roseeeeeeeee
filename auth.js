const USERS_KEY = 'monkey_users';
const SESSION_KEY = 'monkey_session';
const NOTICE_KEY = 'monkey_notice';
const SHOP_PAGE = 'project.html';

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const formMessage = document.getElementById('formMessage');

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `form-message ${type}`;
  formMessage.hidden = false;
}

function showPendingNotice() {
  const raw = sessionStorage.getItem(NOTICE_KEY);
  if (!raw) return;

  sessionStorage.removeItem(NOTICE_KEY);

  try {
    const { text, type } = JSON.parse(raw);
    showMessage(text, type);
  } catch (error) {
    formMessage.hidden = true;
  }
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function createSalt() {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(digest));
}

function setupPasswordToggles() {
  document.querySelectorAll('.toggle-password').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('input');
      const showing = input.type === 'text';

      input.type = showing ? 'password' : 'text';
      button.textContent = showing ? 'Show' : 'Hide';
      button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    });
  });
}

function setSubmitting(form, submitting) {
  form.querySelector('button[type="submit"]').disabled = submitting;
}

async function handleLogin(event) {
  event.preventDefault();
  setSubmitting(loginForm, true);

  const identifier = loginForm.elements.username.value.trim().toLowerCase();
  const password = loginForm.elements.password.value;

  try {
    const users = readStorage(USERS_KEY, []);
    const user = users.find((item) => item.username.toLowerCase() === identifier || item.email === identifier);
    const passwordHash = user ? await hashPassword(password, user.salt) : null;

    if (!user || passwordHash !== user.hash) {
      showMessage('Incorrect username or password.', 'error');
      return;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username }));
    window.location.href = SHOP_PAGE;
  } catch (error) {
    showMessage('Something went wrong. Please open this page through localhost or HTTPS and try again.', 'error');
  } finally {
    setSubmitting(loginForm, false);
  }
}

async function handleSignup(event) {
  event.preventDefault();

  const email = signupForm.elements.email.value.trim().toLowerCase();
  const username = signupForm.elements.username.value.trim();
  const password = signupForm.elements.password.value;
  const confirmPassword = signupForm.elements.confirmPassword.value;

  if (password !== confirmPassword) {
    showMessage('Passwords do not match.', 'error');
    return;
  }

  setSubmitting(signupForm, true);

  try {
    const users = readStorage(USERS_KEY, []);

    if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
      showMessage('That username is already taken.', 'error');
      return;
    }

    if (users.some((user) => user.email === email)) {
      showMessage('An account with that email already exists.', 'error');
      return;
    }

    const salt = createSalt();
    const hash = await hashPassword(password, salt);

    users.push({ email, username, salt, hash });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    sessionStorage.setItem(NOTICE_KEY, JSON.stringify({
      text: 'Account created. You can log in now.',
      type: 'success',
    }));
    window.location.href = 'login.html';
  } catch (error) {
    showMessage('Something went wrong. Please open this page through localhost or HTTPS and try again.', 'error');
  } finally {
    setSubmitting(signupForm, false);
  }
}

if (readStorage(SESSION_KEY, null)) {
  window.location.replace(SHOP_PAGE);
}

setupPasswordToggles();
showPendingNotice();

if (loginForm) loginForm.addEventListener('submit', handleLogin);
if (signupForm) signupForm.addEventListener('submit', handleSignup);