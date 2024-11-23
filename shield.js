async function generateShield() {
  let url = document.getElementById('websiteUrl').value.trim();
  if (!url) return alert('Please enter a valid website URL');
  
  url = /^https?:\/\//i.test(url) ? url : 'https://' + url;
  toggleLoading(true);

  try {
    const { co2, rating, url: reportUrl } = await fetchCO2Data(url);
    const { color, details } = getRatingDetails(rating);
    updateUI(generateShieldData(rating, co2, color, details, reportUrl), reportUrl, url);
  } catch {
    alert('Error fetching data. Please try again later.');
  } finally {
    toggleLoading(false);
  }
}

async function fetchCO2Data(url) {
  const res = await fetch(`https://digitalbeacon.co/badge?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error();
  return res.json();
}

function getRatingDetails(rating) {
  const details = {
    'a+': { color: '#4CAF50', details: 'Less than 0.095g' }, // Green
    'a': { color:  '#8BC34A', details: 'Less than 0.185g' }, // Light Green
    'b': { color:  '#FFC107', details: 'Less than 0.34g' },  // Yellow
    'c': { color:  '#FF9800', details: 'Less than 0.49g' },  // Orange
    'd': { color:  '#FF5722', details: 'Less than 0.65g' },  // Deep Orange
    'e': { color:  '#F44336', details: 'Less than 0.85g' },  // Red
    'f': { color:  '#D32F2F', details: 'Above 0.85g' }       // Dark Red
  };
  
  return details[rating.toLowerCase()];
}

function generateShieldData(rating, co2, color, details, reportUrl) {
  const co2Message = rating.toLowerCase() === 'a+' ? `${parseFloat(co2).toFixed(3)}g` : `${parseFloat(co2).toFixed(2)}g`;
  const shieldUrl = `https://img.shields.io/badge/CO₂- ${rating.toUpperCase()}_${co2Message.replace(/ /g, '_')}-${color.replace('#', '')}`;
  const markdown = `[![${rating.toUpperCase()} Rated ${co2Message}](${shieldUrl})](${reportUrl})`;
  
  return { shieldUrl, markdown, details, rating, detailsList: generateDetailsList() };
}

function generateDetailsList() {
  return ['a+', 'a', 'b', 'c', 'd', 'e', 'f'].map(rating => {
    const { color, details } = getRatingDetails(rating);
    return `<div style="background-color: ${color}">${rating.toUpperCase()}: <span>${details}</span></div>`;
  }).join('');
}

function updateUI({ shieldUrl, markdown, details, detailsList, rating }, reportUrl, targetUrl) {
  const createDiv = (id, innerHTML) => {
    let div = document.getElementById(id) || document.createElement('div');
    div.id = id;
    div.innerHTML = innerHTML;
    document.body.appendChild(div);
  };

  createDiv('result', `<a href="${reportUrl}" target="_blank"><img src="${shieldUrl}" alt="CO₂ Shield" /></a>`);
  createDiv('rating', `<p>Website: ${targetUrl} Rating: ${rating.toUpperCase()}: ${details}</p>`);
  createDiv('markdown', `<pre id="markdown">${markdown}</pre><button onclick="copyClipboard()">Copy to Clipboard</button>`);
  createDiv('details', `<div class="rating">${detailsList}</div>`);
  createDiv('reset', `<button onclick="reset()">Start Over</button>`);
}

function toggleLoading(isLoading) {
  let div = document.getElementById('loading') || document.createElement('div');
  div.id = 'loading';
  div.innerHTML = 'Loading...';
  div.style.display = isLoading ? 'block' : 'none';
  document.body.appendChild(div);
}

function copyClipboard() {
  const markdown = document.getElementById('markdown').textContent;
  navigator.clipboard.writeText(markdown).then(() => alert('Copied to clipboard.'), () => alert('Failed to copy.'));
}

function reset() {
  document.getElementById('websiteUrl').disabled = false;
  document.getElementById('websiteUrl').value = '';
  
  ['result', 'rating', 'markdown', 'details', 'reset'].forEach(id => {
    let element = document.getElementById(id);
    if (element) element.remove();
  });
}

document.getElementById('websiteUrl').addEventListener('keypress', function (e) { if (e.key === 'Enter') generateShield(); });