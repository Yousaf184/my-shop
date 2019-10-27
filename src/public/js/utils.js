// displays error message and marks input fields as invalid
const displayFormError = (error) => {
    const $messageBlock = document.querySelector(`.${error.name}`);

    $messageBlock.textContent = error.message;
    $messageBlock.classList.add('show-error-msg');

    // change border color of invalid fields to red
    error.invalidFields.forEach((fieldName) => {
        document.getElementById(fieldName).classList.add('invalid');
    });
};

// when submitted, if form was in invalid state before submission,
// remove form's invalid state
const removeFormInvalidState = ($form) => {
    const $errorElements = $form.querySelectorAll('.error-msg');
    const $inputFields = $form.querySelectorAll('input');
    $errorElements.forEach($span => $span.classList.remove('show-error-msg'));
    $inputFields.forEach($input => $input.classList.remove('invalid'));
};

/**
 * add submit event listener to the form passed in as an argument
 *
 * @param $form form to on which submit event listener is to be attached
 * @param requestUrl the url where this '$form' will be submitted
 * @param passCsrfToken boolean value, will be true only in case of post request from edit product page
 * @param callback callback function to execute
 */
export const addFormSubmitEventListener = ($form, requestUrl, passCsrfToken, callback) => {

    $form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // when $form is either add product form or edit product form then
        // if tinyMCE editor is empty, show error message about required field.
        //
        // this is needed because textarea that is replaced by tinyMCE editor
        // doesn't have 'required' attribute so when form submit button is clicked,
        // it will submit the form.
        //
        // So to indicate to user that product description is required field,
        // show the error message
        if (
            $form.classList.contains('add-product-form') ||
            $form.classList.contains('edit-product-form') &&
            tinymce.activeEditor.getContent({ format: 'text' }).trim() === ''
        ) {
            const $productDescError = document.getElementById('product-desc-error');
            $productDescError.classList.add('show-error-msg');
            $productDescError.textContent = 'product description is required';
            return;
        }

        // disable submit btn and show loading image
        toggleSubmitBtnAndLoadingImg($form);
        // remove form's invalid state if form was invalid before submission
        removeFormInvalidState($form);

        const form = new FormData($form);
        const request = {
            method: 'POST',
            body: form
        };

        if (passCsrfToken) {
            // csrf token needs to sent in header with ajax request
            request.headers = {
                'CSRF-Token': $form.elements['_csrf'].value,
            }
        }

        try {
            let response = await fetch(requestUrl, request);
            response = await response.json();
            // enable submit btn and hide loading image
            toggleSubmitBtnAndLoadingImg($form);

            if (response.status.toLowerCase() === 'error') {
                // for each error object in error response array
                response.errors.forEach((err) => {
                    displayFormError(err);
                });
            }

            // if callback paramter isn't null
            if (callback) callback(response);

        } catch (error) {
            console.log(error);
        }
    });
};

// if any field is in invalid state (red border and error message shown),
// remove its invalid state when user starts typing in it
export const removeInvalidState = (e) => {
    e.target.classList.remove('invalid');

    const $errorMsg = e.target.nextElementSibling;

    if ($errorMsg.nodeName === 'SPAN') {
        $errorMsg.textContent = '';
        $errorMsg.classList.remove('show-error-msg');
        return;
    }

    $errorMsg.classList.remove('show-msg-block');
};

function toggleSubmitBtnAndLoadingImg($form) {
    $form.querySelector('#form-submit-btn').classList.toggle('disable-control');
    $form.querySelector('#loading-img').classList.toggle('show-loading-img');
}