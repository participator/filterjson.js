(
    function(undefined) {
    'use strict';

    const exports = {};
    window.Filter = exports;

    // Dependencies
    const _filter = {};

    /**
     * Allows user to set the filter conditions
     * @param { object[] } propertyValue
     * @returns undefined
     */
    _filter.setFilterCriteria = function setFilterCriteria(filterCriterias = [{property: undefined, value: undefined}]) {
        this.filterCriterias = filterCriterias;
        this.allPropertiesHaveValue = checkAllfilterCriteriasPropertiesHaveValue(this.filterCriterias);
    }

    function checkAllfilterCriteriasPropertiesHaveValue(propertyValues) {
        return propertyValues.every(function(propertyValue) {
            const stringHasValue = stringPropertyHasValue(propertyValue.value);
            const arrayHasValue = arrayPropertyHasValue(propertyValue.value);

            return stringHasValue || arrayHasValue;
        });
    }

    function stringPropertyHasValue(stringValue) {
        return typeof stringValue === 'string' && stringValue.trim().length > 0;
    }

    function arrayPropertyHasValue(arrayValue) {
        return Array.isArray(arrayValue) && 
        arrayValue.length > 0 &&
        arrayValue.filter((value) => {
            return typeof value === 'string' && value.trim().length > 0
        }).length > 0;
    }
        
    /**
    * Returns the filtered data
    * @returns {object Array} matchedResources
    */
   _filter.getFilteredResults = function getFilteredResults(data) {
       let matchedResources = [];

       if (!Array.isArray(data)) throw new Error('Provide data as an Array');

       data.forEach(resource => {
           if (_checkResourceForMatch(resource)) {
               matchedResources.push(resource);
           }
       })

       return matchedResources;
    };

    function _checkResourceForMatch(resource) {
        return _filter.filterCriterias.some(filterCriteria => {
            return resourceValuetype(filterCriteria, resource);
        })
    }

    function resourceValuetype(filterCriteria, resource) {
        const valueType = {
            string: resource[filterCriteria.property] === filterCriteria.value,
            object: (function() {
                const value = resource[filterCriteria.property];
                if (Array.isArray(value) && value.length > 0 ) {
                    value.forEach(subResource => {
                        return _checkResourceForMatch(subResource);
                    })
                }
            })(),
        };

        return valueType[typeof resource[filterCriteria.property]];
    }
    
    /** Return a searches a specific category of resources if provided
    * If no category is provided, searches all categories
    * @param {array} allResources
    * @param {string|array} resourceCategory
    * @param {object Array} propertyText
    * @returns {array} matching resources
    */ 
    function _getResourceCategory(allResources, resourceCategory, propertyText) {
        var resourcesMatching = [];
        // search only provided Categories
        if (Array.isArray(resourceCategory) && resourceCategory.length > 0) {
            for (var i in resourceCategory) {
                resourcesMatching.push(..._getResource(resourceCategory[i], allResources[resourceCategory[i]], propertyText));                
            }
        }
        else if (typeof resourceCategory === 'string') {
            resourcesMatching.push(..._getResource(resourceCategory, allResources[resourceCategory], propertyText));
        }
        // search all Categories
        else if (resourceCategory === undefined || resourceCategory === 'undefined' ) {
            var catergoryArray = categories.getCategories();
            for(var cIndex=0; cIndex < catergoryArray.length; cIndex++) {
                resourcesMatching.push(..._getResource(catergoryArray[cIndex], allResources[catergoryArray[cIndex]], propertyText));
            }
        }
        else {
            throw new Error('Unsupported categories provided')
        }
        
        // Filter out null values
        resourcesMatching = resourcesMatching.filter(function(item) {
            return item !== null && item !== undefined; // undefined is temporary solution
        });
        
        return [... new Set(resourcesMatching)];
    }

    /** Search a resource
    * @params {string} category
    * @param {object Array} resourcesForOneCategory
    * @param {object propertyText} propertyText
    * @returns {array} matching resources
    */
    function _getResource(category, resourcesForOneCategory, propertyText) {
        var resourcesMatching = [];
        for (var i=0; i < resourcesForOneCategory.length; i++) {
            for (var propertyTextIndex=0; propertyTextIndex < propertyText.length; propertyTextIndex++) {
                for (var resourceProperty in resourcesForOneCategory[i]) {
                    resourcesMatching.push(_getPropertyMatch(category, resourcesForOneCategory[i], resourceProperty, propertyText[propertyTextIndex]));
                }
            }
        }
        return resourcesMatching;
    }

    /** Searches if a property matches a given property
    * If no propertyToMatch is provided, searches all properties
    * @param {string} category
    * @param {object Object} resource
    * @param {string} property
    * @param {string} propertyTextToMatch
    * @returns {object} resource with a property that matches text
    */
    function _getPropertyMatch(category, resource, property, propertyTextToMatch) {
        if (!propertyTextToMatch.property || 
            (property === propertyTextToMatch.property && properties.getProperties(true).includes(propertyTextToMatch.property))) {
            return _getPropertyTextInResource(category, resource, property, propertyTextToMatch.text);
        }
    }

    /** Search if match of text is found in resource property
    * @param {string} category
    * @param {object} resource
    * @param {string} matchedProperty
    * @param {string} textToMatch
    * @returns {object} resource a resource that has a property that matches textToMatch
    */ 
    function _getPropertyTextInResource(category, resource, matchedProperty, textToMatch) {
        // check for both string case
        if (typeof textToMatch === 'string') {
            if (typeof resource[matchedProperty] === 'string') {
                if (resource[matchedProperty].toLowerCase().includes(textToMatch.toLowerCase())) {
                    resource.category = category;
                    return resource;
                }
            }
            else if (Array.isArray(resource[matchedProperty])) {
                for (var rIndex=0; rIndex < resource[matchedProperty].length; rIndex++) {
                    if (resource[matchedProperty][rIndex].toLowerCase().includes(textToMatch.toLowerCase())) {
                        resource.category = category;
                        return resource;
                    }
                }
            }
        }
        else if (Array.isArray(textToMatch)) {
            if (typeof resource[matchedProperty] === 'string') {
                for (var ttmIndex=0; ttmIndex < textToMatch.length; ttmIndex++) {
                    if (resource[matchedProperty].toLowerCase().includes(textToMatch[ttmIndex].toLowerCase())) {
                        resource.category = category;
                        return resource;
                    }
                }
            }
            else if (Array.isArray(resource[matchedProperty])) {
                for (var rIndex=0; rIndex < resource[matchedProperty].length; rIndex++) {
                    for (var ttmIndex=0; ttmIndex < textToMatch.length; ttmIndex++) {
                        if (resource[matchedProperty][rIndex].toLowerCase().includes(textToMatch[ttmIndex].toLowerCase())) {
                            resource.category = category;
                            return resource;
                        }
                    }
                }
            }
        }
        return null; // no match
    }

    exports.filter = Object.create(_filter);

    // Example of how to use filter
    // @params{string[], {string, string[]}} (topic, fieldText)
    //  let allCategories = categories.getCategories();
     // exports.filter.setFilterCriteria({categories: allCategories, propertyText: [{property: 'difficulty', text: 'beginner'}]});
     // exports.filter.setFilterCriteria({categories: 'HTML', propertyText: [{property: 'difficulty', text: 'beginner'}]});
    //  exports.filter.setFilterCriteria({categories: ['HTML'], propertyText: [{property: 'difficulty', text: 'beginner'}]});
    //  console.log("[Filtered Results]: ", exports.filter.getFilteredResults())
})();