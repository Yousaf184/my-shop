const $loginBtn = document.getElementById('login-btn');
const $loadingImg = document.getElementById('loading-img');
const $loginForm = document.getElementById('login-form');

$loginBtn.addEventListener('click', (e) => {
    const email = $loginForm.elements['user-email-field'].value;
    const password = $loginForm.elements['user-password-field'].value;

    if (email.length > 0 && password.length > 0) {
        $loginBtn.classList.add('disable-control');
        $loadingImg.classList.add('show-loading-img');
    }
});