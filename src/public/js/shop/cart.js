const $body = document.getElementById('body');
const incQuantityReqUrl = 'http://localhost:3000/cart/increase';
const decQuantityReqUrl = 'http://localhost:3000/cart/decrease';

// get product quantity span element and loading image element
// related to the form paramter passed in to this function
// return both element elements in an array
const getHtmlElements = ($form) => {
    const $productInfoDiv = $form.parentElement.parentElement.previousElementSibling;
    const $productQuantityDiv = $productInfoDiv.lastElementChild.lastElementChild;
    const $quantity = $productQuantityDiv.querySelector('#quantity');
    const $loadingImage = $productQuantityDiv.querySelector('#loading-img');

    return [$quantity, $loadingImage];
};

// increaseQuantity paramter is boolean value
// indicating whether to increment or decrement product quantity
// htmlElements in an array containing different html elements, which
// should be updated, related to the form that was submitted.
const changeProdQuantityOnUI = (response, increaseQuantity, ...htmlElements) => {
    const [$productQuantity, $loadingImg, $increaseQuantityBtn, $decreaseQuantityBtn] = htmlElements;
    $loadingImg.classList.toggle('show');
    const quantity = parseInt($productQuantity.textContent);

    if (increaseQuantity) {
        $increaseQuantityBtn.classList.remove('disable-control');
        $decreaseQuantityBtn.classList.remove('disable-control');
    } else if (!increaseQuantity && quantity > 2) {
        $decreaseQuantityBtn.classList.remove('disable-control');
    }

    // update product quantity on cart page
    if (response.status.toLowerCase() === 'success') {
        if (increaseQuantity) {
            $productQuantity.textContent = quantity + 1;
        } else {
            $productQuantity.textContent = quantity - 1;
        }
    }
};

const submitForm = async ($form, requestUrl, callback) => {
    const form = new FormData($form);
    const request = {
        method: 'POST',
        body: form,
        headers: {
            'CSRF-Token': $form.elements['_csrf'].value
        }
    };

    try {
        let response = await fetch(requestUrl, request);
        response = await response.json();

        if (response.status.toLowerCase() === 'error') {
            throw new Error(response.message);
        }

        // if callback paramter isn't null
        if (callback) {
            callback(response);
        }

    } catch (error) {
        console.log(error);
        const $msgBlock = document.getElementById('err-msg-block');
        $msgBlock.textContent = error.message;
        $msgBlock.classList.add('show-msg-block');
    }
};

$body.addEventListener('submit', (e) => {
    // if its remove product form then return
    if (e.target.classList.contains('remove-product-control')) {
        return;
    }

    e.preventDefault();
    const [$productQuantity, $loadingImg] = getHtmlElements(e.target);

    // if increase product quantity form is submitted
    if (e.target.classList.contains('increase-quantity-control')) {
        const $increaseQuantityBtn = e.target.querySelector('#increase-btn');
        const $decreaseQuantityBtn = e.target.nextElementSibling.querySelector('#decrease-btn');

        $increaseQuantityBtn.classList.add('disable-control');

        submitForm(e.target, incQuantityReqUrl, (response) => {
            changeProdQuantityOnUI(
                response, true, $productQuantity, $loadingImg, $increaseQuantityBtn, $decreaseQuantityBtn
            );
        });

    } // if deccrease product quantity form is submitted
    else if (e.target.classList.contains('decrease-quantity-control')) {
        const $increaseQuantityBtn = e.target.previousElementSibling.querySelector('#increase-btn');
        const $decreaseQuantityBtn = e.target.querySelector('#decrease-btn');

        $decreaseQuantityBtn.classList.add('disable-control');

        submitForm(e.target, decQuantityReqUrl, (response) => {
            changeProdQuantityOnUI(
                response, false, $productQuantity, $loadingImg, $increaseQuantityBtn, $decreaseQuantityBtn
            );
        });
    }

    $loadingImg.classList.toggle('show');
});
