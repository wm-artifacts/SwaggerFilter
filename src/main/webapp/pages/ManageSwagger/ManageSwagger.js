/*
*
Use App.getDependency
for Dependency Injection
    *
    eg: var DialogService = App.getDependency('DialogService');
*/
var jQueryScript = document.createElement('script');
jQueryScript.setAttribute('src', 'resources/files/yamlToJsonParser.js');
document.head.appendChild(jQueryScript);

let inputSwaggerFile = "";
let outputSwaggerFileName;
let swagger;
let fileType;
let storageType;

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
    storageType = App.appLocale.LABLE_STORAGE_TYPE == "localStorage" ? localStorage : sessionStorage;
};
//Page.isEndpointsCached = false;
Page.wizardstetUploadSwaggerLoad = function(widget, stepIndex) {
    let fileUploadCheck = Page.Widgets.fileuploadSwagger.datasource.dataSet.fileName;
    if (fileUploadCheck === undefined || fileUploadCheck.length <= 0) {
        $('button[name="nextBtn_wizardSwaggerFilter"]').prop('disabled', true);
    }
};
//commenetd as we are using s3bucket for file upload.
/*
Page.jsFileUploadServiceonSuccess = function(variable, data) {
    //debugger
    $("[class='list-group file-upload']").remove();
    inputSwaggerFile = data[0].path;
    Page.inputSwaggerFileName = data[0].fileName;
    //outputSwaggerFileName = `Updated ${inputSwaggerFile.split("=")[2]}`;
    getEndpointsFromSwagger(inputSwaggerFile);
    $('button[name="nextBtn_wizardSwaggerFilter"]').prop('disabled', false);
};
*/

Page.jsUploadSwaggerFileToS3onSuccess = function(variable, data) {
    $("[class='list-group file-upload']").remove();
    inputSwaggerFile = data.filePath;
    Page.inputSwaggerFileName = data.fileName;
    fileType = data.fileName.split(".").pop();
    getEndpointsFromSwagger(inputSwaggerFile);
    $('button[name="nextBtn_wizardSwaggerFilter"]').prop('disabled', false);
    Page.isEndpointsCached = false;
};

/*
Page.wizardstepEndPointsNext = function(widget, currentStep, stepIndex) {
    Page.Variables.stvSelectedSwaggerEndPoints.dataSet = [];
    Page.Variables.stvSelectedSwaggerEndPoints.dataSet = Page.Widgets.checkboxsetEndPoints.datavalue;
};
*/

//Adding the selected data to stvSelectedSwaggerEndPoints model variable
Page.checkboxsetEndPointsClick = function($event, widget) {
    Page.Variables.stvSelectedSwaggerEndPoints.dataSet = Page.Widgets.checkboxsetEndPoints.datavalue;
};

//On click on wizard done, updating the swagger end pointe based on selected endpoints
Page.wizardSwaggerFilterDone = function(widget, steps) {
    var endPoints = Page.Variables.stvSelectedSwaggerEndPoints.dataSet.map(function(endpoint) {
        return endpoint.path;
    });
    outputSwaggerFileName = `${App.appLocale.LABLE_OUTPUT_FILE_NAME}.${fileType}`;
    getUpdatedSwager(endPoints, outputSwaggerFileName);
};

//on wizrad cancel resetting the data 
Page.wizardSwaggerFilterCancel = function(widget, steps) {
    resetSwaggerFilterWizard();
};
//on clear of uploaded swagger file resetting the data 
Page.buttonClearFileClick = function($event, widget) {
    resetData();
};

