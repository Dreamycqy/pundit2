angular.module('Pundit2.ResourcePanel')

.controller('ResourcePanelCtrl', function($rootScope, $scope, $timeout, $filter, $window,
    Client, Config, ItemsExchange, MyItems, MyPundit, PageItemsContainer, Preview,
    ResourcePanel, SelectorsManager, KorboCommunicationService, EventDispatcher, Analytics, PageHandler, TripleComposer, Keyboard) {

    var actualContainer;
    var selectors = SelectorsManager.getActiveSelectors();
    var selectorsLabels = [];
    var searchTimer;
    var resetHandler;

    var isTimerRunning = false;

    $scope.label = '';

    $scope.moduleName = 'Pundit2';
    $scope.subjectIcon = ResourcePanel.options.inputIconSearch;
    $scope.itemSelected = null;
    $scope.isUseActive = false;
    $scope.contentTabs.activeTab = 0;

    // Properties and method to customize template (Pundit/KorboEE)
    $scope.showFilteredResults = true;
    $scope.showHeader = true;
    $scope.showVerticalTabFooterContent = true;
    $scope.showContentMessage1 = false;
    $scope.showContentMessage4 = false;
    $scope.showContentMessage5 = true;
    $scope.useCustomTemplate = false;

    for (var i in selectors) {
        selectorsLabels.push(selectors[i].config.label);
    }

    // $scope.canShowPaneList = function(title) {
    //     return title !== 'My Items' || (title === 'My Items' && $scope.userLoggedIn);
    // };

    // build tabs by reading active selectors inside selectors manager
    // TODO LOD management for subject
    if ($scope.type === 'obj') {
        for (var j = 0; j < selectors.length; j++) {
            $scope.contentTabs.push({
                title: selectors[j].config.label,
                template: 'src/Lists/itemList.tmpl.html',
                itemsContainer: selectors[j].config.container,
                items: [],
                module: 'Pundit2',
                isStarted: false,
                selector: selectors[j]
            });
        }
    }

    // TODO: global window resize management
    var onWindowResize = function() {
        ResourcePanel.updatePosition();
    };
    angular.element($window).resize(onWindowResize);

    // TODO: really useful?
    var removeSpace = function(str) {
        return str.replace(/ /g, '');
    };

    var resetSelection = function() {
        $scope.isUseActive = false;
        $scope.itemSelected = null;
    };
    // {{getMessageText(contentTabs[$index].title, contentTabs[$index].items, $parent.tabItemsFiltered[$index], label, showContentMessage5, pane.isLoading)}}
    // ng-if="contentTabs[$index].title != 'My Items' && showContentMessage6 && label.length > 2 && pane.isLoading">

    $scope.getMessageText = function(tabTitle, tabItems, filteredItems, searchLabel, showIt, isLoading) {
        if (showIt === false) {
            return '';
        }

        var myItemsNotLogged = tabTitle === 'My Items' && MyPundit.isUserLogged() === false,
            userNotLoggedMessage = 'My Items are only available to logged users. Please log in to use this section or select a fragment of text in the page.';//TODO hujiawei

        searchLabel = typeof(searchLabel) !== 'undefined' ? searchLabel : '';
        if (searchLabel.length > 2 &&
            isLoading ||
            isTimerRunning) {
            if (myItemsNotLogged) {
                return userNotLoggedMessage;
            }
            return filteredItems.length > 0 ? '' : 'Loading ...';
        }
        if (selectorsLabels.indexOf(tabTitle) !== -1 &&
            searchLabel.length <= 2) {
            return 'Search entities in ' + tabTitle + ' using the input filed above. You can use the selected entity by clicking the "Use" button below.';
        }

        if (myItemsNotLogged) {
            return userNotLoggedMessage;
        }

        tabItems = typeof(tabItems) !== 'undefined' ? tabItems : [];
        if (tabTitle === 'My Items' &&
            tabItems.length === 0) {
            return 'It seems you haven\'t any item stored here yet! Please add some items to My Items to use this section.';//TODO hujiawei
        }
        if (filteredItems.length === 0 &&
            searchLabel.length > 2 &&
            !isLoading) {
            return 'Oops, try again. It looks like your search didn\'t return anything.';
        }
    };

    // getter function used inside template to order items
    // return the items property value used to order
    $scope.getOrderProperty = function(item) {
        return removeSpace(item.label);
    };

    $scope.isSelected = function(item) {
        if ($scope.itemSelected !== null && $scope.itemSelected.uri === item.uri) {
            return true;
        } else {
            return false;
        }
    };

    var lastSelected;
    var keyHandlers = {};
    keyHandlers.enter = Keyboard.registerHandler('ResourcePanelController', {
        scope: $scope,
        keyCode: 13,
        ignoreOnInput: false,
        stopPropagation: true,
        priority: 10,
    }, function( /*event, eventKeyConfig*/ ) {
        if (typeof lastSelected !== 'undefined') {
            $scope.save(lastSelected.item);
        }
    });

    keyHandlers.arrowUp = Keyboard.registerHandler('ResourcePanelController', {
        scope: $scope,
        keyCode: 38,
        ignoreOnInput: true,
        stopPropagation: true,
        priority: 10,
    }, function( /*event, eventKeyConfig*/ ) {
        arrowKeyPressed(38);
    });

    keyHandlers.arrowDown = Keyboard.registerHandler('ResourcePanelController', {
        scope: $scope,
        keyCode: 40,
        ignoreOnInput: true,
        stopPropagation: true,
        priority: 10,
    }, function( /*event, eventKeyConfig*/ ) {
        arrowKeyPressed(40);
    });

    var listContainer;
    var arrowKeyPressed = function(code) {
        if (typeof lastSelected === 'undefined') {
            return;
        }

        var elem = angular.element(lastSelected.elementItem);
        var li = elem.parent();
        var ul = li.parent();
        var other;
        switch (code) {
            case 38:
                // Up.
                other = li.prev();
                break;
            case 40:
                // Down.
                other = li.next();
                break;
        }

        if (typeof other !== 'undefined' && other.length > 0) {
            other.find('item').trigger('click');
            Preview.setLock(true);
            if (typeof listContainer === 'undefined') {
                listContainer = li.closest('.pnd-vertical-tab-list-content');
            }

            if ((other.offset().top - ul.offset().top) < listContainer.scrollTop()) {
                listContainer.scrollTop(other.offset().top - ul.offset().top);
            } else if (
                (other.offset().top + other.height() - ul.offset().top > listContainer.height() - listContainer.scrollTop())
            ) {
                //console.log("scrolling to: " + (other.offset().top + other.height() - ul.offset().top - listContainer.height()));
                listContainer.scrollTop((other.offset().top + other.height() - ul.offset().top - listContainer.height()));
            }
        }
    };

    $scope.select = function(item, $event) {
        // after triggering click, lastSelect object will be updated with new selected item.
        Preview.setLock(false);
        Preview.showDashboardPreview(item);
        Preview.setItemDashboardSticky(item);
        EventDispatcher.sendEvent('Pundit.changeSelection');
        lastSelected = undefined;
        if (typeof $event !== 'undefined') {
            lastSelected = {
                item: item,
                elementItem: $event.currentTarget
            };
        }
        $scope.isUseActive = true;
        $scope.itemSelected = item;
    };

    $scope.showUseAndCopyButton = function() {
        var currTab = $scope.contentTabs[$scope.contentTabs.activeTab].title;
        var res = false;
        //if(Config.korbo.active && (currTab !== 'KorboBasket' && currTab !== 'Page Items' && currTab !== 'My Items')){
        if (Config.korbo.active && currTab === 'Freebase') {
            res = true;
        }
        if (typeof ResourcePanel.overrideFooterExtraButtons !== 'undefined' &&
            typeof ResourcePanel.overrideFooterExtraButtons.showUseAndCopy !== 'undefined') {
            res &= ResourcePanel.overrideFooterExtraButtons.showUseAndCopy;
        }
        return res;
    };

    $scope.showNewButton = function() {
        var res = false;
        if (typeof(Config.korbo) !== 'undefined' && Config.korbo.active && $scope.type !== 'pr') {
            res = true;
        }
        if (typeof ResourcePanel.overrideFooterExtraButtons !== 'undefined' &&
            typeof ResourcePanel.overrideFooterExtraButtons.showNewButton !== 'undefined') {
            res &= ResourcePanel.overrideFooterExtraButtons.showNewButton;
        }
        return res;
    };

    $scope.createNew = function() {
        var name = $window[Config.korbo.confName].globalObjectName;
        $window[name].callOpenNew();
    };

    $scope.useAndCopy = function(elem) {
        var name = $window[Config.korbo.confName].globalObjectName;
        $window[name].callCopyAndUse(elem);
    };

    $scope.showCopyInEditorButton = function() {
        var currTab = $scope.contentTabs[$scope.contentTabs.activeTab].title;
        //if(Config.korbo.active && (currTab !== 'KorboBasket' && currTab !== 'Page Items' && currTab !== 'My Items')){
        var res = false;
        if (Config.korbo.active && currTab === 'Freebase') {
            res = true;
        }
        if (typeof ResourcePanel.overrideFooterExtraButtons !== 'undefined' &&
            typeof ResourcePanel.overrideFooterExtraButtons.showCopyInEditorButton !== 'undefined') {
            res &= ResourcePanel.overrideFooterExtraButtons.showCopyInEditorButton;
        }
        return res;
    };

    // Displays usePageButton.
    $scope.showUseFullPageButton = true;
    var initUseFullPageButton = function() {
        var res = true;

        var item = PageHandler.getPageItem();
        switch ($scope.type) {
            case 'sub':
                res = TripleComposer.canAddItemAsSubject(item);
                break;
            case 'pr':
                res = false;
                break;
            case 'obj':
                res = TripleComposer.canAddItemAsObject(item);
                break;
        }

        if (typeof ResourcePanel.overrideFooterExtraButtons !== 'undefined' &&
            typeof ResourcePanel.overrideFooterExtraButtons.showUseFullPageButton !== 'undefined') {
            res &= ResourcePanel.overrideFooterExtraButtons.showUseFullPageButton;
        }

        $scope.showUseFullPageButton = res;
    };
    initUseFullPageButton();

    $scope.useFullPage = function() {
        var item = PageHandler.getPageItem();
        $scope.select(item);
        $scope.save(item);
    };

    $scope.copyInEditor = function() {
        var obj = {};
        //TODO costruisce l'id di freebase, cambiare metodo nel caso vengano gestiti più provider
        obj.uri = "__m__" + $scope.itemSelected.uri.substring($scope.itemSelected.uri.lastIndexOf('/') + 1);
        obj.providerFrom = 'freebase';

        KorboCommunicationService.setEntityToCopy(obj);

        var name = $window[Config.korbo.confName].globalObjectName;
        $window[name].callOpenNew();
    };

    $scope.updateSearch = function(term) {
        var caller = '';
        if (typeof(term) !== 'undefined' && term.length > 2) {
            switch ($scope.type) {
                case 'sub':
                    caller = 'subject';
                    break;
                case 'pr':
                    caller = 'predicate';
                    break;
                case 'obj':
                    caller = 'object';
                    break;
            }
            if (caller !== 'pr' && caller !== '') {
                $timeout.cancel(searchTimer);
                isTimerRunning = true;
                searchTimer = $timeout(function() {
                    if (Config.annotationServerCallsNeedLoggedUser) {
                        MyPundit.checkLoggedIn().then(function(isLoggedIn) {
                            if (isLoggedIn) {
                                ResourcePanel.updateVocabSearch(term, $scope.triple, caller);
                            } else {
                                EventDispatcher.sendEvent('MyPundit.userNeedToLogin');
                            }
                        });
                    } else {
                        ResourcePanel.updateVocabSearch(term, $scope.triple, caller);
                    }
                    isTimerRunning = false;
                }, ResourcePanel.options.vocabSearchTimer);
            }
        } else {
            if (typeof($scope.contentTabs) !== 'undefined' && term === '') {
                $scope.contentTabs[$scope.contentTabs.activeTab].items = [];
            }
            $timeout.cancel(searchTimer);

            // TODO: add specific method in ResourcePanel to reset search
            if (Config.annotationServerCallsNeedLoggedUser) {
                MyPundit.checkLoggedIn().then(function(isLoggedIn) {
                    if (isLoggedIn) {
                        ResourcePanel.updateVocabSearch('', $scope.triple, caller);
                    } else {
                        EventDispatcher.sendEvent('MyPundit.userNeedToLogin');
                    }
                });
            } else {
                ResourcePanel.updateVocabSearch('', $scope.triple, caller);
            }
        }
    };

    //$scope.escapeEvent = function(e) {
    //    if (e.which === 27) {
    //        e.stopPropagation();
    //    }
    //};

    //function colled on list scroll
    $scope.infiniteScroll = function(pane, label) {

        if (!pane.selector || !pane.selector.config || !pane.selector.config.infiniteScrolling) {
            return;
        }

        //if pane is already loading data we return
        if (pane.isLoading) {
            return;
        }

        //if there are no remote items count we return
        if (typeof(pane.remoteItemCount) === 'undefined' || pane.remoteItemCount === 0) {
            return;
        } else {
            //if we have downloaded all items we return
            if (pane.items.length === pane.remoteItemCount) {
                return;
            }
        }
        var caller = '';
        var selectors = [pane.selector];
        var offset = pane.items.length;
        switch ($scope.type) {
            case 'sub':
                caller = 'subject';
                break;
            case 'pr':
                caller = 'predicate';
                break;
            case 'obj':
                caller = 'object';
                break;
        }
        if (caller !== 'pr' && caller !== '') {
            $timeout.cancel(searchTimer);
            searchTimer = $timeout(function() {
                if (Config.annotationServerCallsNeedLoggedUser) {
                    MyPundit.checkLoggedIn().then(function(isLoggedIn) {
                        if (isLoggedIn) {
                            ResourcePanel.addItems(label, selectors, $scope.triple, caller, offset);
                        } else {
                            EventDispatcher.sendEvent('MyPundit.userNeedToLogin');
                        }
                    });
                } else {
                    ResourcePanel.addItems(label, selectors, $scope.triple, caller, offset);
                }
            }, ResourcePanel.options.vocabSearchTimer);
        }

    };

    // TODO: why?!
    $scope.$watch(function() {
        return $scope.contentTabs.activeTab;
    }, function(newActive, oldActive) {
        if (newActive !== oldActive) {
            var labTemp = $scope.label ? $scope.label : '';
            actualContainer = $scope.contentTabs[$scope.contentTabs.activeTab].itemsContainer + labTemp.split(' ').join('$');
            $scope.showUseAndCopyButton();

            var panelTitle = $scope.contentTabs[$scope.contentTabs.activeTab].title;
            Analytics.track('buttons', 'click', 'resourcePanel--' + panelTitle);
        }
    });

    $rootScope.$watch(function() {
        return MyPundit.isUserLogged();
    }, function(newStatus) {
        $scope.userLoggedIn = newStatus;
    });

    $scope.$on('$destroy', function() {
        EventDispatcher.removeListener(resetHandler);
        for (var key in keyHandlers) {
            Keyboard.unregisterHandler(keyHandlers[key]);
        }
    });

    resetHandler = EventDispatcher.addListener('Pundit.changeSelection', function() {
        resetSelection();
    });

});
