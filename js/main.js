// Fetch and parse the config.json file
fetch('config.json')
  .then((response) => response.json())
  .then((fonts) => {
    // Sort fonts alphabetically by name
    fonts.sort((a, b) => a.name.localeCompare(b.name));

    const bodySelect = document.getElementById('bodyFont');
    const displaySelect = document.getElementById('displayFont');

    // Populate dropdowns
    fonts.forEach((font) => {
      const option = document.createElement('option');
      option.value = JSON.stringify(font);
      option.textContent = font.name;
      bodySelect.appendChild(option.cloneNode(true));
      displaySelect.appendChild(option);
    });

    // Event listeners for font selection
    bodySelect.addEventListener('change', updateBodyFont);
    displaySelect.addEventListener('change', updateDisplayFont);
  });

function updateBodyFont() {
  const font = JSON.parse(this.value);
  updateFont(font, 'body');
}

function updateDisplayFont() {
  const font = JSON.parse(this.value);
  updateFont(font, 'display');
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
    // Apply body font to all elements except headings
    document
      .querySelectorAll('body *:not(h1):not(h2):not(h3):not(h4):not(h5)')
      .forEach(applyStyles);
  } else {
    document.querySelectorAll('h1, h2, h3, h4, h5').forEach(applyStyles);
  }
}

// Dark mode toggle
const toggleButton = document.getElementById('toggleMode');
toggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});
