"use strict";

const unitSets = {
  length: [
    { value: "millimeter", label: "Millimeters (mm)", toBase: value => value / 1000, fromBase: value => value * 1000 },
    { value: "centimeter", label: "Centimeters (cm)", toBase: value => value / 100, fromBase: value => value * 100 },
    { value: "meter", label: "Meters (m)", toBase: value => value, fromBase: value => value },
    { value: "kilometer", label: "Kilometers (km)", toBase: value => value * 1000, fromBase: value => value / 1000 },
    { value: "inch", label: "Inches (in)", toBase: value => value * 0.0254, fromBase: value => value / 0.0254 },
    { value: "foot", label: "Feet (ft)", toBase: value => value * 0.3048, fromBase: value => value / 0.3048 },
    { value: "mile", label: "Miles (mi)", toBase: value => value * 1609.344, fromBase: value => value / 1609.344 }
  ],
  mass: [
    { value: "milligram", label: "Milligrams (mg)", toBase: value => value / 1000, fromBase: value => value * 1000 },
    { value: "gram", label: "Grams (g)", toBase: value => value, fromBase: value => value },
    { value: "kilogram", label: "Kilograms (kg)", toBase: value => value * 1000, fromBase: value => value / 1000 },
    { value: "ounce", label: "Ounces (oz)", toBase: value => value * 28.349523125, fromBase: value => value / 28.349523125 },
    { value: "pound", label: "Pounds (lb)", toBase: value => value * 453.59237, fromBase: value => value / 453.59237 }
  ],
  temperature: [
    { value: "celsius", label: "Celsius (°C)", toBase: value => value, fromBase: value => value },
    { value: "fahrenheit", label: "Fahrenheit (°F)", toBase: value => (value - 32) * 5 / 9, fromBase: value => value * 9 / 5 + 32 },
    { value: "kelvin", label: "Kelvin (K)", toBase: value => value - 273.15, fromBase: value => value + 273.15 }
  ],
  currency: [
    { value: "usd", label: "US Dollar (USD)", rate: 1 },
    { value: "eur", label: "Euro (EUR)", rate: 0.92 },
    { value: "gbp", label: "British Pound (GBP)", rate: 0.73 }
  ]
};

const categorySelect = document.querySelector("#category");
const amountInput = document.querySelector("#amount");
const fromSelect = document.querySelector("#from-unit");
const toSelect = document.querySelector("#to-unit");
const resultOutput = document.querySelector("#result");
const conversionNote = document.querySelector("#conversion-note");

let exchangeRates = {
  usd: 1,
  eur: 0.92,
  gbp: 0.73,
  jpy: 149.5,
  cad: 1.36,
  aud: 1.53,
  chf: 0.88,
  cny: 7.24,
  inr: 83.12,
  mxn: 17.05
};

let ratesLoaded = false;

async function fetchExchangeRates() {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      const data = await response.json();
      exchangeRates = data.rates || exchangeRates;
      ratesLoaded = true;
      return true;
    }
  } catch (error) {
    console.warn('Could not fetch exchange rates:', error);
  }
  return false;
}

function getUnit(category, value) {
  if (category === 'currency') {
    return unitSets[category].find(unit => unit.value === value);
  }
  return unitSets[category].find(unit => unit.value === value);
}

function formatNumber(value) {
  return new Intl.NumberFormat(undefined, { maximumSignificantDigits: 8 }).format(value);
}

function updateConversion() {
  if (amountInput.value.trim() === "") {
    resultOutput.textContent = "—";
    conversionNote.textContent = "Choose your units and enter an amount to get started.";
    return;
  }

  const amount = amountInput.valueAsNumber;
  if (!Number.isFinite(amount)) {
    resultOutput.textContent = "—";
    conversionNote.textContent = "Enter a valid number to convert.";
    return;
  }

  const category = categorySelect.value;
  const fromUnit = getUnit(category, fromSelect.value);
  const toUnit = getUnit(category, toSelect.value);

  let result;
  if (category === 'currency') {
    const fromRate = exchangeRates[fromUnit.value] || 1;
    const toRate = exchangeRates[toUnit.value] || 1;
    result = (amount / fromRate) * toRate;
  } else {
    result = toUnit.fromBase(fromUnit.toBase(amount));
  }

  if (!Number.isFinite(result)) {
    resultOutput.textContent = "—";
    conversionNote.textContent = "This value is too large to convert.";
    return;
  }

  resultOutput.textContent = formatNumber(result);
  conversionNote.textContent = `${formatNumber(amount)} ${fromUnit.label} = ${formatNumber(result)} ${toUnit.label}`;
}

function updateUnits() {
  const units = unitSets[categorySelect.value];
  const options = units.map(unit => {
    const option = document.createElement("option");
    option.value = unit.value;
    option.textContent = unit.label;
    return option;
  });

  fromSelect.replaceChildren(...options.map(option => option.cloneNode(true)));
  toSelect.replaceChildren(...options.map(option => option.cloneNode(true)));
  fromSelect.selectedIndex = 0;
  toSelect.selectedIndex = Math.min(1, units.length - 1);
  updateConversion();
}

categorySelect.addEventListener("change", updateUnits);
amountInput.addEventListener("input", updateConversion);
fromSelect.addEventListener("change", updateConversion);
toSelect.addEventListener("change", updateConversion);

document.querySelector("#swap").addEventListener("click", () => {
  const previousFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = previousFrom;
  updateConversion();
});

document.querySelector("#clear").addEventListener("click", () => {
  amountInput.value = "";
  updateConversion();
  amountInput.focus();
});

updateUnits();

fetchExchangeRates().then(() => {
  if (ratesLoaded) {
    updateConversion();
  }
});