//Extarcting all the endPoints from the uploaded swagger
function getEndpointsFromSwagger(inputSwaggerFile) {
    let swaggerContent = "";
    fetch(inputSwaggerFile)
        .then(response => {
            if (response.status == 200) {
                return response.text();
            } else {
                return new Promise((resolve, reject) => {
                    reject(new Error("Unable to fetch the swagger file to get the endpoints"));
                });
            }
        })
        .then(swaggerContent => {
            //checking fileType and Convert to json if fileType is yaml
            if (fileType == "json") {
                swagger = JSON.parse(swaggerContent);
            } else {
                const jsonObject = JSON.stringify(jsyaml.load(swaggerContent));
                swagger = JSON.parse(jsonObject);
            }
            Page.Variables.stvSwaggerEndPoints.dataSet = [];
            for (const path in swagger.paths) {
                for (const method in swagger.paths[path]) {
                    let methodName = method.toUpperCase();
                    if (methodName == "GET" || methodName == "POST" || methodName == "DELETE" || methodName == "PUT" || methodName == "PATCH" || methodName === "HEAD" || methodName === "OPTIONS" || methodName === "CONNECT" || methodName === "TRACE") {
                        const endpoint = {
                            path: path,
                            method: methodName
                        };
                        Page.Variables.stvSwaggerEndPoints.dataSet.push(endpoint);
                    }
                }
            }
            //Check if any endPoints in cache (localStorage/sessionStorage) adding as default selected endpoints
            selectCachedEndpoints(Page.inputSwaggerFileName);
            //after getting endpoints from file moving to next step of wizard
            Page.Widgets.wizardSwaggerFilter.next();
        })
        .catch(error => console.log("Error while extractig swagger endPoints" + error));
}

Page.wizardstepEndPointsLoad = function(widget, stepIndex) {
    if (Page.Widgets.checkboxsetEndPoints.datavalue.length <= 0) {
        Page.Widgets.checkboxsetEndPoints.datavalue = Page.Variables.stvSelectedSwaggerEndPoints.dataSet;
    }
};

//get the updated swagger with slected endPoints from the uploaded swagger. added async to avoid funcation call stack limit exceed
async function getUpdatedSwager(endPoints, outputFileName) {
    for (var path in swagger.paths) {
        if (endPoints.includes(path)) {
            var endpointMethods = Page.Variables.stvSelectedSwaggerEndPoints.dataSet.filter(endpoint => endpoint.path === path)
                .map(function(endpoint) {
                    return endpoint.method;
                });
            for (var pathMethod in swagger.paths[path]) {
                if (!endpointMethods.includes(pathMethod.toLocaleUpperCase())) {
                    delete swagger.paths[path][pathMethod];
                }
            }
        } else {
            delete swagger.paths[path];
        }
    }
    /*//commened as we added logic to remove definitions/models
    let modifiedSwaggerData = JSON.stringify(swagger, null, 2); */

    //To get updated swagger without usused definitions/models
    let finalSwagger = await removeUnusedDefinitions(swagger);
    let modifiedSwaggerData = JSON.stringify(finalSwagger, null, 2);
    //downloading updated swagger to local machine
    downloadUpdatedSwagger(modifiedSwaggerData, outputFileName, 'text/plain');
}

//downloading updated swagger to local machine
function downloadUpdatedSwagger(modifiedSwaggerData, fileName, mimeType) {
    Page.Widgets.spinnerDownload.show = true;
    let modifiedData = modifiedSwaggerData;
    try {
        // Convert modifiedData to yaml if the input typs is yaml then converting to a Blob object with the specified MIME type
        if (fileType !== "json") {
            modifiedData = jsyaml.dump(JSON.parse(modifiedSwaggerData));
        }
        const blob = new Blob([modifiedData], {
            type: mimeType
        });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = fileName; // Set file name here
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadLink);
        Page.Widgets.spinnerDownload.show = false;
        Page.Actions.nfSwaggerDownloadAction.invoke();
        //Add file to sessionStorage/localStorage
        addFileToSession(Page.inputSwaggerFileName, Page.Variables.stvSelectedSwaggerEndPoints.dataSet);
        //Rest the wizard data
        resetSwaggerFilterWizard();
    } catch (error) {
        Page.Actions.nfErrorSwaggerDownloadAction.invoke();
        console.error('Error creating Blob:', error);
    }
}

