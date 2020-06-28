console.log("wooCommerce loaded");
var wooCommerceOrdersStr = host.getInputFileContents("data/wooCommerce.json");
var wooCommerceOrders = [];
if (wooCommerceOrdersStr) {
	wooCommerceOrders = JSON.parse(wooCommerceOrdersStr);
}
this.wooCommerceOrder = function (options) {
    // 50615
	var orderNumber = options.orderNumber;
    if (!orderNumber)
        return null;
    var order = wooCommerceOrders.find(o => {
            return o.order_number == orderNumber;
        });
    if (order)
        return new wooCommerceOrder(order);
    else
        return null;
    function wooCommerceOrder(order) {
        // No sender is recorded in an ebay order
        this.items = [];
        order.products.forEach(p => {
                this.items.push({
                    sku: p.sku,
                    description: p.name,
                    qty: p.qty
                });
        });
        this.getReceiver = function () {
			var country = me.regions.getCountry(order.shipping_country);
            return {
                name: order.shipping_first_name + " " + order.shipping_last_name,
                phone: order.billing_phone,
                address1: order.shipping_address,
                /* address2: order[15], */
                city: order.shipping_city,
                state: order.shipping_state,
                postalCode: order.shipping_postcode,
                country: (country ? country.name : order.shipping_country)
            };
        };
    }
};
