// chrome.exe --allow-file-access-from-files

import { PROGRESS_MSG, RESULTS_MSG, ERROR_MSG } from "./types.js";

var vulntotal_worker = new Worker("worker.js");

chrome.runtime.sendMessage({ type: "GET_API_KEYS" }, (response) => {
  vulntotal_worker.postMessage({
    type: "INIT",
    constants: {
      PROGRESS_MSG,
      RESULTS_MSG,
      ERROR_MSG,
      githubAPIKey: response.GitHubAPIKey,
      vulnerableCodeAPIKey: response.VulnerableCodeAPIKey,
    },
  });
});

function newDataSourceResult(source, results) {
  if (!results) {
    return;
  }

  results.forEach((row) => {
    let rowHtml = `
    <tr>
      <td>${row.aliases[0]}</td>
      <td>${getDatasourceLogo(source)}</td>
      <td>${formatCommaSeparated(row.aliases)}</td>
      <td>${formatCommaSeparated(row.affected_versions)}</td>
      <td>${formatCommaSeparated(row.fixed_versions)}</td>
    </tr>
    `;
    var tableRef = document
      .getElementById(`results-table`)
      .getElementsByTagName("tbody")[0];

    var newRow = tableRef.insertRow(tableRef.rows.length);
    newRow.innerHTML = rowHtml;
    newRow.setAttribute("datasource", source);
  });
}

function updateFilterOptions(result) {
  const dropdownContent = document.getElementById("dropdown-content");
  chrome.runtime.sendMessage({ type: "GET_ENABLED_DATASOURCES" }, (sources) => {
    sources.forEach((source) => {
      if (result[source] && result[source].length > 0) {
        const option = document.createElement("a");
        option.href = "#";
        option.className = "dropdown-item";
        option.dataset.source = source;
        option.textContent = source;
        dropdownContent.appendChild(option);
      }
    });
  });
}

