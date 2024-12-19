import CO2Shield from "./co2-shield.js";

if (typeof window !== "undefined") {
  (window as any).CO2Shield = CO2Shield;
}

export default CO2Shield;
