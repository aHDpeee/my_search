fetch('https://cse.google.com/cse.js?cx=...')
  .then(res => res.text())
  .then(code => {
    const script = document.createElement('script');
    script.textContent = code;
    document.head.appendChild(script);
  });
