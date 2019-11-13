import { addFormSubmitEventListener, removeInvalidState, startBtnLoadingState } from '../utils.js';

const $forgotPasswordForm = document.getElementById('forgot-password-form');
const $forgotPasswordBtn = document.getElementById('forgot-password-btn');
const $loadActivator = document.getElementById('load-activator');
const requestUrl = 'http://localhost:3000/forgot-password';

startBtnLoadingState($forgotPasswordBtn, document.querySelectorAll('input'));

addFormSubmitEventListener($forgotPasswordForm, requestUrl, false, (response) => {
    // remove signup button loading state
    $loadActivator.checked = false;

    if (response.status.toLowerCase() === 'success') {
        document.getElementById('success-msg-block').classList.add('show-msg-block');

        // clear field
        $forgotPasswordForm.elements['user-email-field'].value = '';
    }
});

$forgotPasswordForm.elements['user-email-field'].addEventListener('input', (e) => removeInvalidState(e));