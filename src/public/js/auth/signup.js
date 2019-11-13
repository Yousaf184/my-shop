import { addFormSubmitEventListener, removeInvalidState, startBtnLoadingState } from '../utils.js';

const $signupForm = document.getElementById('signup-form');
const $signupBtn = document.getElementById('signup-btn');
const $loadActivator = document.getElementById('load-activator');
const requestUrl = 'http://localhost:3000/signup';

startBtnLoadingState($signupBtn, document.querySelectorAll('input'));

addFormSubmitEventListener($signupForm, requestUrl, false, (response) => {
    // remove signup button loading state
    $loadActivator.checked = false;

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