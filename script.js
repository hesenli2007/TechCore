// === FIREBASE CONFIG ===
const firebaseConfig = {
    apiKey: "AIzaSyAI2rM3vttKrDI9C4vDD41_hcXurLvQ6gw",
    authDomain: "it-inventory-tracker-61d2c.firebaseapp.com",
    projectId: "it-inventory-tracker-61d2c",
    storageBucket: "it-inventory-tracker-61d2c.firebasestorage.app",
    messagingSenderId: "557225811726",
    appId: "1:557225811726:web:f85c3ca033997d2f95c15f",
    measurementId: "G-9SM2Y2QGC3"
};

try { firebase.initializeApp(firebaseConfig); } catch (e) { console.error(e); }
const auth = firebase.auth();
const db = firebase.firestore();

// === KÖMƏKÇİ FUNKSİYALAR ===

// 1. Domain Yoxlaması (@karabakh.edu.az olmalıdır)
function isKarabakhEmail(email) {
    return email.toLowerCase().endsWith('@karabakh.edu.az');
}

// 2. VIP SİYAHI YOXLAMASI (Bazada varmı?)
async function checkWhitelist(email) {
    try {
        const snapshot = await db.collection("allowed_users")
                                 .where("email", "==", email.toLowerCase().trim())
                                 .get();
        return !snapshot.empty;
    } catch (error) {
        console.error("Siyahı yoxlanarkən xəta:", error);
        return false;
    }
}

// === TABLAR ===
const tabLinks = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');
tabLinks.forEach(link => {
    link.addEventListener('click', () => {
        const tabId = link.getAttribute('data-tab');
        tabLinks.forEach(item => item.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        link.classList.add('active');
        document.getElementById(tabId + '-form').classList.add('active');
    });
});

// === ŞİFRƏ GÖSTƏR/GİZLƏ ===
const passwordToggles = document.querySelectorAll('.toggle-password');
passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const input = toggle.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        toggle.classList.toggle('fa-eye-slash');
        toggle.classList.toggle('fa-eye');
    });
});

// === MODAL ===
const helpModal = document.getElementById("help-modal");
if(helpModal) {
    document.getElementById("help-btn").onclick = () => { helpModal.style.display = "block"; }
    document.getElementById("help-modal-close").onclick = () => { helpModal.style.display = "none"; }
    window.addEventListener('click', (event) => { if (event.target == helpModal) helpModal.style.display = "none"; });
}

// =======================================================
// === QEYDİYYAT (VIP SİYAHI YOXLAMASI İLƏ) ===
// =======================================================
const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value.toLowerCase().trim();
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;

        // 1. Domain Yoxlaması
        if (!isKarabakhEmail(email)) {
            alert("Qeydiyyat qadağandır!\nYalnız @karabakh.edu.az korporativ maili qəbul olunur.");
            return;
        }

        // 2. VIP Siyahı Yoxlaması
        const isAllowed = await checkWhitelist(email);
        if (!isAllowed) {
            alert("DİQQƏT: Sizin mailiniz sistemin icazəli siyahısında yoxdur.\n\nXahiş edirik İnzibatçı (Admin) ilə əlaqə saxlayın ki, mailinizi sistemə əlavə etsin.");
            return;
        }

        // 3. Şifrə uyğunluğu
        if (password !== passwordConfirm) {
            alert("Şifrələr uyğun deyil");
            return;
        }

        // 4. Qeydiyyatı tamamla
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                // Admin mailini yoxlayırıq, əks halda adi user (amma statusu active)
                let userRole = (email === 'admin@karabakh.edu.az') ? "admin" : "user";

                db.collection("users").doc(user.uid).set({
                    name: name,
                    email: user.email,
                    role: userRole,
                    status: 'active' // YENİ: Qeydiyyat zamanı status aktiv olur
                })
                .then(() => {
                    user.sendEmailVerification().then(() => {
                        alert(`Uğurlu! Hesabınız yaradıldı. ${email} ünvanına gedən TƏSDİQ linkinə daxil olun.`);
                        auth.signOut();
                        registerForm.reset();
                        document.querySelector('.tab-link[data-tab="login"]').click();
                    });
                });
            })
            .catch((error) => {
                if (error.code === 'auth/email-already-in-use') alert("Bu mail artıq qeydiyyatdan keçib.");
                else alert("Xəta: " + error.message);
            });
    });
}

// =======================================================
// === GİRİŞ SİSTEMİ (TechCore Məntiqi ilə) ===
// =======================================================

const loginForm = document.getElementById('login-form');
const forgotLink = document.getElementById('forgot-link');
const loginBtn = document.getElementById('login-btn');
const resetBtn = document.getElementById('reset-btn');
const passwordGroup = document.getElementById('password-group');

let isResetMode = false;

if(forgotLink && loginBtn && resetBtn) {
    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        isResetMode = !isResetMode;

        if (isResetMode) {
            // SIFIRLAMA REJİMİ
            if(passwordGroup) passwordGroup.style.display = 'none';
            loginBtn.style.display = 'none';
            resetBtn.style.display = 'block';
            forgotLink.textContent = "Geri qayıt";
        } else {
            // GİRİŞ REJİMİ
            if(passwordGroup) passwordGroup.style.display = 'block';
            loginBtn.style.display = 'block';
            resetBtn.style.display = 'none';
            forgotLink.textContent = "Şifrəni unutmuşam";
        }
    });
}

// SIFIRLAMA
if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;

        if (!email) { alert("Mail yazın!"); return; }
        if (!isKarabakhEmail(email)) { alert("Yalnız @karabakh.edu.az"); return; }

        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert("Sıfırlama linki göndərildi!");
                forgotLink.click();
            })
            .catch((error) => {
                if(error.code === 'auth/user-not-found') alert("Bu istifadəçi tapılmadı.");
                else alert("Xəta: " + error.message);
            });
    });
}

// GİRİŞ
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if(isResetMode) return;

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!isKarabakhEmail(email)) { alert("Yalnız @karabakh.edu.az"); return; }

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                // Mail təsdiqi yoxlanışı
                if (!user.emailVerified) {
                    alert("Zəhmət olmasa mailinizi təsdiqləyin!");
                    auth.signOut();
                    return;
                }

                // İstifadəçi məlumatlarını və STATUSUNU yoxlayırıq
                const userDocRef = db.collection("users").doc(user.uid);
                userDocRef.get().then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();

                        // YENİ: Deaktiv status yoxlanışı
                        if (userData.status === 'deactivated') {
                            alert("Sizin hesabınız Admin tərəfindən deaktiv edilib. Giriş qadağandır.");
                            auth.signOut();
                            return;
                        }

                        // Roluna görə yönləndirmə
                        if (userData.role === 'admin') {
                            window.location.href = "admin.html";
                        } else {
                            // Userlər (Köməkçi Adminlər) dashboard-a gedir
                            window.location.href = "dashboard.html";
                        }
                    } else {
                        alert("İstifadəçi məlumatları tapılmadı.");
                        auth.signOut();
                    }
                });
            })
            .catch((error) => {
                console.error(error);
                alert("Giriş xətası: Şifrə və ya mail səhvdir.");
            });
    });
}
