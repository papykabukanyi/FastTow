// src/utils/helpers.js
import moment from 'moment';

/**
 * Safely parses JSON strings, returning an array or object.
 * @param {string|object} data - JSON string or already-parsed object.
 * @returns {Array|Object} - Parsed data or fallback.
 */
export const parseJSON = (data) => {
  try {
    if (!data) return [];
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return [];
  }
};

/**
 * Formats an array into a human-readable string.
 * @param {Array} array - Array of data to format.
 * @param {string} [labelKey] - Key for labels (optional).
 * @param {string} [valueKey] - Key for values (optional).
 * @returns {string} - Human-readable string or "N/A".
 */
export const formatArray = (array, labelKey, valueKey) => {
  const parsedArray = parseJSON(array); // Ensure the array is parsed if it's JSON
  if (!Array.isArray(parsedArray)) return 'N/A';
  return parsedArray
    .map((item) =>
      valueKey
        ? `${item[labelKey]}: ${item[valueKey]}`
        : `${item[labelKey] || item}`
    )
    .join(', ');
};

/**
 * Formats an object into a human-readable string.
 * @param {Object} obj - Object to format.
 * @returns {string} - Human-readable string or "N/A".
 */
export const formatObject = (obj) => {
  if (!obj || typeof obj !== 'object') return 'N/A';
  return Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
};

/**
 * Formats a date into a readable string.
 * @param {string|Date} date - Date string or object.
 * @returns {string} - Formatted date or "N/A".
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return moment(date).isValid() ? moment(date).format('LLL') : 'N/A';
};
