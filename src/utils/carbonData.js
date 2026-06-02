// CO2 savings in kg per unit of waste recycled
export const CO2_SAVINGS = {
  plastic:    0.12,
  paper:      0.09,
  glass:      0.31,
  metal:      0.42,
  organic:    0.05,
  electronic: 1.20,
  hazardous:  0.80,
}

// Equivalent descriptions to make the number feel real
export const CO2_EQUIVALENTS = [
  { threshold: 0.5,  label: 'a 10-minute car ride' },
  { threshold: 1.0,  label: 'charging your phone for 2 months' },
  { threshold: 2.5,  label: 'a short domestic flight' },
  { threshold: 5.0,  label: 'a full day of electricity use' },
  { threshold: 10.0, label: 'planting a small tree' },
  { threshold: 999,  label: 'a significant environmental impact' },
]

export const getCO2Equivalent = (kg) => {
  for (const eq of CO2_EQUIVALENTS) {
    if (kg <= eq.threshold) return eq.label
  }
  return CO2_EQUIVALENTS[CO2_EQUIVALENTS.length - 1].label
}

export const calculateTotalCO2 = (reports = []) => {
  return reports.reduce((total, report) => {
    const savings = CO2_SAVINGS[report.wasteType?.toLowerCase()] ?? 0
    return total + savings
  }, 0)
}
