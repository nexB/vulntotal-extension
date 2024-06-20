document.addEventListener("DOMContentLoaded", function () {
  // Simulate Environment Preparation
  const progressBar = document.getElementById("extension-loading");
  progressBar.value = 0;
  const interval = setInterval(() => {
    progressBar.value += 20;
    if (progressBar.value >= 100) {
      hideLoadingDiv();
      showHeroDiv();
      clearInterval(interval);
    }
  }, 1000);

  const sendButton = document.getElementById("submit_vuln");
  sendButton.addEventListener("click", async function () {
    showSearchButtonLoading();
    clearTable();
    const interval = setInterval(async () => {
      const response = await fetch("vulntotal_output.json");
      const vulntotal_results = await response.json();
      // Show the table if it was hidden
      showResultsTable();
      // Hide hero div if it was visible
      hideHeroDiv();
      // Hide Search Button loading animation
      hideSearchButtonLoading();
      // Populate the table with the results
      newDataSourceResult("deps", vulntotal_results.deps);
      newDataSourceResult("safetydb", vulntotal_results.safetydb);
      newDataSourceResult("oss_index", vulntotal_results.oss_index);
      newDataSourceResult("osv", vulntotal_results.osv);
      newDataSourceResult("snyk", vulntotal_results.snyk);

      clearInterval(interval);
    }, 2000);
  });

  function newDataSourceResult(source, results) {
    results.forEach((row) => {
      let rowHtml = `
      <tr>
        <td>${row.aliases[0]}</td>
        <td>${source}</td>
        <td>${row.aliases}</td>
        <td>${row.affected_versions}</td>
        <td>${row.fixed_versions}</td>
      </tr>
      `;
      var tableRef = document
        .getElementById(`results-table`)
        .getElementsByTagName("tbody")[0];

      var newRow = tableRef.insertRow(tableRef.rows.length);
      newRow.innerHTML = rowHtml;
    });
  }

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

  const refreshButton = document.getElementById("refresh-button");
  refreshButton.addEventListener("click", async function () {
    clearTable();
    hideResultsTable();
    showHeroDiv();
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
