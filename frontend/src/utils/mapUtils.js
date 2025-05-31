// src/utils/mapUtils.js
export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const deg2rad = (deg) => deg * (Math.PI / 180);

/**
 * Counts SOS reports within a given radius of a central SOS report.
 * @param {object} currentSOS - The SOS report to count around.
 * @param {array} allSOSReports - Array of all SOS reports.
 * @param {number} searchRadiusKm - The radius in kilometers to search within.
 * @returns {number} - The count of SOS reports (including the current one) within the radius.
 */
export const countNearbySOS = (currentSOS, allSOSReports, searchRadiusKm) => {
  if (!currentSOS || !allSOSReports) return 0;
  let count = 0;
  for (const sos of allSOSReports) {
    if (!sos.latitude || !sos.longitude) continue; // Skip if no coords
    const distance = getDistanceFromLatLonInKm(
      currentSOS.latitude, currentSOS.longitude,
      sos.latitude, sos.longitude
    );
    if (distance <= searchRadiusKm) {
      count++;
    }
  }
  return count;
};

/**
 * Determines the fill and stroke color for an SOS circle based on density.
 * @param {number} density - The number of SOS alerts in the vicinity.
 * @returns {object} - { fill: 'hexcolor', stroke: 'hexcolor' }
 */
export const getSOSColorByDensity = (density) => {
  if (density >= 5) return { fill: '#b91c1c', stroke: '#7f1d1d', opacity: 0.7 }; // Darkest red (red-800, red-900)
  if (density >= 3) return { fill: '#dc2626', stroke: '#991b1b', opacity: 0.65 }; // Medium-dark red (red-700, red-800)
  if (density >= 2) return { fill: '#ef4444', stroke: '#b91c1c', opacity: 0.6 }; // Red (red-500, red-700)
  return { fill: '#fca5a5', stroke: '#ef4444', opacity: 0.55 }; // Light red (red-300, red-500)
};