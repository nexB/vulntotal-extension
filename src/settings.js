import { showNotification } from "./utils.js";

document.addEventListener("DOMContentLoaded", function () {
  const backButton = document.getElementById("back-button");
  backButton.addEventListener("click", async function () {
    chrome.tabs.update({ url: "popup.html" });
  });

  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  const submitButton = document.getElementById("submit-btn");

  // Function to check if any data sources are selected
  function updateSubmitButtonState() {
    const isAnyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
    submitButton.disabled = !isAnyChecked;
    if (!isAnyChecked) {
      showNotification("warning", "Please select at least one data source.");
    }
  }

  // Initialize checkboxes based on enabled data sources
  function initializeCheckboxes(enabledDataSources) {
    checkboxes.forEach((checkbox) => {
      const label = checkbox.parentElement.textContent.trim();
      if (enabledDataSources.includes(label.toLowerCase().replace(" ", "_"))) {
        checkbox.checked = true;
      }
      checkbox.addEventListener('change', updateSubmitButtonState); // Add this line
    });
    updateSubmitButtonState(); // Ensure correct initial state of the Submit button
  }

  // Initialize API keys by their values
  function initializeApiKeys(apiKeys) {
    const gitHubTokenField = document.getElementById("github-api-key");
    const vulnerableCodeTokenField = document.getElementById(
      "vulnerablecode-api-key"
    );

    if (apiKeys.GitHubAPIKey) {
      gitHubTokenField.value = apiKeys.GitHubAPIKey;
    }
    if (apiKeys.VulnerableCodeAPIKey) {
      vulnerableCodeTokenField.value = apiKeys.VulnerableCodeAPIKey;
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

  submitButton.addEventListener("click", () => {
    const checkedDataSources = [];
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

    if (gitHubToken !== "" || vulnerableCodeToken !== "") {
      chrome.runtime.sendMessage(
        {
          type: "SET_API_KEYS",
          GitHubAPIKey: gitHubToken,
          VulnerableCodeAPIKey: vulnerableCodeToken,
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
