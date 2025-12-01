import { AuthManager } from './authManager.js';

function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const eyeOpenIcon = document.getElementById('eye-open');
    const eyeClosedIcon = document.getElementById('eye-closed');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        if (eyeOpenIcon) eyeOpenIcon.style.display = 'inline';
        if (eyeClosedIcon) eyeClosedIcon.style.display = 'none';
    } else {
        passwordField.type = 'password';
        if (eyeOpenIcon) eyeOpenIcon.style.display = 'none';
        if (eyeClosedIcon) eyeClosedIcon.style.display = 'inline';
    }
}
window.togglePasswordVisibility = togglePasswordVisibility;

async function handleLogin(event) {
    event.preventDefault();

    const authManager = new AuthManager();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('password');
    const submitButton = event.submitter;

    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value.trim() || "";

    if (!emailInput) {
        console.error("No se encontró el campo 'login-email'. Asegúrate de que el ID esté correcto en el HTML.");
        return;
    }

    if (email === "" || password === "") {
        alert("No puedes dejar campos vacíos."); return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        alert("Ingresa un correo electrónico válido."); return;
    }


    if (submitButton) submitButton.disabled = true;

    const authResult = await authManager.iniciarSesion(email, password);

    if (!authResult.success) {
        if (submitButton) submitButton.disabled = false;
        alert("Error: El correo o la contraseña son incorrectos.");
        return;
    }

    const perfilUsuario = await authManager.getPerfilActual();

    if (!perfilUsuario || perfilUsuario.rol !== 'administrador') {
        await authManager.cerrarSesion();
        if (submitButton) submitButton.disabled = false;
        alert("Acceso denegado. Solo los administradores pueden acceder por esta vía.");
        return;
    }

    localStorage.setItem("usuarioEmail", email);
    localStorage.setItem("usuarioId", perfilUsuario.id);
    localStorage.setItem("usuarioRol", perfilUsuario.rol);

    alert("Inicio de sesión de Administrador exitoso!");
    window.location.href = "administracion.html";
}
window.handleLogin = handleLogin;

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('togglePassword');
    if (toggleButton) {
        toggleButton.addEventListener('click', togglePasswordVisibility);
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const inputs = document.querySelectorAll('.input-field');

    inputs.forEach(input => {
        const updateLabelState = () => {
            const label = input.nextElementSibling;

            if (input.value.length > 0) {
                if (label) {
                    label.classList.add('peer-not-placeholder-shown:top-1.5', 'peer-not-placeholder-shown:text-xs', 'peer-not-placeholder-shown:font-medium', 'peer-not-placeholder-shown:text-gray-600');
                    label.classList.remove('top-4', 'text-base', 'text-gray-500');
                }
            } else {
                if (label && !input.matches(':focus')) {
                    label.classList.remove('peer-not-placeholder-shown:top-1.5', 'peer-not-placeholder-shown:text-xs', 'peer-not-placeholder-shown:font-medium', 'peer-not-placeholder-shown:text-gray-600');
                    label.classList.add('top-4', 'text-base', 'text-gray-500');
                }
            }
        };

        input.addEventListener('input', updateLabelState);
        input.addEventListener('blur', updateLabelState);
        input.addEventListener('focus', updateLabelState);

        updateLabelState();
    });
});