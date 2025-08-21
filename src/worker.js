self.importScripts("./VulnTotalWorker.js");

let PROGRESS_MSG, RESULTS_MSG, ERROR_MSG;

const vulnTotalWorker = new VulnTotalWorker();

self.onmessage = async function (event) {
  if (event.data.type === "INIT") {
    PROGRESS_MSG = event.data.constants.PROGRESS_MSG;
    RESULTS_MSG = event.data.constants.RESULTS_MSG;
    ERROR_MSG = event.data.constants.ERROR_MSG;
    githubAPIKey = event.data.constants.githubAPIKey;
    vulnerableCodeAPIKey = event.data.constants.vulnerableCodeAPIKey;
    localVulnerableCodeHost = event.data.constants.localVulnerableCodeHost;
    localVulnerableCodePort = event.data.constants.localVulnerableCodePort;
    enableLiveEvaluation = event.data.constants.enableLiveEvaluation;
    await vulnTotalWorker.init(
      PROGRESS_MSG,
      githubAPIKey,
      vulnerableCodeAPIKey,
      localVulnerableCodeHost,
      localVulnerableCodePort,
      enableLiveEvaluation
    );
  } else {
    const result = await vulnTotalWorker.runDatasources(
      event.data.purl,
      event.data.enable
    );
    postMessage({ type: RESULTS_MSG, value: result });
  }
};
