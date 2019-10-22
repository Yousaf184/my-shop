import { addFormSubmitEventListener, removeInvalidState } from '../utils.js';

const $signupForm = document.getElementById('signup-form');
const requestUrl = 'http://localhost:3000/signup';

addFormSubmitEventListener($signupForm, requestUrl, false, (response) => {
    if (response.status.toLowerCase() === 'success') {
        document.getElementById('success-msg-block').classList.add('show-msg-block');

        // clear fields
        $signupForm.elements['user-name-field'].value = '';
        $signupForm.elements['user-email-field'].value = '';
        $signupForm.elements['user-password-field'].value = '';
        $signupForm.elements['user-cnf-password-field'].value = '';
    }
});

$signupForm.elements['user-name-field'].addEventListener('input', (e) => removeInvalidState(e));
$signupForm.elements['user-email-field'].addEventListener('input', (e) => removeInvalidState(e));
$signupForm.elements['user-password-field'].addEventListener('input', (e) => removeInvalidState(e));
$signupForm.elements['user-cnf-password-field'].addEventListener('input', (e) => removeInvalidState(e));