import { addFormSubmitEventListener, removeInvalidState } from '../utils.js';

const $forgotPasswordForm = document.getElementById('forgot-password-form');
const requestUrl = 'http://localhost:3000/forgot-password';

addFormSubmitEventListener($forgotPasswordForm, requestUrl, false, (response) => {
    if (response.status.toLowerCase() === 'success') {
        document.getElementById('success-msg-block').classList.add('show-msg-block');

        // clear field
        $forgotPasswordForm.elements['user-email-field'].value = '';
    }
});

$forgotPasswordForm.elements['user-email-field'].addEventListener('input', (e) => removeInvalidState(e));