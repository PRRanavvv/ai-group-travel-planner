function StabilityBadge({ stability }) {
  if (!stability) return null;

  const score = Math.round((stability.overall || 0) * 100);
  const tone =
    score >= 85
      ? "bg-green-100 text-green-700"
      : score >= 70
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      <span>Stability</span>
      <span>{score}%</span>
    </div>
  );
}

export default StabilityBadge;

