
function addToCart(productId) {
  
    $.ajax(
        {
            url: '/add-to-cart/' + productId,
            method: 'get',
            success: (response) => {
                if (response.status) {
                    let count = $("#cart-count").html()
                  
                 let   counts = parseInt(count) + 1
                    $("#cart-count").html(counts)
                } else {
                    alert("already added")
                }

            }
        }
    )
}



function incQuantity(cartId, item, userid, name, price, count) {
    let quantity = parseInt(document.getElementById(item).innerHTML)
    count = parseInt(count);
   
    $.ajax({
        url: '/changeproductquantity',
        data: {
            cart: cartId,
            product: item,
            count: count,
            user: userid,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                location.reload()

            } else {
                
              if (  response.catof){
                    couponoffer = (response.total * response.catof.couponoffer) / 100
                subtotals = response.total 
                // + 45
                 - couponoffer
                response.subtotal = Math.round(subtotals)
            
                document.getElementById('coupondiscount').innerHTML = couponoffer
                document.getElementById(item).innerHTML = quantity + count
                document.getElementById('total').innerHTML = response.total
                document.getElementById('subtotal').innerHTML = response.subtotal
                document.getElementById(name).innerHTML = price * (quantity + count)
            
                } else{
             
                response.subtotal = response.total 
                    
                document.getElementById(item).innerHTML = quantity + count
                document.getElementById('total').innerHTML = response.total
                document.getElementById('subtotal').innerHTML = response.subtotal
                document.getElementById(name).innerHTML = price * (quantity + count)
            }
                    }
        }

    })
}

function removeproduct(cartId, item) {
    // let remove = parseInt(document.getElementById(item).innerHTML)

    $.ajax({
        url: '/remove-product',
        method: 'post',

        data: {
            cart: cartId,
            product: item,
        },
        success: (response) => {
            if (response.removeProduct)
            location.reload()



        }
    })
}



