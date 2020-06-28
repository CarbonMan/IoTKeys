this.regions = new function () {
    this.country = [];
    var countryCSV = host.getInputFileContents("data/country.csv");
    if (!countryCSV) {
        countryCSV = host.getInputFileContents(`${me.libraryUrl}/data/country.csv`);
        if (countryCSV) {
            host.strToFile(countryCSV, "data/country.csv");
        }
    }
    if (countryCSV) {
        this.country = Papa.parse(countryCSV, {
                header: true
            });
    }
    this.getCountry = function (cCode) {
        var country = this.country.find((c, i) => {
                if (c.name == cCode.toUpperCase() || c.code == cCode.toUpperCase()) {
                    if (!c.getState) {
                        // Replace the entry with a country object
                        c = new Country(c);
                    }
                    return true;
                }
            });
        if (!country) {
            return null;
        }
        return country;
    };
    function Country(options) {
		this.name = options.name;
		this.code = options.code;
        this.states = [];
        //this.countryCode = countryCode;
        this.getState = function (state) {
            if (!this.states.length) {
                var statesCSV = host.getInputFileContents(`data/${this.name}/state.csv`);
                if (!statesCSV) {
                    statesCSV = host.getInputFileContents(`${me.libraryUrl}/data/${this.name}/state.csv`);
                    if (statesCSV) {
                        host.strToFile(statesCSV, `data/${this.name}/state.csv`);
                    }
                }
                if (statesCSV) {
                    this.states = Papa.parse(statesCSV, {
                            header: true
                        });
                }
            }
            var state = this.states.find((s) => {
                    return (s.name == state.toUpperCase() || s.code == state.toUpperCase());
                });
			return state;
        };
    }
    /*
    f

    // Convert from a state name to an abbreviation
    if (!country[details[19]]) {
    var states = [],
    statesCSV = host.getInputFileContents("data/states.csv");
    if (statesCSV) {
    //setTimeout(() => {
    // PapaParse has to load
    country[details[19]].states = Papa.parse(statesCSV);
    //}, 0);
    }
    }
    var state = states.data.find((s) => {
    return s[0] == details[17].toUpperCase();
    });
     */
};
