import CO2Shield from './co2-shield.js';
window.onload = () => {
  const co2ShieldInstance = new CO2Shield("app-container");
  co2ShieldInstance.initialize();
};