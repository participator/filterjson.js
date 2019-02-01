(function(undefined) {

	var exports = {};
	window.MobileHub = window.MobileHub || exports;
	if(window.MobileHub) exports = window.MobileHub;

	// Dependencies
	const filter = window.MobileHub.Filter.filter;
	const resources = window.MobileHub.Resources;
	const categories = window.MobileHub.Categories.data;
	const contributors = window.MobileHub.Contributors.data;
	
	window.onload = function() {
		// displayDataAll();
	};

	/*
	These are HTML strings. JavaScript functions 
	replace the %data% placeholder text you see in them.
	*/

	// Img and intro to each category
	const categoryDetails = '<h1 class = "categoryName">%title%</h1><p class="intro header-content">%intro%</p>';

	// Create list with content
	const listResourceItem = document.createElement('li');
	listResourceItem.classList.add('category-content__item');

	const resourcesContent = '<p><a href="%link%" target="_blank"><span class="text-content"><span>%title%</span></span></a><p>%description%</p></p>';
	const resourcesContent = document.createElement('p');
	const anchor = document.createElement('a');
	anchor.setAttribute('href', 'link');
	anchor.setAttribute('target', '_blank');
	resourcesContent.appendChild(anchor);

	// Display given resource in UI
	function parseFilteredResource(name, resource) {
		$('.articleList .' + name).removeClass('hidden');
		$(".articleList ." + name).append(listedResources);
		//Match %data% with object
		const replaceChars={ "%link%": resource.link, "%title%": resource.title, "%description%": resource.description };
		//Replace %data% with object informtaion
		const formattedContent = resourcesContent.replace(/%link%|%title%|%description%/g,
			function(match) {
				return replaceChars[match];
			});
		$(".articleList ." + name + " li:last").append(formattedContent);
	}

	// Create FilterCriteria for filter
	// @param {string[]} categories
	// @param {string[]} difficultites
	// @param {string[]} terms
	// @returns 
	function createFilterCriteria(categories, difficulties, terms) {
		const filterCriteriaConstructor = {
			create(categories, propertyText) {
				this.categories = categories;
				this.propertyText = propertyText;
			}
		};

		const propertyTextConstructor = {
			create(property, text) {
				this.property = property;
				this.text = text;
			}
		};

		let nullPropertyTexts = [];
		if (!difficulties && !terms) {
			const propertyText = Object.create(propertyTextConstructor);
			propertyText.create(undefined, undefined);
			nullPropertyTexts.push(propertyText);
		}

		// Build propertyText for difficulties
		const difficultiesPropertyTexts = [];

		if (difficulties && Array.isArray(difficulties) && difficulties.length) {
			const propertyText = Object.create(propertyTextConstructor);
			

			if (difficulties[0].toLowerCase() === 'all') {
				propertyText.create('difficulty', undefined);
				difficultiesPropertyTexts.push(propertyText);				
			}
			else {
				propertyText.create('difficulty', difficulties);
				difficultiesPropertyTexts.push(propertyText);
			}
		}

		// Build propertyText for terms
		const termsPropertyTexts = [];
		if (terms && terms.length) {
			terms.forEach(term => {
				const propertyText = Object.create(propertyTextConstructor);
				propertyText.create(undefined, term);
				termsPropertyTexts.push(propertyText);
			});
		}

		const propertyTextCombined = [...nullPropertyTexts, ...difficultiesPropertyTexts, ...termsPropertyTexts];
		
		const filterCriteria = Object.create(filterCriteriaConstructor);
		filterCriteria.create(categories, propertyTextCombined)
		return filterCriteria;		
	}

	function getFilteredResources(filterCriteria) {
		filter.setFilterCriteria(filterCriteria);
		
		var filteredResults = filter.getFilteredResults();

		return filteredResults;
	}

	function addFilterDataToUI(results) {
		results.forEach(result => {
			parseFilteredResource(result.category, result);
		})
	}

	function filterResources(categories, difficulties, terms) {
		const filterCriteria = createFilterCriteria(categories, difficulties, terms);
		const filteredResults = getFilteredResources(filterCriteria);

		addFilterDataToUI(filteredResults);
	}

	/**********************************/
	// Public Functions
	/**********************************/

	exports.displayFilteredData = filterResources;

	
	/*********************************/
	// Test functions
	/*********************************/
	
	// Displays resources of a given category
	exports.showCategory = function(categories) {
		if (categories) {
			// selected category and difficulty
			filterResources(categories);
		}
	};

	// Displays resources of a given difficulty
	exports.showDifficulty = function(difficulties) {
		filterResources(undefined, difficulties);
	}

	exports.showSearchTerms = function(terms) {
		var searchTerms = terms.split(' ');
		
		filterResources(undefined, undefined, searchTerms);
	}

})();
