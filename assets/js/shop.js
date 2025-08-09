document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ duration: 700, offset: 80, once: true });

    const headerShopButton = document.getElementById('header-shop-button');
    if (headerShopButton && window.location.pathname.includes('shop.html')) {
        headerShopButton.classList.add('shop-active');
    }
    
    const mainHeaderLogoShopPage = document.getElementById('main-header-logo');
    let mainHeaderLogoScrollTimeoutShop;

    function handleMainHeaderLogoFadeShop() {
        if (!mainHeaderLogoShopPage || window.innerWidth < 1024) {
             if(mainHeaderLogoShopPage) mainHeaderLogoShopPage.style.opacity = '1';
            return;
        }
        clearTimeout(mainHeaderLogoScrollTimeoutShop);
        mainHeaderLogoScrollTimeoutShop = setTimeout(() => {
            const scrollY = window.scrollY;
            const fadeStart = 0; 
            const fadeEnd = 50; 
            let opacity = 1;
            if (scrollY <= fadeStart) {
                opacity = 1;
            } else if (scrollY >= fadeEnd) {
                opacity = 0;
            } else {
                opacity = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
            }
            mainHeaderLogoShopPage.style.opacity = opacity.toFixed(2);
        }, 10);
    }
    
    if (mainHeaderLogoShopPage) {
        window.addEventListener('scroll', handleMainHeaderLogoFadeShop, { passive: true });
        handleMainHeaderLogoFadeShop(); 
    }


    const productButtons = document.querySelectorAll('.add-to-cart-btn, .download-free-btn');

    productButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.productId;
            const priceId = event.target.dataset.priceId; 
            const downloadLink = event.target.dataset.downloadLink;

            console.log('Button clicked for product:', productId);

            if (downloadLink) {
                console.log('Initiating download from:', downloadLink);
                window.location.href = downloadLink; 
            } else if (priceId) {
                console.log('Stripe Price ID:', priceId);
            } else {
                console.log('No price ID or download link found for this product.');
            }
        });
    });
});