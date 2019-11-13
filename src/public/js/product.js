const $productsContainer = document.getElementById('products-container');

$productsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('load-btn')) {
        e.target.previousElementSibling.checked = true;
    }
});
