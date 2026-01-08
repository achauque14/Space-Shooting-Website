paypal
  .Buttons({
    createOrder: function () {
      return fetch("cart/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity
          })),
      }),
  })
        .then(res => {
          if (res.ok) return res.json()
          return res.json().then(json => Promise.reject(json))
        })
        .then(({ id }) => {
          return id
        })
        .catch(e => {
          console.error(e.error)
        })
    },
    onApprove: function (data, actions) {
      return actions.order.capture().then(function(details) {
        alert('Transaction completed by ' + details.payer.name.given_name);
      });
    },
  })
.render("#paypal")
