const sampleInputs = {
  jaipur: {
    destination: "Jaipur",
    days: 3,
    budget: "balanced",
    interests: ["heritage", "food"]
  },
  jaipur_fuzzy: {
    destination: "Jaipur",
    days: 2,
    budget: "balanced",
    interests: ["heriage", "caffes", "scenic"]
  },
  goa: {
    destination: "Goa",
    days: 2,
    budget: "cheapest",
    optimizationMode: "cheapest",
    interests: ["beach", "food"]
  },
  manali: {
    destination: "Manali",
    days: 2,
    budget: "balanced",
    optimizationMode: "time_efficient",
    interests: ["adventure", "food"]
  }
};

module.exports = sampleInputs;