function filterResults(filterValue) {
  const rows = document.querySelectorAll("#results-table tbody tr");
  rows.forEach((row) => {
    console.log(row.getAttribute("datasource"), " , ", filterValue);
    if (
      filterValue === "all" ||
      row.getAttribute("datasource") === filterValue
    ) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

const purlRegex =
  /^pkg:([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)@([0-9]+\.[0-9]+\.[0-9]+)$/;

document.addEventListener("DOMContentLoaded", function () {
  const inputField = document.getElementById("id_search");
  inputField.addEventListener("input", function () {
    const userInput = inputField.value;
    if (userInput === "" || !purlRegex.test(userInput)) {
      addInputWarning();
    } else {
      removeInputWarning();
    }
  });
  const sendButton = document.getElementById("submit_vuln");
  sendButton.addEventListener("click", async function () {
    showSearchButtonLoading();
    const userInput = inputField.value;
    if (userInput === "" || !purlRegex.test(userInput)) {
      hideSearchButtonLoading();
      return;
    }
    clearTable();
    chrome.runtime.sendMessage(
      { type: "GET_ENABLED_DATASOURCES" },
      (enabledDatasources) => {
        vulntotal_worker.postMessage({
          purl: userInput,
          enable: enabledDatasources,
        });
      }
    );
  });

  vulntotal_worker.addEventListener("message", function (event) {
    if (event.data.type === PROGRESS_MSG) {
      const progressBar = document.getElementById("extension-loading");
      progressBar.value = event.data.value;
      if (progressBar.value === 100) {
        hideElementById("loading-div");
        showElementById("hero-div");
      }
    } else if (event.data.type === RESULTS_MSG) {
      // Show the table if it was hidden
      showElementById("table-div");
      showElementById("data-source-dropdown");
      // Hide hero div if it was visible
      hideElementById("hero-div");
      // Hide the button loading spinner
      const result = event.data.value;
      console.log(result);
      hideSearchButtonLoading();
      // Add the results to the table
      newDataSourceResult("deps", result["deps"]);
      newDataSourceResult("safetydb", result["safetydb"]);
      newDataSourceResult("osv", result["osv"]);
      newDataSourceResult("snyk", result["snyk"]);
      newDataSourceResult("oss_index", result["oss_index"]);
      newDataSourceResult("gitlab", result["gitlab"]);
      newDataSourceResult("github", result["github"]);
      newDataSourceResult("vulnerablecode", result["vulnerablecode"]);
      // Update filter options
      updateFilterOptions(result);
    }
  });

  document
    .getElementById("data-source-dropdown")
    .addEventListener("click", function (event) {
      const dropdown = event.currentTarget;
      dropdown.classList.toggle("is-active");
    });

  document
    .getElementById("dropdown-content")
    .addEventListener("click", function (event) {
      if (event.target.classList.contains("dropdown-item")) {
        event.preventDefault();
        const filterValue = event.target.dataset.source;
        filterResults(filterValue);
        document
          .getElementById("data-source-dropdown")
          .classList.remove("is-active");
      }
    });

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
    let queryOptions = { active: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
      if (tab.title !== "VulnTotal Home") {
        chrome.tabs.create({ url: "popup.html" });
      }
    });
  });

  const refreshButton = document.getElementById("refresh-button");
  refreshButton.addEventListener("click", async function () {
    clearTable();
    hideElementById("table-div");
    hideElementById("data-source-dropdown");
    showElementById("hero-div");
  });
});

const showSearchButtonLoading = () => {
  const sendButton = document.getElementById("submit_vuln");
  sendButton.classList.add("is-loading");
};

const hideSearchButtonLoading = () => {
  const sendButton = document.getElementById("submit_vuln");
  sendButton.classList.remove("is-loading");
};

const clearTable = () => {
  var tableRef = document
    .getElementById(`results-table`)
    .getElementsByTagName("tbody")[0];
  tableRef.innerHTML = "";
};

const formatCommaSeparated = (values) => {
  let output = "<div class='tags'>";
  values.forEach((element) => {
    output += `<span class='tag is-hoverable'>${element}</span>`;
  });
  output += "</div>";
  return output;
};

const showElementById = (elementId) => {
  const element = document.getElementById(elementId);
  element.classList.remove("is-hidden");
};

const hideElementById = (elementId) => {
  const element = document.getElementById(elementId);
  element.classList.add("is-hidden");
};

const addInputWarning = () => {
  const inputField = document.getElementById("id_search");
  inputField.classList.add("is-warning");
};

const removeInputWarning = () => {
  const inputField = document.getElementById("id_search");
  inputField.classList.remove("is-warning");
};

const getDatasourceLogo = (datasource) => {
  let output = '<div class="datasource-container">';

  switch (datasource) {
    case "deps":
      output += '<figure class="image is-48x48">';
      output += '<img src="static/images/deps_logo.png" alt="deps">';
      output += "</figure>";
      output += "<p>deps.dev</p>";
      break;
    case "safetydb":
      output += '<figure class="image is-48x48">';
      output += '<img src="static/images/safetydb_logo.png" alt="safetydb">';
      output += "</figure>";
      output += "<p>Safety DB</p>";
      break;
    case "oss_index":
      output += '<figure class="image is-64x64">';
      output += '<img src="static/images/oss_index_logo.png" alt="oss_index">';
      output += "</figure>";
      break;
    case "osv":
      output += '<figure class="image is-64x64">';
      output += '<img src="static/images/osv_logo.jpg" alt="osv">';
      output += "</figure>";
      break;
    case "snyk":
      output += '<figure class="image is-64x64">';
      output += '<img src="static/images/snyk_logo.svg" alt="snyk">';
      output += "</figure>";
      break;
    case "gitlab":
      output += '<figure class="image is-64x64">';
      output += '<img src="static/images/gitlab_logo.png" alt="gitlab">';
      output += "</figure>";
      break;
    case "github":
      output += '<figure class="image is-64x64">';
      output += '<img src="static/images/github_logo.png" alt="github">';
      output += "</figure>";
      break;
    case "vulnerablecode":
      output += '<figure class="image is-48x48">';
      output +=
        '<img src="static/images/vulnerablecode_logo.png" alt="vulnerablecode">';
      output += "</figure>";
      output += "<p>VulnerableCode</p>";
      break;
    default:
      break;
  }

  output += "</div>";
  return output;
};
