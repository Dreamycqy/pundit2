angular.module('Pundit2.Core')

.constant('CONSOLIDATIONDEFAULTS', {
    // Number of item operations for time
    maxHits: 15,
    // Delay in ms for the refresh of the buffer
    bufferDelay: 35,
    // undefined / true / false
    preventDelay: undefined
})

.service('Consolidation', function($rootScope, $location, $q, $timeout, $window, CONSOLIDATIONDEFAULTS, BaseComponent, EventDispatcher, NameSpace, Config,
    Item, ItemsExchange, XpointersHelper, Status) {

    var cc = new BaseComponent('Consolidation', CONSOLIDATIONDEFAULTS),
        state = {};

    var preventDelay = cc.options.preventDelay ? true : false;

    // Wipes out every item, map, uri etc .. ready to get new items
    cc.wipe = function() {
        state.itemListByType = {};
        state.typeUriMap = {};
        state.uriTypeMap = {};
        state.itemListByURI = {};
        state.fragmentsItemListByParentURI = {};

        for (var a in state.annotators) {
            state.annotators[a].wipe();
        }

        cc.log('Wiped up!');
        EventDispatcher.sendEvent('Consolidation.wipe');
    };
    cc.wipe();

    // These two MUST NOT be wiped, or Consolidation will lose track of annotators
    state.annotableTypes = [];
    state.annotators = {};

    state.isRunningAnnomatic = false;
    $rootScope.$on('annomatic-run', function() {
        state.isRunningAnnomatic = true;
    });
    $rootScope.$on('annomatic-stop', function() {
        state.isRunningAnnomatic = false;
    });

    cc.getItems = function() {
        return state.itemListByURI;
    };

    cc.getFragmentParentList = function() {
        return state.fragmentsItemListByParentURI;
    };

    var addItems = function(items) {
        var deferred = $q.defer(),
            itemsCache = [],
            updateAddTimer,
            startLength = items.length;

        var deferredAddItems = function(promise) {
            $timeout.cancel(updateAddTimer);

            if (itemsCache.length === 0) {
                promise.resolve();
                return;
            }

            var currentHits = 0,
                maxHits = preventDelay ? 1000 : cc.options.maxHits,
                delay = preventDelay ? 0 : cc.options.bufferDelay;

            var doAdd = function()  {
                while (currentHits < maxHits && itemsCache.length !== 0) {
                    var item = itemsCache.pop();

                    var fragmentType = cc.isConsolidable(item);
                    if (fragmentType === false) {
                        cc.log("Not adding, item is not consolidable: " + item.label);
                        continue;
                    } else if (item.uri in state.itemListByURI) {
                        cc.log("Item already present: " + item.label);
                        continue;
                    }

                    // Add or create a new element for the indexes
                    if (fragmentType in state.itemListByType) {
                        state.itemListByType[fragmentType][item.uri] = item;
                        state.typeUriMap[fragmentType].push(item.uri);
                    } else {
                        state.typeUriMap[fragmentType] = [];
                        state.itemListByType[fragmentType] = {};
                        state.itemListByType[fragmentType][item.uri] = item;
                    }

                    // Create or update parent list of fragments
                    if (typeof(item.parentItemXP) !== 'undefined') {
                        if (item.parentItemXP in state.fragmentsItemListByParentURI) {
                            state.fragmentsItemListByParentURI[item.parentItemXP].push(item);
                        } else {
                            state.fragmentsItemListByParentURI[item.parentItemXP] = [item];
                        }
                    }

                    state.itemListByURI[item.uri] = item;
                    state.uriTypeMap[item.uri] = fragmentType;

                    cc.log("Added item: " + item.label + " (" + fragmentType + ")");

                    currentHits++;
                }
                if (!preventDelay) {
                    var percVal = 100 * (startLength - itemsCache.length) / startLength;
                    Status.hitProgress(1, percVal);
                }
                deferredAddItems(promise);
            };

            if (preventDelay) {
                doAdd();
            } else {
                updateAddTimer = $timeout(function() {
                    doAdd();
                }, delay);
            }
        };

        if (!angular.isArray(items)) {
            items = [items];
        }

        itemsCache = items;

        deferredAddItems(deferred);

        return deferred.promise;
    };

    // Will consolidate every possible item found in the ItemsExchange
    cc.consolidateAll = function() {
        var consolidatePromise;

        if (state.isRunningAnnomatic) {
            return;
        }

        var allItems = [],
            pageItems = [],
            myItems = [];
        if (typeof(Config.modules.PageItemsContainer) !== 'undefined') {
            pageItems = ItemsExchange.getItemsByContainer(Config.modules.PageItemsContainer.container);
            allItems = allItems.concat(pageItems);
        }
        if (typeof(Config.modules.MyItems) !== 'undefined') {
            myItems = ItemsExchange.getItemsByContainer(Config.modules.MyItems.container);
            allItems = allItems.concat(myItems);
        }

        Status.resetProgress();
        EventDispatcher.sendEvent('Consolidation.StartConsolidate');
        EventDispatcher.sendEvent('Client.dispatchDocumentEvent', {
            event: 'Pundit2.consolidation',
            data: true
        });

        cc.log('Consolidating ALL items');
        
        consolidatePromise = cc.consolidate(allItems);
        consolidatePromise.then(function() {
            if (pageItems.length === 0) {
                // There are no annotations with valid page items
                Status.hitProgress(3, 100);
            }
            EventDispatcher.sendEvent('Consolidation.consolidateAll');
            EventDispatcher.sendEvent('Client.dispatchDocumentEvent', {
                event: 'Pundit2.consolidation',
                data: false
            });
        });
    };

    // TODO: pass an element and consolidate just that element? or a named content?
    // an image or something?
    cc.consolidate = function(items) {
        var deferred = $q.defer(),
            promises = [],
            currentPromise;

        if (!angular.isArray(items)) {
            cc.err('Items not valid: malformed array', items);
            return;
        }

        var addItemsPromise;

        cc.log('Will try to consolidate ' + items.length + ' items');
        cc.wipe();
        addItemsPromise = addItems(items);

        addItemsPromise.then(function() {
            for (var a in state.annotators) {
                if (a in state.itemListByType) {
                    currentPromise = state.annotators[a].consolidate(state.itemListByType[a]);
                    promises.push(currentPromise);
                    cc.log('Consolidating annotator type ' + a + ', ' + state.typeUriMap[a].length + ' items');
                } else {
                    cc.log('Skipping annotator type ' + a + ': no item to consolidate.');
                }
            }

            $q.all(promises).then(function() {
                EventDispatcher.sendEvent('Consolidation.consolidate');
                deferred.resolve();
            });
        });

        return deferred.promise;
        // TODO: ImageConsolidator ? (polygons, areas, whatever: on images?)
        // TODO: More consolidator types? Video? Maps? ..
    };

    // Adds a new annotator to the Consolidation service
    cc.addAnnotator = function(annotator) {
        cc.log("Adding annotable type ", annotator.label);
        state.annotableTypes.push(annotator.label);
        state.annotators[annotator.label] = annotator;
    };

    // Calls every annotator and ask them if the given item is a
    // valid fragment. If it is, returns the fragment type.
    // This method must be implemented by every Annotator
    cc.isConsolidable = function(item) {
        for (var a in state.annotators) {
            if (state.annotators[a].isConsolidable(item)) {
                return a;
            }
        }
        return false;
    };

    cc.isConsolidated = function(item) {
        if (item instanceof Item) {
            return item.uri in state.itemListByURI;
        }
        return false;
    };

    // Gets the available targets or resources on the current page. They will most likely
    // be passed to the server looking for annotations.
    cc.getAvailableTargets = function(onlyNamedContents) {
        var ret = [],
            nc = XpointersHelper.options.namedContentClasses;

        // The page URL is for xpointers out of named contents
        if (typeof(onlyNamedContents) === "undefined" || onlyNamedContents !== true) {
            ret.push(decodeURIComponent($location.absUrl()));
        }

        // Look for named content: an element with a class listed in .namedContentClasses
        // then get its about attribute
        for (var l = nc.length; l--;) {
            var className = nc[l],
                nodes = angular.element('.' + className);

            for (var n = nodes.length; n--;) {
                // If it doesnt have the attribute, dont add it
                var uri = angular.element(nodes[n]).attr('about');
                // TODO: better checks of what we find inside about attributes? A lil regexp
                // or we let do this at the server?
                if (uri) {
                    ret.push(uri);
                }
            }
        }

        return ret;
    };

    if (cc.options.preventDelay === undefined) {
        EventDispatcher.addListener('AnnotationsCommunication.PreventDelay', function(e) {
            preventDelay = e.args;
        });
    }

    $window.punditConolidationWipe = cc.wipe;

    return cc;
});