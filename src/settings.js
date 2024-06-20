document.addEventListener("DOMContentLoaded", function () {
  const backButton = document.getElementById("back-button");
  backButton.addEventListener("click", async function () {
    chrome.tabs.update({ url: "popup.html" });
  });
});