//resetting the wizrad data
function resetSwaggerFilterWizard() {
    resetData();
    //Navigating to first step if wizard on has any previous steps from the currentStep
    Page.Widgets.wizardSwaggerFilter.steps.forEach((item) => {
        if (Page.Widgets.wizardSwaggerFilter.hasPrevStep) {
            Page.Widgets.wizardSwaggerFilter.prev();
        }
    });
}

//resetting the wizrad data and invoking s3delete api.
function resetData() {
    Page.Widgets.fileuploadSwagger.datasource.clearData();
    Page.Variables.stvSelectedSwaggerEndPoints.dataSet = [];
    Page.Variables.stvSwaggerEndPoints.dataSet = [];
    Page.Widgets.checkboxsetEndPoints ? Page.Widgets.checkboxsetEndPoints.datavalue = [] : '';
    //Deleting uploaded swagger file from the s3
    if (inputSwaggerFile && inputSwaggerFile.length > 0) {
        Page.Variables.jsDeleteSwaggerFIle.invoke({
                "inputFields": {
                    "s3KeyName": `${App.appLocale.LABLE_S3_FOLDER_NAME}${Page.inputSwaggerFileName}`
                }
            },
            function(data) {
                // Success Callback
                console.log("success", data);
            },
            function(error) {
                // Error Callback
                console.log("error", error);
            }
        );
    }
}

//Check if any endPoints in cache(localStorage/sessionStorage), to add them as default selected endpoints
function selectCachedEndpoints(fileName) {
    if (storageType.getItem(Page.inputSwaggerFileName) !== null) {
        let previousSwaggerFile = JSON.parse(storageType.getItem(fileName));
        if (previousSwaggerFile.slectedCacheItems.length > 0) {
            Page.Variables.stvSelectedSwaggerEndPoints.dataSet = previousSwaggerFile.slectedCacheItems;
            Page.isEndpointsCached = true;
        }
    }
}

//Add uploaded file and selected endPoints to sessionStorage/localStorage that is choosen in localStorage
function addFileToSession(fileName, endPoints) {
    storageType.setItem(fileName, JSON.stringify({
        "slectedCacheItems": endPoints
    }));
}

// To select/clear all the unselected/selected endPoints
Page.checkboxSelectUnslectAllChange = function($event, widget, newVal, oldVal) {
    if (newVal == true) {
        Page.Variables.stvSelectedSwaggerEndPoints.dataSet = [];
        Page.Variables.stvSelectedSwaggerEndPoints.dataSet = Page.Variables.stvSwaggerEndPoints.dataSet;
        Page.Widgets.checkboxsetEndPoints.datasetItems.forEach(item => {
            item.selected = true;
        })
        $('button[name="nextBtn_wizardSwaggerFilter"]').prop('disabled', false);
    } else {
        if (Page.Widgets.checkboxsetEndPoints.datavalue != '') {
            Page.Widgets.checkboxsetEndPoints.datavalue = '';
        }
        Page.Widgets.checkboxsetEndPoints.datasetItems.forEach(item => {
            item.selected = false;
        });
        Page.Variables.stvSelectedSwaggerEndPoints.dataSet = [];
    }
};


//Start point : Logic to remove unused definitions/modles from the swagger file.
function findUsedDefinitions(updatedSwagger) {
    const usedDefinitions = new Set();
    for (const path in updatedSwagger.paths) {
        const pathItem = updatedSwagger.paths[path];
        for (const method in pathItem) {
            const operation = pathItem[method];
            for (let key in operation) {
                const iterable = operation[key];
                deepFindUsedDefinitions(iterable, usedDefinitions);
            }
        }
    }
    return usedDefinitions;
}

