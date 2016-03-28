angular.module('Pundit2.Core')

.constant('CONSOLIDATIONDEFAULTS', {
    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#Consolidation
     *
     * @description
     * `object`
     *
     * Configuration object for Consolidation service.
     */

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#Consolidation.maxHits
     *
     * @description
     * `number`
     *
     * Number of item operations for time
     *
     * Default value:
     * <pre> maxHits: 15 </pre>
     */
    maxHits: 15,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#Consolidation.bufferDelay
     *
     * @description
     * `number`
     *
     * Delay in ms for the refresh of the buffer
     *
     * Default value:
     * <pre> bufferDelay: 35 </pre>
     */
    bufferDelay: 35,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#Consolidation.bufferDelay
     *
     * @description
     * `boolean`
     *
     * undefined / true / false
     *
     * Default value:
     * <pre> bufferDelay: undefined </pre>
     */
    preventDelay: undefined
})

.service('Consolidation', function($rootScope, $location, $q, $timeout, $window, CONSOLIDATIONDEFAULTS, BaseComponent, EventDispatcher, NameSpace, Config,
    Item, ItemsExchange, XpointersHelper, Status) {

    var consolidation = new BaseComponent('Consolidation', CONSOLIDATIONDEFAULTS),
        state = {};

    var preventDelay = consolidation.options.preventDelay ? true : false,
        updateAddTimer;

    var consolidationStack = [],
        requestCount = [];

    state.isRunningAnnomatic = false;

    // These two MUST NOT be wiped, or Consolidation will lose track of annotators
    state.annotableTypes = [];
    state.annotators = {};

    var addItems = function(items) {
        var deferred = $q.defer(),
            itemsCache = [],
            startLength = items.length;

        var deferredAddItems = function(promise) {
            $timeout.cancel(updateAddTimer);

            if (itemsCache.length === 0) {
                promise.resolve();
                return;
            }

            var currentHits = 0,
                maxHits = preventDelay ? 1000 : consolidation.options.maxHits,
                delay = preventDelay ? 0 : consolidation.options.bufferDelay;

            var doAdd = function()  {
                while (currentHits < maxHits && itemsCache.length !== 0) {
                    var item = itemsCache.pop();

                    var fragmentType = consolidation.isConsolidable(item);
                    if (fragmentType === false) {
                        consolidation.log('Not adding, item is not consolidable: ' + item.label);
                        continue;
                    } else if (item.uri in state.itemListByURI) {
                        consolidation.log('Item already present: ' + item.label);
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

                    consolidation.log('Added item: ' + item.label + ' (' + fragmentType + ')');

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

    // TODO: why is empty the annomatic container in itemsExchange (also with delaytimer) when
    // we use deferred version of addItems?!
    var addAnnomaticItems = function(items) {
        if (!angular.isArray(items)) {
            items = [items];
        }

        for (var l = items.length; l--;) {
            var item = items[l];

            var fragmentType = consolidation.isConsolidable(item);
            if (fragmentType === false) {
                consolidation.log('Not adding, item is not consolidable: ' + item.label);
                continue;
            } else if (item.uri in state.itemListByURI) {
                consolidation.log('Item already present: ' + item.label);
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

            consolidation.log('Added item: ' + item.label + ' (' + fragmentType + ')');
        }
    };

    // Wipes out every item, map, uri etc .. ready to get new items
    consolidation.wipe = function() {
        state.itemListByType = {};
        state.typeUriMap = {};
        state.uriTypeMap = {};
        state.itemListByURI = {};
        state.fragmentsItemListByParentURI = {};

        for (var a in state.annotators) {
            state.annotators[a].wipe();
        }

        consolidation.log('Wiped up!');
        EventDispatcher.sendEvent('Consolidation.wipe');
    };
    consolidation.wipe();

    consolidation.wipeItems = function(items)  {
        var currentItem, currentType;
        for (var i in items) {
            currentItem = items[i];
            currentType = state.uriTypeMap[currentItem.uri];
            if (currentType in state.annotators) {
                state.annotators[currentType].wipeItem(currentItem);
            }
        }
    };

    consolidation.getItems = function() {
        return state.itemListByURI;
    };

    consolidation.getFragmentParentList = function() {
        return state.fragmentsItemListByParentURI;
    };

    consolidation.updateItemListAndMap = function(item, fragmentType) {
        if (typeof item === 'undefined') {
            return;
        }

        state.itemListByURI[item.uri] = item;
        state.uriTypeMap[item.uri] = fragmentType;
        consolidation.log('Added item: ' + item.label + ' (' + fragmentType + ')');
    };

    // TODO: pass an element and consolidate just that element? or a named content?
    // an image or something?
    consolidation.consolidate = function(items) {
        var deferred = $q.defer(),
            promises = [],
            currentPromise;

        if (!angular.isArray(items)) {
            consolidation.err('Items not valid: malformed array', items);
            return;
        }

        var addItemsPromise;

        consolidation.log('Will try to consolidate ' + items.length + ' items');
        consolidation.wipe();
        addItemsPromise = state.isRunningAnnomatic ? addAnnomaticItems(items) : addItems(items);

        consolidationStack.push(function() {
            for (var a in state.annotators) {
                if (a in state.itemListByType) {
                    currentPromise = state.annotators[a].consolidate(state.itemListByType[a]);
                    promises.push(currentPromise);
                    consolidation.log('Consolidating annotator type ' + a + ', ' + state.typeUriMap[a].length + ' items');
                } else {
                    consolidation.log('Skipping annotator type ' + a + ': no item to consolidate.');
                }
            }

            $q.all(promises).then(function() {
                EventDispatcher.sendEvent('Consolidation.consolidate');
                deferred.resolve();
            });
        });

        $q.all([addItemsPromise]).then(function() {
            var lastCall;
            if (consolidationStack.length > 1) {
                consolidationStack.shift();
                return;
            }
            lastCall = consolidationStack.pop();
            lastCall();
        });

        return deferred.promise;
        // TODO: ImageConsolidator ? (polygons, areas, whatever: on images?)
        // TODO: More consolidator types? Video? Maps? ..
    };

    // Will consolidate every possible item found in the ItemsExchange
    consolidation.consolidateAll = function() {
        var consolidatePromise;

        requestCount--;
        if (requestCount > 0) {
            return;
        }
        requestCount = 0;

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

        EventDispatcher.sendEvent('Consolidation.startConsolidate');
        EventDispatcher.sendEvent('Pundit.dispatchDocumentEvent', {
            event: 'Pundit.consolidation',
            data: true
        });

        consolidation.log('Consolidating ALL items');

        consolidatePromise = consolidation.consolidate(allItems);
        consolidatePromise.then(function() {
            if (pageItems.length === 0) {
                // There are no annotations with valid page items
                Status.hitProgress(3, 100);
            }
            EventDispatcher.sendEvent('Consolidation.consolidateAll');
            EventDispatcher.sendEvent('Pundit.dispatchDocumentEvent', {
                event: 'Pundit.consolidation',
                data: false
            });
        });
    };

    consolidation.requestConsolidateAll = function() {
        requestCount++;
        EventDispatcher.sendEvent('Consolidation.newRequest');
        Status.resetProgress();
        $timeout.cancel(updateAddTimer);
        consolidation.log('ConsolidateAll request');
    };

    consolidation.rejectConsolidateAll = function() {
        if (requestCount <= 1) {
            requestCount = 1;
            consolidation.consolidateAll();
        } else {
            requestCount--;
        }
        consolidation.log('ConsolidateAll reject');
    };

    consolidation.getConsolidationRequestNumber = function() {
        return requestCount;
    };

    // Adds a new annotator to the Consolidation service
    consolidation.addAnnotator = function(annotator) {
        consolidation.log('Adding annotable type ', annotator.label);
        state.annotableTypes.push(annotator.label);
        state.annotators[annotator.label] = annotator;
    };

    // Calls every annotator and ask them if the given item is a
    // valid fragment. If it is, returns the fragment type.
    // This method must be implemented by every Annotator
    consolidation.isConsolidable = function(item) {
        for (var a in state.annotators) {
            if (state.annotators[a].isConsolidable(item)) {
                return a;
            }
        }
        return false;
    };

    consolidation.isConsolidated = function(item) {
        if (item instanceof Item) {
            return item.uri in state.itemListByURI;
        }
        return false;
    };

    // Gets the available targets or resources on the current page. They will most likely
    // be passed to the server looking for annotations.
    // TODO hujiawei 得到页面中所有可以用来分析推荐标注的文本片段的节点，返回这些节点的about属性
    // TODO hujiawei 这个方法除了在在AnnotationsCommunication中被调用了一次之外，另一处调用就是AnnomaticPanel中，所以可以放心复制这个方法，自定义逻辑
    consolidation.getAvailableTargets = function(onlyNamedContents) {
        var ret = [], //uri的集合，css class类型在下面集合中并且包含about属性的html节点
            nc = XpointersHelper.options.namedContentClasses;//Annotators目录下，所有可行的css class类型

        // The page URL is for xpointers out of named contents
        if (typeof(onlyNamedContents) === 'undefined' || onlyNamedContents !== true) {
            var safeUrl = XpointersHelper.getSafePageContext();
            ret.push(safeUrl);
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

    //TODO hujiawei 上面的getAvailableTargets的副本，自定义了其中的逻辑，供AnnomaticPanel调用 -> 甚至可以没有这个方法
    // consolidation.getAvailableAnnomaticTargets = function() {
    //     var ret = [], //uri的集合，css class类型在下面集合中并且包含about属性的html节点
    //         nc = ['author'];//XpointersHelper.options.namedContentClasses -> Annotators目录下，所有可行的css class类型
    //         //TODO hujiawei 目前暂时只处理作者信息
    //
    //     // The page URL is for xpointers out of named contents
    //     if (typeof(onlyNamedContents) === 'undefined' || onlyNamedContents !== true) {
    //         var safeUrl = XpointersHelper.getSafePageContext();
    //         ret.push(safeUrl);
    //     }
    //
    //     // Look for named content: an element with a class listed in .namedContentClasses
    //     // then get its about attribute
    //     for (var l = nc.length; l--;) {
    //         var className = nc[l],
    //             nodes = angular.element('.' + className);
    //
    //         for (var n = nodes.length; n--;) {
    //             // If it doesnt have the attribute, dont add it
    //             var uri = angular.element(nodes[n]).attr('about');
    //             // TODO: better checks of what we find inside about attributes? A lil regexp
    //             // or we let do this at the server?
    //             if (uri) {
    //                 ret.push(uri);
    //             }
    //         }
    //     }
    //
    //     return ret;
    // };

    if (consolidation.options.preventDelay === undefined) {
        EventDispatcher.addListener('Pundit.preventDelay', function(e) {
            preventDelay = e.args;
        });
    }

    $rootScope.$on('annomatic-run', function() {
        state.isRunningAnnomatic = true;
    });
    $rootScope.$on('annomatic-stop', function() {
        state.isRunningAnnomatic = false;
    });

    // TODO: we need it?
    $window.punditConolidationWipe = consolidation.wipe;

    return consolidation;
});
