
function addToCart(productId) {
    console.log('hi.......................');
    $.ajax(
        {
            url: '/add-to-cart/' + productId,
            method: 'get',
            success: (response) => {
                console.log('halo');
                if (response.status) {
                    let count = $("#cart-count").html()
                    count = parseInt(count) + 1
                    $("#cart-count").html(count)
                    //  alert(response)
                }else{
                    alert("already added")
                }

            }
        }
    )
}



function incQuantity(cartId, item, userid, name,price,count) {
    let quantity = parseInt(document.getElementById(item).innerHTML)
    count = parseInt(count);
    // quantity =parseInt(quantity)
    // alert(userid)
    console.log('ajax conected')
    $.ajax({
        url: '/changeproductquantity',
        data: {
            cart: cartId,
            product: item,
            count: count,
            user:userid,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                alert('Product Removed')
                location.reload()

            } else {
               
                   response.subtotal= response.total+45 
                //    let amount = parseInt(document.getElementById(name).innerHTML)

                
                document.getElementById(item).innerHTML = quantity + count
                document.getElementById('total').innerHTML=response.total
                document.getElementById('subtotal').innerHTML=response.subtotal
                document.getElementById(name).innerHTML=price*(quantity+count)
    


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
     if(response.removeProduct)
            alert('Product Removed')
            location.reload()
        
        
           
        }
    }) 
}




	// $('#checkout').submit((e) => {
	// 	e.preventDefault()
	// 	$.ajax({
	// 		url: '/check-out',

	// 		method: 'post',
	// 		data: $('#checkout').serialize(),
			
	// 		success: (response) => {
				
	// 			if (response.status){
	// 				alert("haloo")
	// 				location.href="/payment-success"
	// 			}
	// 		}
 
	// 	})
	// })