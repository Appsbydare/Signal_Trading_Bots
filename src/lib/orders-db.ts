
// In-memory storage for development
// Using globalThis to ensure singleton instance across module reloads in development

/* eslint-disable no-var */
declare global {
    var _orders: Map<string, any> | undefined;
    var _stripeOrders: Map<string, any> | undefined;
}
/* eslint-enable no-var */

// Initialize storage or use existing global storage
export const ordersWrapper = {
    get orders() {
        if (!globalThis._orders) {
            globalThis._orders = new Map();
        }
        return globalThis._orders;
    },
    get stripeOrders() {
        if (!globalThis._stripeOrders) {
            globalThis._stripeOrders = new Map();
        }
        return globalThis._stripeOrders;
    }
};

// Helper aliases for cleaner imports
export const orders = ordersWrapper.orders;
export const stripeOrders = ordersWrapper.stripeOrders;
