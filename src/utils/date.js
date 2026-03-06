// utils/date.js
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Timezone Indonesia (WIB = UTC+7)
const WIB_OFFSET = 7 * 60 * 60 * 1000; // 7 jam dalam milidetik

/**
 * Konversi tanggal UTC ke WIB
 * @param {string|Date} date - Tanggal dalam UTC
 * @returns {Date} Tanggal dalam WIB
 */
export const toWIB = (date) => {
  if (!date) return new Date();
  const utcDate = new Date(date);
  return new Date(utcDate.getTime() + WIB_OFFSET);
};

/**
 * Konversi tanggal WIB ke UTC (untuk disimpan ke database)
 * @param {string|Date} date - Tanggal dalam WIB
 * @returns {Date} Tanggal dalam UTC
 */
export const toUTC = (date) => {
  if (!date) return new Date();
  const wibDate = new Date(date);
  return new Date(wibDate.getTime() - WIB_OFFSET);
};

/**
 * Format tanggal ke tampilan WIB
 * @param {string|Date} dateString - Tanggal yang akan diformat
 * @param {string} formatStr - Format tanggal (default: "dd MMM yyyy, HH:mm")
 * @returns {string} Tanggal yang sudah diformat
 */
export const formatToWIB = (dateString, formatStr = "dd MMM yyyy, HH:mm") => {
  if (!dateString) return "-";

  try {
    const wibDate = toWIB(dateString);
    return format(wibDate, formatStr, { locale: id });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

/**
 * Format tanggal tanpa jam ke tampilan WIB
 * @param {string|Date} dateString - Tanggal yang akan diformat
 * @returns {string} Tanggal yang sudah diformat (dd MMM yyyy)
 */
export const formatDateOnlyWIB = (dateString) => {
  return formatToWIB(dateString, "dd MMM yyyy");
};

/**
 * Format jam ke tampilan WIB
 * @param {string|Date} dateString - Tanggal yang akan diformat
 * @returns {string} Jam yang sudah diformat (HH:mm)
 */
export const formatTimeWIB = (dateString) => {
  return formatToWIB(dateString, "HH:mm");
};

/**
 * Dapatkan waktu sekarang di WIB
 * @returns {Date} Waktu sekarang dalam timezone WIB
 */
export const nowInWIB = () => {
  const now = new Date();
  return toWIB(now);
};

/**
 * Cek apakah tanggal hari ini di WIB
 * @param {string|Date} date - Tanggal yang akan dicek
 * @returns {boolean} True jika tanggal hari ini di WIB
 */
export const isTodayInWIB = (date) => {
  if (!date) return false;
  const wibDate = toWIB(date);
  const todayWIB = nowInWIB();
  return wibDate.toDateString() === todayWIB.toDateString();
};

/**
 * Mendapatkan jam dari tanggal dalam format WIB
 * @param {string|Date} date - Tanggal
 * @returns {number} Jam dalam WIB (0-23)
 */
export const getHourWIB = (date) => {
  if (!date) return 0;
  return toWIB(date).getHours();
};

/**
 * Mendapatkan tanggal dalam format string YYYY-MM-DD (WIB)
 * @param {string|Date} date - Tanggal
 * @returns {string} Tanggal dalam format YYYY-MM-DD
 */
export const getDateStringWIB = (date) => {
  if (!date) return "";
  const wibDate = toWIB(date);
  const year = wibDate.getFullYear();
  const month = (wibDate.getMonth() + 1).toString().padStart(2, "0");
  const day = wibDate.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};
