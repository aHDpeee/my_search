chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getDefinition") {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${request.word}`)
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // нужно для асинхронного ответа
  }
});
