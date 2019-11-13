import { addFormSubmitEventListener, removeInvalidState, startBtnLoadingState } from '../utils.js';

const $resetPasswordForm = document.getElementById('password-reset-form');
const $resetPasswordBtn = document.getElementById('reset-password-btn');
const $loadActivator = document.getElementById('load-activator');
const requestUrl = 'http://localhost:3000/reset-password';

startBtnLoadingState($resetPasswordBtn, document.querySelectorAll('input'));

addFormSubmitEventListener($resetPasswordForm, requestUrl, false, (response) => {
    // remove signup button loading state
    $loadActivator.checked = false;

    // if response contains 'isValidationError' property, don't hide the password reset form
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