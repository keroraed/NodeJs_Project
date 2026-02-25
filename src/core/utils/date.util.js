/**
 * Add minutes to a date
 * @param {Date} date
 * @param {number} minutes
 * @returns {Date}
 */
const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60 * 1000);
};

/**
 * Check if a date has passed (expired)
 * @param {Date} date
 * @returns {boolean}
 */
const isExpired = (date) => {
  return new Date() > new Date(date);
};

/**
 * Format date to readable string
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get start and end of a given day
 * @param {Date} date
 * @returns {{ startOfDay: Date, endOfDay: Date }}
 */
const getDayBounds = (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

export { addMinutes, isExpired, formatDate, getDayBounds };
