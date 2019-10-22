const stripe = Stripe('pk_test_olbMGPKYThBmahdHfJMBGIqH00AeUZrXFB');
const elements = stripe.elements();

const $btn = document.getElementById('payment-btn');
const $loadingImg = document.getElementById('loading-img');

// Custom styling can be passed to options when creating an Element.
const style = {
    base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
        color: '#aab7c4'
        }
    },
    invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
    }
};

// Create an instance of the card Element.
const card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element');

card.addEventListener('change', (event) => {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
});

// Create a token or display an error when the form is submitted.
const form = document.getElementById('payment-form');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    // disable payment submit button
    // show loading image
    togglePaymentBtnAndLoadingImg();

    stripe.createToken(card)
        .then((result) => {
            if (result.error) {
                // Inform the customer that there was an error.
                var errorElement = document.getElementById('card-errors');
                errorElement.textContent = result.error.message;
            } else {
                // Send the token to your server.
                stripeTokenHandler(result.token);
            }
        });
});

function stripeTokenHandler(token) {
    // Insert the token ID into the form so it gets submitted to the server
    const form = document.getElementById('payment-form');
    const hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'stripeToken');
    hiddenInput.setAttribute('value', token.id);
    form.appendChild(hiddenInput);

    // Submit the form
    //form.submit();

    // call submitForm function instead of 'form.submit()'
    // to enable payment submit button after response and
    // show any error that may be thrown by code other than that of stripe
    submitForm(form);
}

async function submitForm(paymentForm) {
    try {
        const form = new FormData(paymentForm);
        const requestUrl = 'http://localhost:3000/order';

        let response = await fetch(requestUrl, { method: 'POST', body: form });
        response = await response.json();

        if (response.status.toLowerCase() === 'error') {
            const $msgBlock = document.getElementById('msg-block');
            $msgBlock.textContent = response.message;
            $msgBlock.classList.add('show-msg-block');

            // enable payment submit button
            // hide loading image
            togglePaymentBtnAndLoadingImg();
        } else {
            window.location.href = '/orders';
        }

    } catch (error) {
        console.log(error.message);
    }
}

function togglePaymentBtnAndLoadingImg() {
    $loadingImg.classList.toggle('show-loading-img');
    $btn.classList.toggle('disable-control');
}