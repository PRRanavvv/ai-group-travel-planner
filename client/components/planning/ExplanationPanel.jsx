function ExplanationPanel({ result }) {
  if (!result?.explanation && !result?.updatedItinerary?.explanations) return null;

  const explanation = result.explanation;
  const summary = result.updatedItinerary?.explanations?.summary;

  return (
    <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">AI Planning Trace</h3>
        {result.traceId && (
          <span className="text-[10px] text-gray-400">{result.traceId}</span>
        )}
      </div>

      {summary && <p className="mt-3 text-sm text-gray-600">{summary}</p>}

      {explanation && (
        <div className="mt-4 grid gap-3 text-sm text-gray-600 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold text-gray-400">Changed</p>
            <p>{explanation.changeReason || "Localized update applied"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Preserved</p>
            <p>{explanation.preserved?.length || 0} activity nodes</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400">Recomputed</p>
            <p>{explanation.recomputed?.join(", ") || "None"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExplanationPanel;

