import { addFormSubmitEventListener, removeInvalidState } from '../utils.js';

const $resetPasswordForm = document.getElementById('password-reset-form');
const requestUrl = 'http://localhost:3000/reset-password';

addFormSubmitEventListener($resetPasswordForm, requestUrl, false, (response) => {
    // if response contains 'isValidationError' propery, don't hide the password reset form
    if (typeof response.isValidationError !== 'undefined' && response.isValidationError !== null) {
        return;
    }

    const $msgBlock = document.getElementById('msg-block');
    $resetPasswordForm.style.display = 'none';

    if (response.status.toLowerCase() === 'error') {
        $msgBlock.classList.add('error-msg-block');
        $msgBlock.textContent = response.errors[0].message;
    } else if (response.status.toLowerCase() === 'success') {
        $msgBlock.classList.add('success-msg-block');
        $msgBlock.textContent = response.message;
    }

    $msgBlock.classList.add('show-msg-block');
});

$resetPasswordForm.elements['user-password-field'].addEventListener('input', (e) => removeInvalidState(e));