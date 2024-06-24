/*
 * Use App.getDependency for Dependency Injection
 * eg: var DialogService = App.getDependency('DialogService');
 */

/*
 * This function will be invoked when any of this prefab's property is changed
 * @key: property name
 * @newVal: new value of the property
 * @oldVal: old value of the property
 */

Prefab.onPropertyChange = function(key, newVal, oldVal) {
    /*
    switch (key) {
        case "prop1":
            // do something with newVal for property 'prop1'
            break;
        case "prop2":
            // do something with newVal for property 'prop2'
            break;
    }
    */
};

Prefab.onReady = function() {
    // this method will be triggered post initialization of the prefab.
    debugger
};

//commented as we binded checkboxsetOptions disply value to wideget directly
/*Prefab.placeholderValue = function() {
    var placeholderItems = [];
    _.forEach(Prefab.Widgets.checkboxsetOptions.datavalue, function(obj) {
        placeholderItems.push(obj[Prefab.displayfield]);
    });
    return placeholderItems.join(',');
};*/

Prefab.checkboxsetOptionsClick = function($event, widget) {
    if (Prefab.Widgets.checkboxsetOptions.datavalue.length == Prefab.dataset.length) {
        Prefab.Widgets.checkboxAll.datavalue = true;
    } else {
        Prefab.Widgets.checkboxAll.datavalue = false;
    }
};

Prefab.checkboxAllChange = function($event, widget, newVal, oldVal) {
    if (newVal) {
        Prefab.Widgets.checkboxsetOptions.datavalue = Prefab.dataset;
        _.forEach(Prefab.Widgets.checkboxsetOptions.datasetItems, function(val) {
            val.selected = true;
        });
    } else {
        Prefab.Widgets.checkboxsetOptions.datavalue = '';
        _.forEach(Prefab.Widgets.checkboxsetOptions.datasetItems, function(val) {
            val.selected = false;
        });
    }
};

/*
 * Method to clear selected data of checkboset
 */
Prefab.clearSelectedData = function () { 

};