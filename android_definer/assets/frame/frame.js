
(async () => {
  const params = new URLSearchParams(window.location.search);
  const targetUrl = params.get("src");
  const contentDiv = document.getElementById("content");
  const errorDiv = document.getElementById("error");

  if (!targetUrl) {
    errorDiv.textContent = "Ошибка: URL не задан";
    return;
  }

  const corsProxy = "https://cors-anywhere.herokuapp.com/";

  try {
    const response = await fetch(corsProxy + targetUrl);
    if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);

    const text = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    const bodyText = doc.body.innerText || "Нет содержимого";

    contentDiv.textContent = bodyText;

  } catch (e) {
    errorDiv.textContent = "Ошибка: " + e.message;
  }
})();
