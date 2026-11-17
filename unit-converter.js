"use strict";

const unitSets = {
  length: [
    { value: "meter", label: "Meters", toBase: value => value, fromBase: value => value },
    { value: "kilometer", label: "Kilometers", toBase: value => value * 1000, fromBase: value => value / 1000 },
    { value: "centimeter", label: "Centimeters", toBase: value => value / 100, fromBase: value => value * 100 },
    { value: "foot", label: "Feet", toBase: value => value * 0.3048, fromBase: value => value / 0.3048 },
    { value: "mile", label: "Miles", toBase: value => value * 1609.344, fromBase: value => value / 1609.344 }
  ],
  mass: [
    { value: "gram", label: "Grams", toBase: value => value, fromBase: value => value },
    { value: "kilogram", label: "Kilograms", toBase: value => value * 1000, fromBase: value => value / 1000 },
    { value: "pound", label: "Pounds", toBase: value => value * 453.59237, fromBase: value => value / 453.59237 },
    { value: "ounce", label: "Ounces", toBase: value => value * 28.349523125, fromBase: value => value / 28.349523125 }
  ],
  temperature: [
    { value: "celsius", label: "Celsius (°C)", toBase: value => value, fromBase: value => value },
    { value: "fahrenheit", label: "Fahrenheit (°F)", toBase: value => (value - 32) * 5 / 9, fromBase: value => value * 9 / 5 + 32 },
    { value: "kelvin", label: "Kelvin (K)", toBase: value => value - 273.15, fromBase: value => value + 273.15 }
  ]
};

const categorySelect = document.querySelector("#category");
const amountInput = document.querySelector("#amount");
const fromSelect = document.querySelector("#from-unit");
const toSelect = document.querySelector("#to-unit");
const resultOutput = document.querySelector("#result");
const conversionNote = document.querySelector("#conversion-note");

function getUnit(category, value) {
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

  const fromUnit = getUnit(categorySelect.value, fromSelect.value);
  const toUnit = getUnit(categorySelect.value, toSelect.value);
  const result = toUnit.fromBase(fromUnit.toBase(amount));

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
