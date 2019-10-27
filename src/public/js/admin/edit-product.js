import { addFormSubmitEventListener, removeInvalidState } from '../utils.js';

const $editProductForm = document.getElementById('edit-product-form');
const $productDescError = document.getElementById('product-desc-error');
const $productDescField = document.getElementById('product-description-field');
const $formSubmitBtn = document.getElementById('form-submit-btn');
let requestUrl;
const isAddProductForm = $editProductForm.classList.contains('add-product-form');

if (isAddProductForm) {
    requestUrl = 'http://localhost:3000/admin/add-product'
} else {
    requestUrl = 'http://localhost:3000/admin/edit-product'
}

const getCallbackFunction = () => {
    if (isAddProductForm) {
        return (response) => {
            if (response.status.toLowerCase() === 'success') {
                document.getElementById('success-msg-block').classList.add('show-msg-block');

                // clear fields
                $editProductForm.elements['product-name-field'].value = '';
                $editProductForm.elements['product-image-field'].value = '';
                $editProductForm.elements['product-price-field'].value = '';
                $editProductForm.elements['product-description-field'].value = '';
                tinymce.activeEditor.setContent('');
                // scroll to top when new product has been added
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        };
    }
    else {
        return (response) => {
            if (response.status.toLowerCase() === 'success') {
                window.location.href = '/admin/products';
            }
        };
    }
};

addFormSubmitEventListener($editProductForm, requestUrl, true, getCallbackFunction());

$editProductForm.elements['product-name-field'].addEventListener('input', (e) => removeInvalidState(e));
$editProductForm.elements['product-image-field'].addEventListener('click', (e) => removeInvalidState(e));
$editProductForm.elements['product-description-field'].addEventListener('input', (e) => removeInvalidState(e));