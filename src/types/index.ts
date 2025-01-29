/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} orderNumber
 * @property {string} customer
 * @property {string} date
 * @property {number} amount
 */

/**
 * @typedef {Object} Trip
 * @property {number} tripNumber
 * @property {string} sentDate
 * @property {number} totalAmount
 * @property {Order[]} orders
 * @property {'Active' | 'Cancelled'} status
 */

/**
 * @typedef {Object} SortConfig
 * @property {string | null} key
 * @property {'ascending' | 'descending'} direction
 */
