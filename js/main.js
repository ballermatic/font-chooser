let currentBodyFont = null;
let currentDisplayFont = null;
let fonts = [];

// Fetch and parse the config.json file
fetch('config.json')
  .then((response) => response.json())
  .then((fontsData) => {
    fonts = fontsData.sort((a, b) => a.name.localeCompare(b.name));

    const bodySelect = document.getElementById('bodyFont');
    const displaySelect = document.getElementById('displayFont');
    const bodyWeightInput = document.getElementById('bodyWeight');
    const displayWeightInput = document.getElementById('displayWeight');

    // Populate dropdowns
    fonts.forEach((font, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = font.name;
      bodySelect.appendChild(option.cloneNode(true));
      displaySelect.appendChild(option);
    });

    // Event listeners for font selection
    bodySelect.addEventListener('change', updateBodyFont);
    displaySelect.addEventListener('change', updateDisplayFont);

    // Event listeners for weight inputs
    bodyWeightInput.addEventListener('input', updateBodyWeight);
    displayWeightInput.addEventListener('input', updateDisplayWeight);

    // Apply settings from URL parameters
    applySettingsFromURL();
  });

function updateBodyFont() {
  const fontIndex = parseInt(this.value);
  currentBodyFont = fonts[fontIndex];
  updateFont(currentBodyFont, 'body');
  document.getElementById('bodyWeight').placeholder =
    currentBodyFont['body-weight'];
  updateURL();
}

function updateDisplayFont() {
  const fontIndex = parseInt(this.value);
  currentDisplayFont = fonts[fontIndex];
  updateFont(currentDisplayFont, 'display');
  document.getElementById('displayWeight').placeholder =
    currentDisplayFont['display-weight'];
  updateURL();
}

function updateBodyWeight() {
  if (currentBodyFont) {
    currentBodyFont['body-weight'] = this.value;
    updateFont(currentBodyFont, 'body');
    updateURL();
  }
}

function updateDisplayWeight() {
  if (currentDisplayFont) {
    currentDisplayFont['display-weight'] = this.value;
    updateFont(currentDisplayFont, 'display');
    updateURL();
  }
}

function updateFont(font, type) {
  if (font.type === 'local') {
    // For local variable fonts
    const style = document.createElement('style');
    style.textContent = `
            @font-face {
                font-family: '${font.family}';
                src: url('${font.path}') format('woff2 supports variations'),
                     url('${font.path}') format('woff2-variations');
                font-weight: 100 900;
                font-stretch: 75% 125%;
                font-style: normal;
            }
        `;
    document.head.appendChild(style);

    // We don't need to wait for the font to load, as it's already available locally
    applyFont(font, type);
  } else if (font.type === 'google') {
    const link = document.createElement('link');
    link.href = font.path;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    link.onload = () => applyFont(font, type);
  } else if (font.type === 'adobe') {
    // Adobe fonts are already loaded via the Typekit stylesheet
    applyFont(font, type);
  }
}

function applyFont(font, type) {
  const weightProperty = type === 'body' ? 'body-weight' : 'display-weight';
  const fontWeight = font[weightProperty];

  const applyStyles = (element) => {
    element.style.fontFamily = `'${font.family}', sans-serif`;
    element.style.fontWeight = fontWeight;
    if (font.type === 'local') {
      element.style.fontVariationSettings = `'wght' ${fontWeight}`;
    }
  };

  if (type === 'body') {
    applyStyles(document.body);
  } else {
    document.querySelectorAll('h1, h2, h3, h4, h5').forEach(applyStyles);
  }
}

function updateURL() {
  const params = new URLSearchParams();
  if (currentBodyFont) {
    params.set('bodyFont', fonts.indexOf(currentBodyFont));
    params.set('bodyWeight', currentBodyFont['body-weight']);
  }
  if (currentDisplayFont) {
    params.set('displayFont', fonts.indexOf(currentDisplayFont));
    params.set('displayWeight', currentDisplayFont['display-weight']);
  }
  const newURL = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newURL);
}

function applySettingsFromURL() {
  const params = new URLSearchParams(window.location.search);

  const bodyFontIndex = params.get('bodyFont');
  if (bodyFontIndex !== null) {
    document.getElementById('bodyFont').value = bodyFontIndex;
    currentBodyFont = fonts[parseInt(bodyFontIndex)];
    const bodyWeight = params.get('bodyWeight');
    if (bodyWeight !== null) {
      currentBodyFont['body-weight'] = bodyWeight;
      document.getElementById('bodyWeight').value = bodyWeight;
    }
    updateFont(currentBodyFont, 'body');
  }

  const displayFontIndex = params.get('displayFont');
  if (displayFontIndex !== null) {
    document.getElementById('displayFont').value = displayFontIndex;
    currentDisplayFont = fonts[parseInt(displayFontIndex)];
    const displayWeight = params.get('displayWeight');
    if (displayWeight !== null) {
      currentDisplayFont['display-weight'] = displayWeight;
      document.getElementById('displayWeight').value = displayWeight;
    }
    updateFont(currentDisplayFont, 'display');
  }
}

// Dark mode toggle
const toggleButton = document.getElementById('toggleMode');
toggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Function to generate a shareable URL
function getShareableURL() {
  return window.location.href;
}

// You can add a button to copy the shareable URL to the clipboard
function copyShareableURL() {
  const url = getShareableURL();
  navigator.clipboard
    .writeText(url)
    .then(() => {
      alert('Shareable URL copied to clipboard!');
    })
    .catch((err) => {
      console.error('Failed to copy URL: ', err);
    });
}
