class OptionsResolver {


    constructor(options) {
        this.options = options;
    }

    get isPackage() {
        if (!this.options.hasOwnProperty('package')) {
            return false;
        }
        return this.options.package && (this.options.package === true || this.options.package === "true")
    }

    get isCorsEnabled() {
        if (!this.options.hasOwnProperty('cors')) {

            return false;
        }
        return this.options.cors && (this.options.cors === true || this.options.cors === "true")
    }

    get isAutoMockEnabled() {
        if (!this.options.hasOwnProperty('autoMock')) {

            return false;
        }
        return this.options.autoMock && (this.options.autoMock === true || this.options.autoMock === "true")
    }

    get isValidationEnabled() {
        if (!this.options.hasOwnProperty('validation')) {

            return false;
        }
        return this.options.validation && (this.options.validation === true || this.options.validation === "true")
    }

    get inputFile() {
        if (!this.options.inputFile) {
            throw new TypeError('Missing argument inputFile');
        }

        return this.options.inputFile;
    }

    get inputDirectory() {
        if (!this.options.inputDirectory) {
            return './';
        }

        return this.options.inputDirectory;
    }

    get outputFile() {
        if (!this.options.outputFile) {
            return 'api.yml';
        }

        return this.options.outputFile;
    }

    get outputDirectory() {
        if (!this.options.outputDirectory) {
            return 'openapi-integration/';
        }

        return this.options.outputDirectory.replace(/\/?$/, '/');
    }

    get apiResourceName() {
        return this.options.apiResourceName;
    }

    _mappingPath(stage) {
        let path = null;
        if (this.options.mapping) {
            this.options.mapping.forEach(function (mapping) {
                if (Array.isArray(mapping.stage)) {
                    // Integration mapping stage array syntax
                    if (mapping.stage.includes(stage)) {
                        path = mapping.path;
                    }
                } else {
                    if (mapping.stage === stage) {
                        path = mapping.path;
                    }
                }
            });
        }

        if (path === null && !this.options.autoMock) {
            throw new TypeError(`Missing integration mapping for the ${stage} stage. Either define a mapping file or enable the AUTO-MOCK option`);
        }

        return path;
    }

        _proxyManager(stage) {
            let proxy = null;
            let options = this.options;

            if (options.mapping) {
                options.mapping.forEach(function (mapping) {
                    if (mapping.proxyManager) {
                        if (Array.isArray(mapping.stage)) {
                            // Integration mapping stage array syntax
                            if (mapping.stage.includes(stage) && mapping.hasOwnProperty('proxyManager')) {
                                proxy = mapping.proxyManager;
                            }
                        } else {
                            if (mapping.stage === stage) {
                                proxy = mapping.proxyManager;
                            }
                        }

                        if (proxy && proxy.type !== 'http_proxy') {
                            throw new TypeError(`Currently only type http_proxy is allowed`);
                        }
                    }
                });
            }
        return proxy;
    }

    resolve(stage = "dev") {
        return {
            package: this.isPackage,
            cors: this.isCorsEnabled,
            autoMock: this.isAutoMockEnabled,
            validation: this.isValidationEnabled,
            inputFile: this.inputFile,
            inputDirectory: this.inputDirectory,
            inputFullPath: this.inputDirectory + this.inputFile,
            outputFile: this.outputFile,
            outputDirectory: this.outputDirectory,
            outputFullPath: this.outputDirectory + this.outputFile,
            integrationPath: this._mappingPath(stage),
            proxy: this._proxyManager(stage),
            apiResourceName: this.apiResourceName,
        }
    }
}

module.exports = OptionsResolver;
