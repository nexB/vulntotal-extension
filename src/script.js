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

  const fullscreenButton = document.getElementById("fullscreen-button");
  fullscreenButton.addEventListener("click", async function () {
    chrome.tabs.create({ url: "popup.html" });
  });
});

const clearTable = () => {
  var tableRef = document
    .getElementById(`results-table`)
    .getElementsByTagName("tbody")[0];
  tableRef.innerHTML = "";
};

const hideResultsTable = () => {
  const tableDiv = document.getElementById("table-div");
  tableDiv.classList.add("is-hidden");
};

const showResultsTable = () => {
  const tableDiv = document.getElementById("table-div");
  tableDiv.classList.remove("is-hidden");
};

const hideLoadingDiv = () => {
  const progressDiv = document.getElementById("loading-div");
  progressDiv.classList.add("is-hidden");
};

const showSearchButtonLoading = () => {
  const sendButton = document.getElementById("submit_vuln");
  sendButton.classList.add("is-loading");
};

const hideSearchButtonLoading = () => {
  const sendButton = document.getElementById("submit_vuln");
  sendButton.classList.remove("is-loading");
};

const hideHeroDiv = () => {
  const heroDiv = document.getElementById("hero-div");
  heroDiv.classList.add("is-hidden");
};

const showHeroDiv = () => {
  const heroDiv = document.getElementById("hero-div");
  heroDiv.classList.remove("is-hidden");
};
