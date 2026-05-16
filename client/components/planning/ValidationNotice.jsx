function ValidationNotice({ validation }) {
  if (!validation) return null;

  const hasIssues = validation.errors?.length || validation.warnings?.length;
  if (!hasIssues) return null;

  return (
    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
      {validation.errors?.map((error) => (
        <p key={error}>{error}</p>
      ))}
      {validation.warnings?.map((warning) => (
        <p key={warning}>{warning}</p>
      ))}
    </div>
  );
}

export default ValidationNotice;

