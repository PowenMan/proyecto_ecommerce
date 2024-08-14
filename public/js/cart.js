document.querySelectorAll('.offers__cta').forEach(button => {
    button.addEventListener('click', function(event) {
        event.preventDefault();
        const productoId = this.getAttribute('data-producto-id');

        fetch( 'add-to-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productoId })
        })
        .then(response => response.json())
        .then(data => { 
            document.getElementById('cart-count').innerText = data.cartCount;
        });
    });
});