const translations = {
  az: {
    appSubtitle: "İnventar İdarəetmə Sistemi",
    login: "Daxil ol",
    register: "Qeydiyyat",
    emailLabel: "E-poçt ünvanı",
    passwordLabel: "Şifrə",
    confirmPasswordLabel: "Şifrəni təsdiqlə",
    fullNameLabel: "Tam ad",
    submitLogin: "Daxil ol",
    submitRegister: "Hesab Yarat",
    forgotPasswordLink: "Şifrəni unutmuşam?",
    sendResetLink: "Sıfırlama linkini göndər",
    helpModalTitle: "TechCore Haqqında",
    helpModalP1: "TechCore - Müəssisə daxili IT resurslarının izlənməsi və idarə edilməsi üçün platformadır.",
    helpModalP2: "Sistemdə iki növ istifadəçi var: Adminlər və İşçilər.",
    helpModalP3: "İşçilər görə bilər, amma dəyişə bilməz.",
    langAzerbaijani: "Azərbaycanca (AZ)",
    langEnglish: "English (EN)",
    langRussian: "Русский (RU)"
  },
  en: {
    appSubtitle: "Inventory Management System",
    login: "Login",
    register: "Register",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm Password",
    fullNameLabel: "Full Name",
    submitLogin: "Login",
    submitRegister: "Create Account",
    forgotPasswordLink: "Forgot Password?",
    sendResetLink: "Send Reset Link",
    helpModalTitle: "About TechCore",
    helpModalP1: "TechCore is a platform for tracking internal IT resources.",
    helpModalP2: "There are two user types: Admins and Staff.",
    helpModalP3: "Staff can view inventory but cannot edit.",
    langAzerbaijani: "Azerbaijani (AZ)",
    langEnglish: "English (EN)",
    langRussian: "Russian (RU)"
  },
  ru: {
    appSubtitle: "Система Управления Инвентарем",
    login: "Вход",
    register: "Регистрация",
    emailLabel: "Электронная почта",
    passwordLabel: "Пароль",
    confirmPasswordLabel: "Подтвердите пароль",
    fullNameLabel: "Полное имя",
    submitLogin: "Войти",
    submitRegister: "Создать аккаунт",
    forgotPasswordLink: "Забыли пароль?",
    sendResetLink: "Отправить ссылку сброса",
    helpModalTitle: "О TechCore",
    helpModalP1: "TechCore — платформа для отслеживания IT-ресурсов.",
    helpModalP2: "Два типа пользователей: Админы и Сотрудники.",
    helpModalP3: "Сотрудники могут просматривать, но не изменять.",
    langAzerbaijani: "Азербайджанский (AZ)",
    langEnglish: "Английский (EN)",
    langRussian: "Русский (RU)"
  }
};

let currentLang = localStorage.getItem('appLang') || 'az';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('appLang', lang);

  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    const value = translations?.[lang]?.[key];
    if (!value) return;

    // INPUT placeholder olanlara placeholder yaz
    if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
      el.placeholder = value;
      return;
    }

    // Digər elementlərə text
    el.textContent = value;
  });

  const langBtnText = document.querySelector('.lang-btn-text');
  if (langBtnText) langBtnText.textContent = lang.toUpperCase();

  const dropdown = document.getElementById('lang-dropdown');
  if (dropdown) dropdown.classList.remove('show');
}

function t(key) {
  return translations?.[currentLang]?.[key] || key;
}

window.setLanguage = setLanguage;
window.t = t;

document.addEventListener('DOMContentLoaded', () => {
  const langBtn = document.getElementById('lang-btn');
  const dropdown = document.getElementById('lang-dropdown');

  if (langBtn && dropdown) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });
    window.addEventListener('click', () => dropdown.classList.remove('show'));
  }

  setLanguage(currentLang);
});
