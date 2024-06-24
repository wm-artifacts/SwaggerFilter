/*
 * Use App.getDependency for Dependency Injection
 * eg: var DialogService = App.getDependency('DialogService');
 */

/* perform any action on widgets/variables within this block */
Page.onReady = function() {
    /*
     * variables can be accessed through 'Page.Variables' property here
     * e.g. to get dataSet in a staticVariable named 'loggedInUser' use following script
     * Page.Variables.loggedInUser.getData()
     *
     * widgets can be accessed through 'Page.Widgets' property here
     * e.g. to get value of text widget named 'username' use following script
     * 'Page.Widgets.username.datavalue'
     */
    //resources/files/weavrswagger.json
};

let inputSwaggerFile = "";
let outputSwaggerFileName = "";
let swagger;

Page.jsFileUploadServiceonSuccess = function(variable, data) {
    //debugger
    inputSwaggerFile = data[0].path;
    outputSwaggerFileName = `Updated ${inputSwaggerFile.split("=")[2]}`;
    Page.Widgets.labelFileName.caption = '(' + outputSwaggerFileName + ')';
    //Page.Widgets.anchorDownload.caption = `Download Updated ${inputSwaggerFile.split("=")[2]}`;
    // getEndpointAndDownloadTheUpdateSwagger(inputSwaggerFile, '', '', true);
    getEndpointsFromSwagger(inputSwaggerFile);
};

Page.anchorDownloadClick = function($event, widget) {
    var endPoints = Page.Widgets.MultiSelectDropdown.selecteddropdownlist.map(function(endpoint) {
        return endpoint.path;
    });
    getUpdatedSwager(inputSwaggerFile, endPoints, outputSwaggerFileName);
};


function getEndpointsFromSwagger(inputSwaggerFile) {
    let swaggerContent = "";
    fetch(inputSwaggerFile)
        .then(response => {
            if (response.status == 200) {
                return response.text();
            } else {
                return new Promise((resolve, reject) => {
                    reject(new Error("File Note uploaded"));
                });
            }
        })
        .then(swaggerContent => {
            swagger = JSON.parse(swaggerContent);
            Page.Variables.stvSwaggerEndPoints.dataSet = [];
            for (const path in swagger.paths) {
                for (const method in swagger.paths[path]) {
                    const endpoint = {
                        path: path,
                        method: method.toUpperCase()
                    };
                    Page.Variables.stvSwaggerEndPoints.dataSet.push(endpoint);
                }
            }
        })
        .catch(error => console.log("Error" + error));
}

function getUpdatedSwager(inputSwaggerFile, endPoints, outputFileName) {
    for (var path in swagger.paths) {
        if (!endPoints.includes(path)) {
            delete swagger.paths[path];
        }
    }
    var modifiedSwaggerData = JSON.stringify(swagger, null, 2);
    //write updated swager file 
    downloadUpdatedSwagger(modifiedSwaggerData, outputFileName, 'text/plain');
}


function downloadUpdatedSwagger(modifiedSwaggerData, fileName, mimeType) {
    // Create a Blob object with the modifiedSwaggerData and specified MIME type
    var blob = new Blob([modifiedSwaggerData], {
        type: mimeType
    });
    // Create a temporary URL for the Blob object
    var url = URL.createObjectURL(blob);
    // Create a link element
    var link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    // Clean up the temporary URL and link element
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}



//Function to retrieve endPoints from a Swagger file
/*function getEndpointsFromSwagger(swaggerFile) {
    debugger
    // Fetch the Swagger file
    fetch(swaggerFile)
        .then(response => response.text())
        .then(swaggerContent => {
            // Parse the Swagger content
            let swagger;
            try {
                swagger = JSON.parse(swaggerContent); // For JSON file
            } catch (error) {
                console.error('Error parsing Swagger file:', error);
                return;
            }
            // Retrieve the endPoints
            Page.Variables.stvSwaggerEndPoints.dataSet = [];
            for (const path in swagger.paths) {
                for (const method in swagger.paths[path]) {
                    const endpoint = {
                        path: path,
                        method: method.toUpperCase()
                    };
                    Page.Variables.stvSwaggerEndPoints.dataSet.push(endpoint);
                }
            }
            // Do something with the endPoints
            console.log('Endpoints:', endpoints);
        })
        .catch(error => {
            console.error('Error fetching Swagger file:', error);
        });
}*/

/*
function updateAndDownLoadSwagger(inputSwaggerFile, endPoints, outputFileName) {
    debugger
    fetch(inputSwaggerFile)
        .then(response => response.text())
        .then(swaggerContent => {
            // Parse the Swagger content
            let swagger;
            try {
                swagger = JSON.parse(swaggerContent); // For JSON file
            } catch (error) {
                console.error('Error parsing Swagger file:', error);
                return;
            }
            // update the Swaggerwith specified endPoints
            for (var path in swagger.paths) {
                if (!endPoints.includes(path)) {
                    delete swagger.paths[path];
                }
            }
            // Save the modified Swagger JSON back to file
            var modifiedSwaggerData = JSON.stringify(swagger, null, 2);
            downloadUpdateSwagger(modifiedSwaggerData, outputFileName, 'text/plain');
        })
        .then(function() {
            console.log('Swagger JSON file modified and saved successfully.');
        })
        .catch(function(error) {
            console.error('Error while modifying Swagger JSON file:', error);
        });
}
*/
/*Page.button1Click = function($event, widget) {
    debugger
    Page.Widgets.MultiSelectDropdown.Widgets.checkboxsetOptions.datavalue = [];
    _.forEach(Page.Widgets.MultiSelectDropdown.Widgets.checkboxsetOptions.datasetItems, function(val) {
        val.selected = false;
    });
};*/