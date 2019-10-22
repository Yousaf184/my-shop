const $collapsibleNav1 = document.getElementById('collapsible-nav-1');
const $collapsibleNav2 = document.getElementById('collapsible-nav-2');
const $collapsedNavPlaceholder = document.getElementById('collapsed-nav-placeholder');
const $hamburgerBtn = document.getElementById('hamburger-btn');
const $body = document.getElementById('body');

if (window.innerWidth <= 750) {
    collapseNavbar();
}

$body.addEventListener('click', (e) => {
    if (e.target === $hamburgerBtn || e.target.classList.contains('bar')) {
        $collapsedNavPlaceholder.classList.toggle('open-collapsed-navbar')
    } else {
        $collapsedNavPlaceholder.classList.remove('open-collapsed-navbar')
    }
});

window.addEventListener('resize', (e) => {
    if (window.innerWidth <= 750) {
        collapseNavbar();
    } else {
        removeCollapsedNavbar();
    }
});

function collapseNavbar() {
    $collapsedNavPlaceholder.insertAdjacentElement('afterbegin', $collapsibleNav1);
    $collapsedNavPlaceholder.insertAdjacentElement('beforeend', $collapsibleNav2);
}

function removeCollapsedNavbar() {
    const $navFirstChild = document.getElementById('navbar-first-child');
    const $navLastChild = document.getElementById('navbar-last-child');

    $navFirstChild.insertAdjacentElement('beforeend', $collapsibleNav1);
    $navLastChild.insertAdjacentElement('afterbegin', $collapsibleNav2);
}



