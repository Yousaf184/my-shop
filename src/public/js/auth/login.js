import { startBtnLoadingState } from '../utils.js';

const $loginBtn = document.getElementById('login-btn');
startBtnLoadingState($loginBtn, document.querySelectorAll('input'));