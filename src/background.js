chrome.runtime.onInstalled.addListener(() => {
  const initialDatasources = {
    enabledDatasources: [
      "deps",
      "osv",
      "oss_index",
      "snyk",
      "safetydb",
      "gitlab",
    ],
  };
  chrome.storage.sync.set(initialDatasources);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Only allow messages from the extension itself for security
  if (sender.origin === "chrome-extension://" + chrome.runtime.id) {
    if (request.type === "GET_ENABLED_DATASOURCES") {
      chrome.storage.sync.get("enabledDatasources", (result) => {
        sendResponse(result.enabledDatasources);
      });
      return true;
    } else if (request.type === "SET_ENABLED_DATASOURCES") {
      chrome.storage.sync.set(
        { enabledDatasources: request.enabledDatasources },
        () => {
          sendResponse({ success: true });
        }
      );
      return true;
    } else if (request.type === "SET_API_KEYS") {
      const keys = {};
      if (request.GitHubAPIKey) {
        keys.GitHubAPIKey = request.GitHubAPIKey;
      }
      if (request.VulnerableCodeAPIKey) {
        keys.VulnerableCodeAPIKey = request.VulnerableCodeAPIKey;
      }
      chrome.storage.sync.set(keys, () => {
        sendResponse({ success: true });
      });
      return true;
    } else if (request.type === "GET_API_KEYS") {
      chrome.storage.sync.get(
        ["GitHubAPIKey", "VulnerableCodeAPIKey"],
        (result) => {
          sendResponse({
            GitHubAPIKey: result.GitHubAPIKey,
            VulnerableCodeAPIKey: result.VulnerableCodeAPIKey,
          });
        }
      );
      return true;
    }
  } else {
    sendResponse({ success: false, message: "Unauthorized request" });
    return false;
  }
});
