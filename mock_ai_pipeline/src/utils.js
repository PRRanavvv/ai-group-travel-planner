const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${String(hours12).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${suffix}`;
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const budgetRank = {
  free: 0,
  low: 1,
  mid: 2,
  high: 3,
  luxury: 4
};

const budgetTarget = {
  cheapest: 1,
  balanced: 2,
  luxury: 4
};

const haversineKm = (a, b) => {
  if (!a || !b) return 0;
  const toRad = (degrees) => degrees * Math.PI / 180;
  const radiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * radiusKm * Math.asin(Math.sqrt(h));
};

const estimateTravelMinutes = (from, to) => {
  if (!from || !to) return 0;
  const km = haversineKm(from.coordinates, to.coordinates);
  if (km < 0.5) return 8;
  return Math.ceil(12 + km * 4.5);
};

module.exports = {
  budgetRank,
  budgetTarget,
  clamp,
  estimateTravelMinutes,
  haversineKm,
  minutesToTime,
  timeToMinutes
};