function deepFindUsedDefinitions(iterable, usedDefinitions) {
    if (typeof iterable == 'object') {
        if (Array.isArray(iterable)) {
            for (const item of iterable) {
                extractUsedDefinitions(item, usedDefinitions);
            }
        } else if (iterable && iterable.$ref) {
            if (iterable.$ref && Object.keys(iterable).length > 1) {
                extractUsedDefinitions(iterable, usedDefinitions);
                for (const item in iterable) {
                    deepFindUsedDefinitions(iterable[item], usedDefinitions);
                }
            } else {
                extractUsedDefinitions(iterable, usedDefinitions);
            }

        } else {
            for (const item in iterable) {
                deepFindUsedDefinitions(iterable[item], usedDefinitions);
            }
        }
    }
}

function extractUsedDefinitions(response, usedDefinitions) {
    if (response.$ref) {
        const ref = response.$ref.split('/').pop();
        usedDefinitions.add(ref);
    }
    return 0;
}

async function checkForUpdatedUsedDefinitions(iterableObject, usedDefinitions) {
    Object.entries(iterableObject) && Object.entries(iterableObject).forEach(([cKey, cValue], myIndex) => {
        if (usedDefinitions.has(cKey)) {
            if (typeof iterableObject[cKey] == 'object') {
                deepFindUsedDefinitions(iterableObject[cKey], usedDefinitions);
            }
        }
    })
    return true;
}

async function removeUnusedDefinitions(updatedSwagger) {
    const usedDefinitions = findUsedDefinitions(updatedSwagger);
    Object.entries(updatedSwagger) && Object.entries(updatedSwagger).forEach(([pKey, pValue], pIndex) => {
        if (pKey == 'webhooks' || pKey == 'components') {
            Object.entries(updatedSwagger[pKey]) && Object.entries(updatedSwagger[pKey]).forEach(([compKey, compValue], index) => {

                iterableObject = updatedSwagger[pKey][compKey];
                let usedDefLength = usedDefinitions.size;

                let myAwaitExecuted = checkForUpdatedUsedDefinitions(iterableObject, usedDefinitions);
                if (myAwaitExecuted && usedDefinitions.size > usedDefLength) {
                    checkForUpdatedUsedDefinitions(iterableObject, usedDefinitions);
                }

            })
        } else if (pKey == 'definitions') {
            iterableObject = updatedSwagger[pKey];
            let usedDefLength = usedDefinitions.size;
            let myAwaitExecuted = checkForUpdatedUsedDefinitions(iterableObject, usedDefinitions);
            if (myAwaitExecuted && usedDefinitions.size > usedDefLength) {
                checkForUpdatedUsedDefinitions(iterableObject, usedDefinitions);
            }
        }
    })
    Object.entries(updatedSwagger) && Object.entries(updatedSwagger).forEach(([pKey, pValue], pIndex) => {
        if (pKey == 'webhooks' || pKey == 'components') {
            Object.entries(updatedSwagger[pKey]) && Object.entries(updatedSwagger[pKey]).forEach(([compKey, compValue], index) => {
                Object.entries(updatedSwagger[pKey][compKey]) && Object.entries(updatedSwagger[pKey][compKey]).forEach(([cKey, cValue], myIndex) => {
                    if (!usedDefinitions.has(cKey)) {
                        delete updatedSwagger[pKey][compKey][cKey];
                    }
                })


            })
        } else if (pKey == 'definitions') {
            Object.entries(updatedSwagger[pKey]) && Object.entries(updatedSwagger[pKey]).forEach(([compKey, compValue], index) => {
                if (!usedDefinitions.has(compKey)) {
                    delete updatedSwagger[pKey][compKey];
                }
            })
        }
    })
    return updatedSwagger;
}

Page.selectFileTypeChange = function($event, widget, newVal, oldVal) {
    fileType = newVal
};

Page.wizardstepSelectedEndPointsLoad = function(widget, stepIndex) {
    Page.Widgets.selectFileType.datavalue = fileType;
};

//End point: Logic to remove unused definitions/modles
