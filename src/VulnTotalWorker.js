class VulnTotalWorker {
  constructor() {
    this.pyodideUrl = "./packages/pyodide-core-0.26.1/pyodide/pyodide.js";
    this.packages = [
      "./packages/certifi-2024.2.2-py3-none-any.whl",
      "./packages/charset_normalizer-3.3.2-py3-none-any.whl",
      "./packages/click-8.1.7-py3-none-any.whl",
      "./packages/idna-3.6-py3-none-any.whl",
      "./packages/packageurl_python-0.15.1-py3-none-any.whl",
      "./packages/urllib3-2.2.2-py3-none-any.whl",
      "./packages/packaging-24.0-py3-none-any.whl",
      "./packages/python_dotenv-1.0.1-py3-none-any.whl",
      "./packages/requests-2.32.3-py3-none-any.whl",
      "./packages/saneyaml-0.6.0-py3-none-any.whl",
      "./packages/typing-3.10.0.0-py3-none-any.whl",
      "./packages/PyYAML-6.0.1-cp312-cp312-musllinux_1_1_x86_64.whl",
      "./packages/six-1.16.0-py2.py3-none-any.whl",
      "./packages/texttable-1.7.0-py2.py3-none-any.whl",
      "./packages/fetchcode-0.3.0-py3-none-any.whl",
      "./packages/soupsieve-2.5-py3-none-any.whl",
      "./packages/python_dateutil-2.9.0.post0-py2.py3-none-any.whl",
      "./packages/beautifulsoup4-4.12.3-py3-none-any.whl",
      "./packages/wcwidth-0.2.13-py2.py3-none-any.whl",
      "./packages/ftfy-6.2.0-py3-none-any.whl",
      "./packages/pyodide_http-0.2.1-py3-none-any.whl",
      "./packages/vulntotal-0.1-py3-none-any.whl",
    ];
    this.pyodide = null;
  }

  async init(progressMsg, githubAPIKey, vulnerableCodeAPIKey) {
    await this.loadPyodide();
    await this.loadPackages(progressMsg);
    this.setupPythonEnvironment(githubAPIKey, vulnerableCodeAPIKey);
  }

  async loadPyodide() {
    if (!self.importScripts) {
      throw new Error("importScripts function not available.");
    }
    self.importScripts(this.pyodideUrl);
    this.pyodide = await loadPyodide();
  }

  async loadPackages(progressMsg) {
    for (let i = 0; i < this.packages.length; i++) {
      await this.pyodide.loadPackage(this.packages[i]);
      const percentageLoaded = ((i + 1) / this.packages.length) * 100;
      postMessage({ type: progressMsg, value: percentageLoaded });
    }
  }

  setupPythonEnvironment(githubAPIKey, vulnerableCodeAPIKey) {
    this.pyodide.runPython("from io import StringIO");
    this.pyodide.runPython("from dotenv import load_dotenv");
    this.pyodide.runPython(
      `config = StringIO("""GH_TOKEN=${githubAPIKey}\nVCIO_TOKEN=${vulnerableCodeAPIKey}""")`
    );
    this.pyodide.runPython("load_dotenv(stream=config)");
    this.pyodide.runPython(`
        from vulntotal import vulntotal_cli
        import json
        import pyodide_http
        
        no_threading = True
        
        def run_vulntotal(purl, enable, disable):
          pyodide_http.patch_all()
          active_datasource = (
              vulntotal_cli.get_enabled_datasource(enable)
              if enable
              else (vulntotal_cli.get_undisabled_datasource(disable) if disable else vulntotal_cli.DATASOURCE_REGISTRY)
          )
  
          vulnerabilities = vulntotal_cli.run_datasources(purl, active_datasource, no_threading)
          return json.dumps(vulnerabilities, cls=vulntotal_cli.VendorDataEncoder, indent=2)
      `);
  }

  async runDatasources(purl, enable = [], disable = []) {
    if (!this.pyodide) {
      throw new Error("Pyodide is not loaded yet.");
    }
    const enableStr = JSON.stringify(enable);
    const disableStr = JSON.stringify(disable);
    const output = this.pyodide.runPython(`
          purl = "${purl}"
          enable = ${enableStr}
          disable = ${disableStr}
          run_vulntotal(purl, enable, disable)
      `);

    return JSON.parse(output);
  }
}
