const { defaultInput, runPipeline, sampleInputs } = require("./src/runPipeline");

const parseInput = () => {
  const raw = process.argv[2];
  if (!raw) return defaultInput;

  if (sampleInputs[raw]) {
    return sampleInputs[raw];
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Invalid JSON input or unknown sample "${raw}". Falling back to default demo input.`);
    console.error(error.message);
    return defaultInput;
  }
};

const result = runPipeline(parseInput());

console.log(JSON.stringify(result, null, 2));
