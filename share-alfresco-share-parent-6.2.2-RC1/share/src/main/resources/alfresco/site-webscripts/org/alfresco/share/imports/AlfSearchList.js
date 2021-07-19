
define(["dojo/_base/declare",
        "alfresco/lists/AlfSortablePaginatedList",
        "alfresco/core/topics",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/dom-class",
        "alfresco/util/hashUtils",
        "dojo/io-query",
        "alfresco/core/ArrayUtils",
        "alfresco/core/ObjectTypeUtils",
        "alfresco/search/AlfSearchListView"],
        function(declare, AlfSortablePaginatedList, topics, array, lang, domClass, hashUtils, ioQuery, arrayUtils, ObjectTypeUtils) {

   return declare([AlfSortablePaginatedList], {

      
      i18nRequirements: [{i18nFile: "./i18n/AlfSearchList.properties"}],

     
      cssRequirements: [{cssFile:"./css/AlfSearchList.css"}],

     
      additionalQueryParameters: null,

      
      facetFields: "",

     
      facetFilters: null,

     
      hideFacets: true,

      itemKeyProperty: "nodeRef",

     
      resultsCountMessage: "faceted-search.results-menu.results-found-patch",

      
      searchTerm: "",

     
      selectedScope: "repo",

      
      spellcheck: true,

      
      totalResultsProperty: "numberFound",

     
      updateInstanceValues: true,

     
      _resetVars: ["facetFilters", "query"],

     
      postMixInProperties: function alfresco_search_AlfSearchList__postMixInProperties() {
         this.inherited(arguments);
         this._suspendSpellCheck = false;
         this._cleanResettableVars();

         if (this.useHash === true)
         {
            // Push the core hash update variables into the array configured by the extended AlfSortablePaginatedList
            this._coreHashVars.push("searchTerm","scope","facetFilters");
         }

         // NOTE: This is required to ensure that no search is performed when no search hash variables are
         //       initially provided. Added for backwards compatibility.
         this.currentFilter = {};
      },

      
      onReloadData: function alfresco_search_AlfSearchList__onReloadData() {
         this.resetResultsList();
         this.loadData();
      },

     
      setupSubscriptions: function alfresco_search_AlfSearchList__setupSubscriptions() {
         this.inherited(arguments);
         this.alfSubscribe("ALF_SET_SEARCH_TERM", lang.hitch(this, this.onSearchTermRequest));
         this.alfSubscribe("ALF_INCLUDE_FACET", lang.hitch(this, this.onIncludeFacetRequest));
         this.alfSubscribe("ALF_APPLY_FACET_FILTER", lang.hitch(this, this.onApplyFacetFilter));
         this.alfSubscribe("ALF_REMOVE_FACET_FILTER", lang.hitch(this, this.onRemoveFacetFilter));
         this.alfSubscribe("ALF_SEARCHLIST_SCOPE_SELECTION", lang.hitch(this, this.onScopeSelection));
         this.alfSubscribe("ALF_ADVANCED_SEARCH", lang.hitch(this, this.onAdvancedSearch));
      },

     
      setDisplayMessages: function alfresco_search_AlfSearchList__setDisplayMessages() {
         this.noDataMessage = this.message("searchlist.no.data.message");
         this.fetchingDataMessage = this.message("searchlist.loading.data.message");
         this.renderingViewMessage = this.message("searchlist.rendering.data.message");
         this.fetchingMoreDataMessage = this.message("searchlist.loading.data.message");
         this.dataFailureMessage = this.message("searchlist.data.failure.message");
      },

      onSearchTermRequest: function alfresco_search_AlfSearchList__onSearchTermRequest(payload) {
         this.alfLog("log", "Setting search term", payload, this);

         var currHash;
         var searchTerm = lang.getObject("searchTerm", false, payload);
         if (searchTerm === null || searchTerm === undefined)
         {
            this.alfLog("warn", "No searchTerm provided on request", payload, this);
         }
         else if (searchTerm === this.searchTerm)
         {
            // The requested search term is the same as the previous one...
            // We want to allow duplicate searches to be made (to address eventual consistency issues)
            // but we want to prevent concurrent requests using the same data...
            if (this.requestInProgress === true)
            {
               // If a request is currently in progress, then we can just ignore this request.
            }
            else
            {
               if (payload.spellcheck === false)
               {
                  this._suspendSpellCheck = true;
               }

               if (this.useHash === true)
               {
                  // If a request is NOT in progress then we need to manually request a new search, because re-setting
                  // the hash will not trigger the changeFilter function....
                  // If the current hash includes a term from the resetHashTerms array, we need to clear those terms before
                  // setting a search term (even if it is the same), in this case updating the hash will trigger the search...
                  currHash = hashUtils.getHash();
                  if (this._cleanResettableHashTerms(currHash))
                  {
                     currHash.searchTerm = this.searchTerm;
                     this.alfPublish("ALF_NAVIGATE_TO_PAGE", {
                        url: ioQuery.objectToQuery(currHash),
                        type: "HASH"
                     }, true);
                  }
                  else
                  {
                     // The current hash has no resettable terms so we need to trigger a manual search...
                     this.resetResultsList();
                     this.loadData();
                  }
               }
               else
               {
                  // When not using URL hashes, just apply the new search...
                  this.resetResultsList();
                  this.loadData();
               }
            }
         }
         else
         {
            // The requested search term is new, so updating the hash will result in a new search...
            this.searchTerm = searchTerm;
            if (this.useHash === true)
            {
               currHash = hashUtils.getHash();
               this._cleanResettableHashTerms(currHash);
               currHash.searchTerm = this.searchTerm;
               this.alfPublish("ALF_NAVIGATE_TO_PAGE", {
                  url: ioQuery.objectToQuery(currHash),
                  type: "HASH"
               }, true);
            }
            else
            {
               this.resetResultsList();
               this.loadData();
            }
         }
      },

     
      onAdvancedSearch: function alfresco_search_AlfSearchList__onAdvancedSearch(payload) {
         this.resetResultsList();
         this.alfCleanFrameworkAttributes(payload, true);
         this.searchTerm = payload.searchTerm;
         delete payload.searchTerm;
         this.query = payload;
         this.loadData();
      },

      
      onScopeSelection: function alfresco_search_AlfSearchList__onScopeSelection(payload) {
         this.alfLog("log", "Scope selection received", payload, this);
         var scope = lang.getObject("value", false, payload);
         if (scope === null || scope === undefined)
         {
            this.alfLog("warn", "No 'value' attribute provided in scope selection payload", payload, this);
         }
         else if (scope === this.selectedScope)
         {
            this.alfLog("log", "Scope requested is currently set", scope, this);
         }
         else
         {
            this.selectedScope = scope;
            if (scope === "repo" || scope === "all_sites")
            {
               this.siteId = "";
            }
            else
            {
               this.siteId = scope;
            }

            if (this.useHash === true)
            {
               var currHash = hashUtils.getHash();
               currHash.scope = scope;
            
               // Update the hash to trigger a search...
               this.alfPublish("ALF_NAVIGATE_TO_PAGE", {
                  url: ioQuery.objectToQuery(currHash),
                  type: "HASH"
               }, true);
            }
            else
            {
               this.resetResultsList();
               this.loadData();
            }
         }
      },

     
      onIncludeFacetRequest: function alfresco_search_AlfSearchList__onIncludeFacetRequest(payload) {
         this.alfLog("log", "Adding facet filter", payload, this);
         var qname = lang.getObject("qname", false, payload);
         var blockIncludeFacetRequest = lang.getObject("blockIncludeFacetRequest", false, payload);
         if (qname === null || qname === undefined)
         {
            this.alfLog("warn", "No qname provided when adding facet field", payload, this);
         }
         else if (blockIncludeFacetRequest !== null && blockIncludeFacetRequest === true)
         {
            // Don't include the facet in the facet fields, however indicate that facet
            this.hideFacets = false;
         }
         else
         {
            // Make sure each facet is only included once (the search API is not tolerant of duplicates)...
            // Even if multiple widgets want to include the same facet, they will all receive the same
            // publication on search results...
            this.hideFacets = false;
            var f = this.facetFields.split(",");
            var alreadyAdded = array.some(f, function(currQName) {
               return currQName === qname;
            });
            if (alreadyAdded)
            {
               // No action required - the request QName has already been included
            }
            else
            {
               this.facetFields = (this.facetFields !== "") ? this.facetFields + "," + qname : qname;
            }
         }
      },

     
      onApplyFacetFilter: function alfresco_search_AlfSearchList__onApplyFacetFilter(payload) {
         this.alfLog("log", "Filtering on facet", payload, this);
         var filter = lang.getObject("filter", false, payload);
         if (filter === null || filter === undefined)
         {
            this.alfLog("warn", "No filter provided when filtering by facet", payload, this);
         }
         else
         {
            this.facetFilters[filter] = true;
            if (this.useHash === true)
            {
               this.updateFilterHash(filter, "add");
            }
            else
            {
               this.resetResultsList();
               this.loadData();
            }
         }
      },

     
      onRemoveFacetFilter: function alfresco_search_AlfSearchList__onRemoveFacetFilter(payload) {
         this.alfLog("log", "Removing facet filter", payload, this);
         delete this.facetFilters[payload.filter];
         if (this.useHash === true)
         {
            this.updateFilterHash(payload.filter, "remove");
         }
         else
         {
            this.resetResultsList();
            this.loadData();
         }
      },

     
      updateFilterHash: function alfresco_search_AlfSearchList__updateFilterHash(fullFilter, mode) {
         // Get the existing hash and extract the individual facetFilters into an array
         var aHash = hashUtils.getHash(),
             facetFilters = aHash.facetFilters ? aHash.facetFilters : "",
             facetFiltersArr = facetFilters === "" ? [] : facetFilters.split(",");

         // Add or remove the filter from the hash object
         if(mode === "add" && !arrayUtils.arrayContains(facetFiltersArr, fullFilter))
         {
            facetFiltersArr.push(fullFilter);
         }
         else if (mode === "remove" && arrayUtils.arrayContains(facetFiltersArr, fullFilter))
         {
            facetFiltersArr.splice(facetFiltersArr.indexOf(fullFilter), 1);
         }

         // Put the manipulated filters back into the hash object or remove the property if empty
         if(facetFiltersArr.length < 1)
         {
            delete aHash.facetFilters;
         }
         else
         {
            aHash.facetFilters = facetFiltersArr.join();
         }

         // Send the hash value back to navigation
         this.alfPublish("ALF_NAVIGATE_TO_PAGE", {
            url: ioQuery.objectToQuery(aHash),
            type: "HASH"
         }, true);
      },

      onHashChanged: function alfresco_search_AlfSearchList__onHashChanged(payload) {
         this.alfLog("log", "Hash change detected", payload, this);

         // Only update if the payload contains one of the variables we care about
         if(this.doHashVarUpdate(payload, this.updateInstanceValues))
         {
            // If the search term has changed then we want to delete the facet filters as
            // they might not be applicable to the new search results...
            var newSearchTerm = lang.getObject("searchTerm", false, payload);
            if (newSearchTerm !== this.searchTerm)
            {
               this._cleanResettableVars();
            }

            var pageOrSizeHasChanged = !this.useInfiniteScroll && (this.currentPage !== payload.currentPage || this.currentPageSize !== payload.currentPageSize);

            // The facet filters need to be handled directly because they are NOT just passed as
            // a simple string. Create a new object for the filters and then break up the filters
            // based on comma delimition and assign each element as a new key in the filters object
            var filters = lang.getObject("facetFilters", false, payload);
            if (filters !== null && filters !== undefined)
            {
               var ff = payload.facetFilters = {};
               var fArr = filters.split(",");
               array.forEach(fArr, function(filter) {
                  ff[filter] = true;
               }, this);
            }
            else
            {
               this._cleanResettableVars();
            }

            lang.mixin(this, payload);
            this.resetResultsList(pageOrSizeHasChanged);
            this.loadData();
         }
      },

      loadData: function alfresco_search_AlfSearchList__loadData() {
         // jshint maxcomplexity:false,maxstatements:false
         
         // Ensure any no data node is hidden...
         domClass.add(this.noDataNode, "share-hidden");

         var key;
         if (this.requestInProgress)
         {
            // TODO: Inform user that request is in progress?
            this.alfLog("log", "Search request ignored because progress is already in progress");
            this._searchPending = true;
            if (this.currentRequestId)
            {
                this.alfPublish("ALF_STOP_SEARCH_REQUEST", {
                   requestId: this.currentRequestId
                }, true);
            }
         }
         else
         {
            // InfiniteScroll uses pagination under the covers.
            var startIndex = (this.currentPage - 1) * this.currentPageSize;
            if (!this.useInfiniteScroll ||
                !this.currentData ||
                this.currentData.numberFound === -1 || // Indicate no results found on previous search
                this.currentData.numberFound >= startIndex)
            {
               this.alfPublish(this.requestInProgressTopic, {});
               this.showLoadingMessage();

               // When loading a page containing filters to apply as a URL hash parameter, the facetFilters attribute
               // will be a string, but when applied after the page is loaded it will be an object. We need to treat
               // each case differently...
               var filters = "";
               if (ObjectTypeUtils.isString(this.facetFilters))
               {
                  // When facetFilters is a string it will be delimited by commas, the string can be split to get an array
                  // of each filter to apply...
                  var filtersArray = this.facetFilters.split(",");
                  array.forEach(filtersArray, function(filter) {
                     filters = filters + filter.replace(/\.__.u/g, "").replace(/\.__/g, "") + ",";
                  });
               }
               else
               {
                  // When facetFilters is an object, each key will be a filter to be applied...
                  for (key in this.facetFilters)
                  {
                     if (this.facetFilters.hasOwnProperty(key))
                     {
                        filters = filters + key.replace(/\.__.u/g, "").replace(/\.__/g, "") + ",";
                     }
                  }
               }
               // Trim any trailing comma...
               filters = filters.substring(0, filters.length - 1);

               // Make sure the repo param is set appropriately...
               // The repo instance variable trumps everything else...
               var siteId = this.siteId;
               var scope = this.selectedScope;
               if (this.useHash === true)
               {
                  // Unfortunately we made the error of using "scope" on the URL hash and
                  // "selectedScope" as the widget attribute. This means that we have to special
                  // case useHash being set to true to use the appropriate value for the mode being used...
                  siteId = (this.scope === "repo" || this.scope === "all_sites") ? "" : scope;
                  scope = this.scope || scope.toLowerCase();
               }
               
               this.currentRequestId = this.generateUuid();
               var searchPayload = {
                  term: this.searchTerm,
                  facetFields: this.facetFields,
                  filters: filters,
                  sortAscending: this.sortAscending,
                  sortField: this.sortField,
                  site: siteId,
                  rootNode: this.rootNode,
                  repo: scope === "repo",
                  requestId: this.currentRequestId,
                  pageSize: this.currentPageSize,
                  maxResults: 0,
                  startIndex: startIndex,
                  spellcheck: this.spellcheck && !this._suspendSpellCheck
               };

               if (this.query)
               {
                  this.alfCleanFrameworkAttributes(this.query, true);

                  if(typeof this.query === "string")
                  {
                     this.query = JSON.parse(this.query);
                  }

                  for (key in this.query)
                  {
                     if (this.query.hasOwnProperty(key))
                     {
                        searchPayload[key] = this.query[key];
                     }
                  }
               }

               // Add in any additional query parameters...
               if (this.additionalQueryParameters)
               {
                  for (key in this.additionalQueryParameters)
                  {
                     if (this.additionalQueryParameters.hasOwnProperty(key))
                     {
                        searchPayload[key] = this.additionalQueryParameters[key];
                     }
                  }
               }

               // Set a response topic that is scoped to this widget...
               searchPayload.alfResponseTopic = this.pubSubScope + "ALF_RETRIEVE_DOCUMENTS_REQUEST";
               this.alfPublish(topics.SEARCH_REQUEST, searchPayload, true);
            }
            else
            {
               this.alfLog("log", "No more data to to retrieve, cancelling search request", this);
            }
         }
      },

      
      onDataLoadSuccess: function alfresco_search_AlfSearchList__onDataLoadSuccess(payload) {
         /* jshint maxcomplexity:false */
         this.alfLog("log", "Search Results Loaded", payload, this);

         var newData = payload.response;
         this.currentData = newData; // Some code below expects this even if the view is null.

         // Reset suspending the spell check...
         this._suspendSpellCheck = false;

         // Re-render the current view with the new data...
         var view = this.viewMap[this._currentlySelectedView];
         if (view !== null)
         {
            this.showRenderingMessage();
            this.processLoadedData(payload.response || this.currentData);
            if (this.useInfiniteScroll)
            {
               view.augmentData(newData);
               this.currentData = view.getData();
            }
            else
            {
               view.setData(newData);
            }

            view.renderView(this.useInfiniteScroll);
            this.showView(view);
         }

         // TODO: This should probably be in the SearchService... but will leave here for now...
         var facets = lang.getObject("response.facets", false, payload);
         var filters = lang.getObject("requestConfig.query.encodedFilters", false, payload);
         if (facets !== null && facets !== undefined)
         {
            for (var key in facets)
            {
               if (facets.hasOwnProperty(key))
               {
                  var facet = key;
                  if (key[0] === "@")
                  {
                     facet = key.substring(1);
                  }
                  this.alfPublish("ALF_FACET_RESULTS_" + facet, {
                     facetResults: facets[key],
                     activeFilters: filters
                  });
               }
            }
         }

         // Handle any spell checking data included in the results...
         this.handleSpellCheck(payload);

         var resultsCount = this.currentData.numberFound !== -1 ? this.currentData.numberFound : 0;
         if (resultsCount !== null)
         {
            // Publish the number of search results found...
            this.alfPublish("ALF_SEARCH_RESULTS_COUNT", {
               count: resultsCount,
               label: this.message(this.resultsCountMessage, {
                  0: resultsCount
               })
            });
         }

         this.alfPublish("ALF_HIDE_FACETS", {
            hide: this.hideFacets === true || resultsCount === 0
         });

         // This request has finished, allow another one to be triggered.
         this.alfPublish(this.requestFinishedTopic, {});

         // Force a resize of the sidebar container to take the new height of the view into account...
         this.alfPublish("ALF_RESIZE_SIDEBAR", {});
      },

      
      handleSpellCheck: function alfresco_search_AlfSearchList__handleSpellCheck(payload) {
         // Check to see whether or not spell checking was applied...
         var spellcheck = lang.getObject("response.spellcheck", false, payload);
         if (spellcheck !== null && spellcheck !== undefined)
         {
            if (spellcheck.searchedFor !== null && spellcheck.searchedFor !== undefined)
            {
               // Update the local state to reflect what was actually searched for...
               // this.searchTerm = spellcheck.searchedFor;

               // This means that an alternative search term was used...
               this.alfPublish("ALF_SPELL_CHECK_SEARCH_TERM", {
                  searchRequest: spellcheck.searchRequest,
                  searchedFor: spellcheck.searchedFor
               });
            }
            else if (spellcheck.searchSuggestions !== null && spellcheck.searchSuggestions !== undefined)
            {
               // This means that an alternative search was not performed, but suggested searches
               // are available...
               var suggestions = [];
               array.forEach(spellcheck.searchSuggestions, function(suggestion) {
                  suggestions.push({
                     term: suggestion
                  });
               });
               this.alfPublish("ALF_SPELL_CHECK_SEARCH_SUGGESTIONS", {
                  searchRequest: spellcheck.searchRequest,
                  searchSuggestions: suggestions
               });
            }
            else
            {
               // This means that the requested search term was used. No action required.
            }
         }
      },

      
      resetResultsList: function alfresco_search_AlfSearchList__resetResultsList(doNotChangePages) {
         if(!doNotChangePages) {
            this.startIndex = 0;
            this.currentPage = 1;
         }
         this.hideChildren(this.domNode);
         this.clearViews();
      },

     
      _cleanResettableVars: function alfresco_search_AlfSearchList___cleanResettableVars() {
         for (var i = 0; i < this._resetVars.length; i++) {
            this[this._resetVars[i]] = {};
         }
      },

     
      _cleanResettableHashTerms: function alfresco_search_AlfSearchList___cleanResettableHashTerms(currHash) {
         var hasTerm = false;
         for (var term in currHash) {
            if(this._resetVars.indexOf(term) !== -1 && currHash[term] !== null && currHash[term] !== "")
            {
               hasTerm = true;
               delete currHash[term];
            }
         }
         return hasTerm;
      },

      onRequestFinished: function alfresco_search_AlfSearchList___onRequestFinished() {
         this.inherited(arguments);
         if (this._searchPending ===true)
         {
            this._searchPending = false;
            this.loadData();
         }
      }
   });
});