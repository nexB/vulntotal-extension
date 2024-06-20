document.addEventListener("DOMContentLoaded", function () {
  const navBarBurger = document.getElementById("nav-burger");
  navBarBurger.addEventListener("click", () => {
    document.getElementById("navMenu").classList.toggle("is-active");
  });

  const settingsButton = document.getElementById("settings-button");
  settingsButton.addEventListener("click", async function () {
    let queryOptions = { active: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
      if (tab.title === "VulnTotal Home") {
        chrome.tabs.update({ url: "settings.html" });
      } else {
        chrome.tabs.create({ url: "settings.html" });
      }
    });
  });
});
