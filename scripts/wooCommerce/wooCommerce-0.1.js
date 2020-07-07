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
        this.orderNumber = order.order_number;
        this.items = [];
        this.order = order;
        order.products.forEach(p => {
            this.items.push({
                sku: p.sku,
                description: p.name,
                qty: p.qty
            });
        });
        this.load = function (restore) {
            // Some screens (DHL) may jump between pages, and so the order has
            // to be restored from session storage
            for (var i in restore) {
                this[i] = restore[i];
            }
        };

        this.getSender = function () {
            var country = me.regions.getCountry(this.order.billing_country);
            return {
                name: this.order.billing_first_name + " " + this.order.billing_last_name,
                companyName: this.order.billing_company,
                phone: this.order.billing_phone,
				email: this.order.billing_email,
                address1: this.order.billing_address,
                /* address2: this.order[15], */
                city: this.order.billing_city,
                stateCode: this.order.billing_state,
                postalCode: this.order.billing_postcode,
                countryName: (country ? country.name : this.order.billing_country),
                countryCode: (country ? country.code : this.order.billing_country)
            };
        };
        this.getReceiver = function () {
            var country = me.regions.getCountry(this.order.shipping_country);
            return {
                name: this.order.shipping_first_name + " " + this.order.shipping_last_name,
                companyName: this.order.shipping_first_name + " " + this.order.shipping_last_name,
                phone: this.order.billing_phone,
                email: this.order.billing_email,
                address1: this.order.shipping_address,
                /* address2: this.order[15], */
                city: this.order.shipping_city,
                stateCode: this.order.shipping_state,
                postalCode: this.order.shipping_postcode,
                countryName: (country ? country.name : this.order.shipping_country),
                countryCode: (country ? country.code : this.order.shipping_country)
            };
        };
    }
};
