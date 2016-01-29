angular.module("Pundit2.CoreItemsContainer")

.constant('COREITEMSDEFAULTS', {

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#MyItems
     *
     * @description
     * `object`
     *
     * Configuration object for MyItems service. This service is used to get the my items
     * from server.
     */

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#MyItems.apiPreferencesKey
     *
     * @description
     * `string`
     *
     * My items pundit server API.
     *
     * Default value:
     * <pre> apiPreferencesKey: 'favorites' </pre>
     */
    apiPreferencesKey: 'favorites',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#MyItems.container
     *
     * @description
     * `string`
     *
     * Name of the container used to store the my items in the itemsExchange.
     *
     * Default value:
     * <pre> container: 'myItems' </pre>
     */
    container: 'coreItems',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#MyItems.debug
     *
     * @description
     * `boolean`
     *
     * Active debug log.
     *
     * Default value:
     * <pre> debug: false </pre>
     */
    debug: false,

    //hujiawei 添加url和searchTerm
    /**
    * url for core items
    */
    url: 'http://localhost:9091/apibztask/vocabulary/concept',

    /**
    * search term
    */
    // searchTerm: ''

})

.service("CoreItems", function(COREITEMSDEFAULTS, BaseComponent, EventDispatcher, NameSpace, Item, ItemsExchange,
    ContextualMenu, MyPundit, Config, Consolidation, TextFragmentAnnotator,
    $http, $rootScope, $q) {

    var coreItems = new BaseComponent("CoreItems", COREITEMSDEFAULTS);

    var opInProgress = false;

    var setLoading = function(state) {
        EventDispatcher.sendEvent('CoreItems.loading', state);
    };

    var preventDelay = function() {
        EventDispatcher.sendEvent('Pundit.preventDelay', true);
    };

    //TODO hujiawei 核心概念的搜索功能
    // var initContextualMenu = function() {
    //
    //     // TODO: sanity checks on Config.modules.* ? Are they active? Think so??
    //     var cMenuTypes = [
    //         Config.modules.TextFragmentHandler.cMenuType,
    //         Config.modules.PageItemsContainer.cMenuType,
    //         Config.modules.MyItemsContainer.cMenuType,
    //         Config.modules.CoreItemsContainer.cMenuType,
    //         Config.modules.TextFragmentAnnotator.cMenuType,
    //         Config.modules.ImageHandler.cMenuType,
    //         Config.modules.SelectorsManager.cMenuType
    //     ];
    //
    //     ContextualMenu.addDivider({
    //         priority: 100,
    //         type: cMenuTypes
    //     });
    //
    //     ContextualMenu.addAction({
    //         name: 'searchItem',
    //         type: cMenuTypes,
    //         label: "搜索该文本",//
    //         priority: 101,
    //         showIf: function(item) {
    //             return MyPundit.isUserLogged();
    //         },
    //         action: function(item) {
    //             coreItems.log(item);
    //             if (typeof(item) !== 'undefined') {//更新搜索词
    //                 coreItems.options.searchTerm = item.label;
    //             }
    //             return true;
    //         }
    //     });
    // }; // initContextualMenu()
    //
    // // When all modules have been initialized, services are up, Config are setup etc..
    // EventDispatcher.addListener('Client.boot', function() {
    //     initContextualMenu();
    // });

    // The very first time that we get my items from pundit server we might obtain pundit1 items:
    // - value is pundit2 uri property
    // - type property is not necessary (in pundit2 we use this property name with other semantic)
    // - rdfData is not necessary
    // - favorite is not necessary
    //
    // in pundit2 item:
    // - uri property replace value property
    // - type property replace rdftype property
    //
    // itemsExchange store all application items
    // "new Item()" adds the item to itemsExchange "default" container
    // then we add it to "coreItems" container too

    //hujiawei 核心概念只需要获取
    coreItems.getAllItems = function() {
        var item,
            promise = $q.defer();

        if (opInProgress || !MyPundit.isUserLogged()) {
            coreItems.log('User not logged');
            return;
        }
        opInProgress = true;
        setLoading(true);

        $http({
            headers: {
                'Accept': 'application/json'
            },
            method: 'GET',
            url: coreItems.options.url, /* hujiawei 这里需要修改为实际的访问地址 */
            withCredentials: true
        }).success(function(data) {
            var num = 0;
            setLoading(false);

            if (typeof(data) === 'undefined') {
                opInProgress = false;
                promise.resolve();
                coreItems.log('Undefined Server response');
                return;
            }

            if (typeof(data.redirectTo) !== 'undefined') {
                opInProgress = false;
                promise.resolve();
                coreItems.log('Get all my items on server produce a redirect response to: ', data);
                return;
            }

            // for each item
            for (var i in data.value) {
                num++;

                // TODO is pundit1 object? (need to add a dedicated flag?)
                if (data.value[i].rdftype) {
                    // delete property
                    delete data.value[i].type;
                    delete data.value[i].rdfData;
                    delete data.value[i].favorite;
                    // rename "rdftype" property in "type"
                    data.value[i].type = data.value[i].rdftype;
                    delete data.value[i].rdftype;
                    // rename "value" property in "uri"
                    data.value[i].uri = data.value[i].value;
                    delete data.value[i].value;
                }

                // create new item (now is a pundit2 item) (implicit add to default container)
                item = new Item(data.value[i].uri, data.value[i]);

                // add to coreItems container
                ItemsExchange.addItemToContainer(item, coreItems.options.container);
            }

            opInProgress = false;
            promise.resolve();
            coreItems.log('Retrieved my items from the server: ' + num + ' items');

        }).error(function(msg) {
            setLoading(false);
            opInProgress = false;
            promise.reject();
            coreItems.log('Http error while retrieving my items from the server: ', msg);
        });

        return promise.promise;
    };

    // coreItems.deleteAllItems = function() {
    //     var currentTime = new Date(),
    //         promise = $q.defer();
    //
    //     if (opInProgress || !MyPundit.isUserLogged()) {
    //         coreItems.log('User not logged');
    //         return;
    //     }
    //     opInProgress = true;
    //
    //     setLoading(true);
    //     Consolidation.requestConsolidateAll();
    //
    //     // remove all my item on pundit server
    //     // setting it to []
    //     $http({
    //         headers: {
    //             "Content-Type": "application/json;charset=UTF-8;"
    //         },
    //         method: 'POST',
    //         url: NameSpace.get('asPref', {
    //             key: coreItems.options.apiPreferencesKey
    //         }),
    //         withCredentials: true,
    //         data: angular.toJson({
    //             value: [],
    //             created: currentTime.getTime()
    //         })
    //     }).success(function(data) {
    //
    //         setLoading(false);
    //
    //         if (typeof(data.redirectTo) !== 'undefined') {
    //             opInProgress = false;
    //             promise.resolve();
    //             coreItems.log('Deleted all my items on server produce a redirect response to: ', data);
    //             return;
    //         }
    //         // remove all my items on application
    //         // controller watch now update the view
    //         ItemsExchange.wipeContainer(coreItems.options.container);
    //         opInProgress = false;
    //         promise.resolve();
    //         Consolidation.consolidateAll();
    //
    //         coreItems.log('Deleted all my items on server', data);
    //     }).error(function(msg) {
    //         setLoading(false);
    //         Consolidation.rejectConsolidateAll();
    //         opInProgress = false;
    //         promise.reject();
    //         coreItems.err('Cant delete my items on server: ', msg);
    //     });
    //
    //     preventDelay();
    //
    //     return promise.promise;
    // };
    //
    // coreItems.deleteItem = function(value) {
    //
    //     if (opInProgress || !MyPundit.isUserLogged()) {
    //         coreItems.log('User not logged');
    //         return;
    //     }
    //     opInProgress = true;
    //
    //     // get all my items (inside app)
    //     var currentTime = new Date(),
    //         items = ItemsExchange.getItemsByContainer(coreItems.options.container),
    //         index = items.indexOf(value),
    //         copiedItems = angular.copy(items),
    //         promise = $q.defer();
    //
    //     // remove item from the copied array
    //     if (index > -1) {
    //         copiedItems.splice(index, 1);
    //     }
    //
    //     setLoading(true);
    //
    //     // update to server the new my items
    //     // the new my items format is different from pundit1 item format
    //     // this break pundit1 compatibility
    //     $http({
    //         headers: {
    //             "Content-Type": "application/json;charset=UTF-8;"
    //         },
    //         method: 'POST',
    //         url: NameSpace.get('asPref', {
    //             key: coreItems.options.apiPreferencesKey
    //         }),
    //         withCredentials: true,
    //         data: angular.toJson({
    //             value: copiedItems,
    //             created: currentTime.getTime()
    //         })
    //     }).success(function(data) {
    //
    //         if (typeof(data.redirectTo) !== 'undefined') {
    //             opInProgress = false;
    //             setLoading(false);
    //             promise.resolve();
    //             coreItems.log('Deleted single my item on server produce a redirect response to: ', data);
    //             return;
    //         }
    //
    //         // remove value from my items
    //         // controller watch now update the view
    //         ItemsExchange.removeItemFromContainer(value, coreItems.options.container);
    //         promise.resolve();
    //         opInProgress = false;
    //         setLoading(false);
    //
    //         coreItems.log('Deleted from my item: ' + value.label);
    //
    //     }).error(function(msg) {
    //         opInProgress = false;
    //         Consolidation.rejectConsolidateAll();
    //         setLoading(false);
    //         promise.reject();
    //         coreItems.err('Cant delete a my item on the server: ', msg);
    //     });
    //
    //     preventDelay();
    //
    //     return promise.promise;
    // };
    //
    // coreItems.deleteItemAndConsolidate = function(item) {
    //     Consolidation.requestConsolidateAll();
    //     coreItems.deleteItem(item).then(function() {
    //         preventDelay();
    //         Consolidation.consolidateAll();
    //     });
    // };

    coreItems.isItemPresent = function(item) {
        var items = ItemsExchange.getItemsByContainer(coreItems.options.container),
            index = items.indexOf(item);
        return index !== -1;
    };

    // // add one item to my items on pundit server
    // coreItems.addItem = function(value) {
    //
    //     // TODO gestire il caso in cui l'utente non era loggato (!)
    //     if (opInProgress || !MyPundit.isUserLogged()) {
    //         coreItems.log('User not logged');
    //         return;
    //     }
    //     opInProgress = true;
    //
    //     var currentTime = new Date(),
    //         // get all my items and make a copy
    //         items = angular.extend([], ItemsExchange.getItemsByContainer(coreItems.options.container)),
    //         promise = $q.defer();
    //
    //     // add new item to the copied array
    //     items.push(value);
    //
    //     setLoading(true);
    //
    //     // update to server the new my items
    //     // the new my items format is different from pundit1 item format
    //     // this break punti1 compatibility
    //     $http({
    //         headers: {
    //             "Content-Type": "application/json;charset=UTF-8;"
    //         },
    //         method: 'POST',
    //         url: NameSpace.get('asPref', {
    //             key: coreItems.options.apiPreferencesKey
    //         }),
    //         withCredentials: true,
    //         data: angular.toJson({
    //             value: items,
    //             created: currentTime.getTime()
    //         })
    //     }).success(function(data) {
    //
    //         if (typeof(data.redirectTo) !== 'undefined') {
    //             opInProgress = false;
    //             setLoading(false);
    //             promise.resolve();
    //             coreItems.log('Add single item to my items on server produce a redirect response to: ', data);
    //             return;
    //         }
    //
    //         // add value to my items
    //         // controller watch now update the view
    //         ItemsExchange.addItemToContainer(value, coreItems.options.container);
    //         opInProgress = false;
    //         setLoading(false);
    //         promise.resolve();
    //
    //         coreItems.log('Added item to my items: ' + value.label);
    //
    //     }).error(function(msg) {
    //         opInProgress = false;
    //         setLoading(false);
    //         promise.reject();
    //         Consolidation.rejectConsolidateAll();
    //         coreItems.err('Cant add item to my items on the server: ', msg);
    //     });
    //
    //     preventDelay();
    //
    //     return promise.promise;
    // };
    //
    // coreItems.addItemAndConsolidate = function(item) {
    //     Consolidation.requestConsolidateAll();
    //     coreItems.addItem(item).then(function() {
    //         preventDelay();
    //         Consolidation.consolidateAll();
    //     });
    // };

    return coreItems;

});
