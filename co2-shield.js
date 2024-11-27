async function generateShield() {
  let url = document.getElementById('websiteUrl').value.trim();
  if (!url) return alert('Please enter a valid website URL');

  url = /^https?:\/\//i.test(url) ? url : 'https://' + url;
  toggleLoading(true);

  let generateButton = document.querySelector('button');
  generateButton.innerHTML = 'Loading...';
  generateButton.disabled = true;

  try {
    const { co2, rating } = await fetchCO2Datba(url);
    const { color, details } = getRatingDetails(rating);

    const reportUrl = `https://overbrowsing.com/co2-shield`;

    updateUI(generateShieldData(rating, co2, color, details, reportUrl), reportUrl, url);
  } catch {
    alert('Error fetching data. Please try again later.');
  } finally {
    toggleLoading(false);
    generateButton.innerHTML = 'Generate Shield';
    generateButton.disabled = false;
    document.getElementById('websiteUrl').style.display = 'none';
    generateButton.style.display = 'none';
  }
}

async function fetchCO2Datba(url) {
  const res = await fetch(`https://digitalbeacon.co/badge?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error();
  return res.json();
}

function getRatingDetails(rating) {
  const details = {
    'a+': { color: '#4CAF50', details: 'Less than 0.095g' },
    'a': { color: '#8BC34A', details: 'Less than 0.185g' },
    'b': { color: '#FFC107', details: 'Less than 0.34g' },
    'c': { color: '#FF9800', details: 'Less than 0.49g' },
    'd': { color: '#FF5722', details: 'Less than 0.65g' },
    'e': { color: '#F44336', details: 'Less than 0.85g' },
    'f': { color: '#D32F2F', details: 'Above 0.85g' }
  };

  return details[rating.toLowerCase()];
}

function generateShieldData(rating, co2, color, details, reportUrl) {
  const co2Message = rating.toLowerCase() === 'a+' ? `${parseFloat(co2).toFixed(3)}g` : `${parseFloat(co2).toFixed(2)}g`;
  const shieldUrl = `https://img.shields.io/badge/CO₂-${rating.toUpperCase()}_${co2Message.replace(/ /g, '_')}-${color.replace('#', '')}`;
  const markdown = `[CO₂ Shield](${shieldUrl})](${reportUrl})`;

  return { shieldUrl, markdown, details, rating, detailsList: generateDetailsList() };
}

function generateDetailsList() {
  return ['a+', 'a', 'b', 'c', 'd', 'e', 'f'].map(rating => {
    const { color, details } = getRatingDetails(rating);
    return `<div class="rating-detail"><span style="color: ${color};">●</span> ${rating.toUpperCase()} • ${details}</span></div>`;
  }).join('');
}

function updateUI({ shieldUrl, markdown, details, detailsList, rating }, reportUrl, targetUrl) {
  const createDiv = (id, innerHTML) => {
    let div = document.getElementById(id) || document.createElement('div');
    div.id = id;
    div.innerHTML = innerHTML;
    document.body.appendChild(div);
  };

  const buttonContainer = document.querySelector('button');
  const resultContainer = document.createElement('div');

  resultContainer.innerHTML = `
    <div id="result">
      <h2>Results</h2>
      <p>${targetUrl} • ${rating.toUpperCase()} ${details}</p>
      <img src="${shieldUrl}">
      <pre id="markdown">${markdown}</pre>
      <button onclick="copy()">Copy</button>
      <h2>Ratings</h2>
      <div class="rating-details">${detailsList}</div>
      <button onclick="reset()">Reset</button>
    </div>
  `;

  buttonContainer.insertAdjacentElement('afterend', resultContainer);
}

function toggleLoading(isLoading) {
  let div = document.getElementById('loading') || document.createElement('div');
  div.id = 'loading';
  div.innerHTML = 'Loading...';
  div.style.display = isLoading ? 'block' : 'none';
  document.body.appendChild(div);
}

function copy() {
  const markdown = document.getElementById('markdown').textContent;
  const copyButton = document.querySelector('button[onclick="copy()"]');

  navigator.clipboard.writeText(markdown).then(() => {
    copyButton.textContent = 'Copied';
    setTimeout(() => {
      copyButton.textContent = 'Copy';
    }, 2000);
  });
}

function reset() {
  document.getElementById('websiteUrl').style.display = 'block';
  let generateButton = document.querySelector('button');
  generateButton.style.display = 'inline-block';

  document.getElementById('websiteUrl').value = '';

  generateButton.innerHTML = 'Generate Shield';
  generateButton.disabled = false;

  const resultContainer = document.querySelector('#result');
  if (resultContainer) {
    resultContainer.remove();
  }

  const loadingDiv = document.querySelector('#loading');
  if (loadingDiv) {
    loadingDiv.remove();
  }

  const extraDivs = document.querySelectorAll('div');
  extraDivs.forEach(div => {
    if (!div.id && div.innerHTML.trim() === '') {
      div.remove();
    }
  });
}

document.getElementById('websiteUrl').addEventListener('keypress', function (e) { if (e.key === 'Enter') generateShield(); });