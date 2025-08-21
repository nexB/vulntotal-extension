import { showNotification } from "./utils.js";

document.addEventListener("DOMContentLoaded", function () {
  const backButton = document.getElementById("back-button");
  backButton.addEventListener("click", async function () {
    chrome.tabs.update({ url: "popup.html" });
  });

  // Function to initialize checkboxes based on enabled data sources
  function initializeCheckboxes(enabledDataSources) {
    const checkboxes = document
      .getElementById("datasource-checkboxes")
      .querySelectorAll("input[type='checkbox']");
    checkboxes.forEach((checkbox) => {
      const label = checkbox.parentElement.textContent.trim();
      if (enabledDataSources.includes(label.toLowerCase().replace(" ", "_"))) {
        checkbox.checked = true;
      }
    });
  }

  // Function to initialize API keys by their values
  function initializeApiKeys(configuration) {
    const gitHubTokenField = document.getElementById("github-api-key");
    const vulnerableCodeTokenField = document.getElementById(
      "vulnerablecode-api-key"
    );
    const localHostField = document.getElementById("local-vc-host");
    const localPortField = document.getElementById("local-vc-port");
    const liveEvalField = document.getElementById("enable-live-eval");

    if (configuration.GitHubAPIKey) {
      gitHubTokenField.value = configuration.GitHubAPIKey;
    }
    if (configuration.VulnerableCodeAPIKey) {
      vulnerableCodeTokenField.value = configuration.VulnerableCodeAPIKey;
    }
    if (configuration.LocalVCHost) {
      localHostField.value = configuration.LocalVCHost;
    }
    if (configuration.LocalVCPort) {
      localPortField.value = configuration.LocalVCPort;
    }
    if (typeof configuration.EnableLiveEvaluation === "boolean") {
      liveEvalField.checked = configuration.EnableLiveEvaluation;
    }
  }

  // Function to toggle API key field visibility
  function toggleVisibility(inputId, buttonId) {
    const inputField = document.getElementById(inputId);
    const toggleButton = document.getElementById(buttonId);

    toggleButton.addEventListener("click", () => {
      const icon = toggleButton.querySelector("i");
      if (inputField.type === "password") {
        inputField.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        inputField.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  }

  chrome.runtime.sendMessage(
    { type: "GET_ENABLED_DATASOURCES" },
    (response) => {
      if (response) {
        initializeCheckboxes(response);
      }
    }
  );

  chrome.runtime.sendMessage({ type: "GET_API_KEYS" }, (response) => {
    if (response) {
      initializeApiKeys(response);
    }
  });

  const submitButton = document.getElementById("submit-btn");
  submitButton.addEventListener("click", () => {
    const checkedDataSources = [];
    const checkboxes = document
      .getElementById("datasource-checkboxes")
      .querySelectorAll("input[type='checkbox']");
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const label = checkbox.parentElement.textContent.trim();
        checkedDataSources.push(label.toLowerCase().replace(" ", "_"));
      }
    });

    let success = true;

    console.log("checkedDataSources", checkedDataSources);

    chrome.runtime.sendMessage(
      {
        type: "SET_ENABLED_DATASOURCES",
        enabledDatasources: checkedDataSources,
      },
      (response) => {
        console.log("response", response);
        success = success && response.success;
      }
    );

    const gitHubToken = document.getElementById("github-api-key").value;
    const vulnerableCodeToken = document.getElementById(
      "vulnerablecode-api-key"
    ).value;
    const localHost = document.getElementById("local-vc-host").value;
    const localPort = document.getElementById("local-vc-port").value;
    const enableLiveEval = document.getElementById("enable-live-eval").checked;

    if (
      gitHubToken !== "" ||
      vulnerableCodeToken !== "" ||
      localHost !== "" ||
      localPort !== "" ||
      typeof enableLiveEval === "boolean"
    ) {
      chrome.runtime.sendMessage(
        {
          type: "SET_API_KEYS",
          GitHubAPIKey: gitHubToken,
          VulnerableCodeAPIKey: vulnerableCodeToken,
          LocalVCHost: localHost,
          LocalVCPort: localPort,
          EnableLiveEvaluation: enableLiveEval,
        },
        (response) => {
          success = success && response.success;
        }
      );
    }

    if (success) {
      showNotification("success", "Settings updated successfully!");
    } else {
      showNotification("danger", "Error updating settings. Please try again.");
    }
  });

  toggleVisibility("github-api-key", "toggle-github-api-key");
  toggleVisibility("vulnerablecode-api-key", "toggle-vulnerablecode-api-key");
});
