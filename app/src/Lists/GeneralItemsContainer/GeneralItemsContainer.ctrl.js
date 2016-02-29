angular.module('Pundit2.GeneralItemsContainer')

.controller('GeneralItemsContainerCtrl', function($scope, $rootScope, $modal, $timeout, $element, $injector, $q,
    GeneralItemsContainer, ItemsExchange, MyItems, CoreItems, MyPundit, NotebookComposer, Preview, TypesHelper, PageHandler,
    TripleComposer, XpointersHelper, SelectorsManager, EventDispatcher, Status, Analytics, NameSpace, Item) {

    $scope.isMyItems = GeneralItemsContainer.isMyItemsType($scope.type);
    $scope.isCoreItems = GeneralItemsContainer.isCoreItemsType($scope.type);
    $scope.isMyPageItems = GeneralItemsContainer.isPageItemsType($scope.type);
    $scope.isVocabularies = GeneralItemsContainer.isVocabulariesType($scope.type);
    $scope.isMyNotebooks = GeneralItemsContainer.isMyNotebooksType($scope.type);
    $scope.isPredicates = GeneralItemsContainer.isPredicatesType($scope.type);


    var ContainerManager = GeneralItemsContainer.getManager($scope.type);
    var lastSelected = {};

    // read by <item> directive (in Lists/itemList.tmpl.html)
    // specifie how contextual menu type show on item
    $scope.itemMenuType = ContainerManager.options.cMenuType;

    // This is the centralized template to dropdown
    $scope.dropdownTemplate = "src/ContextualMenu/dropdown.tmpl.html";

    $scope.itemSelected = null;
    $scope.isUseActive = false;

    $scope.canAddItemAsSubject = false;
    $scope.canAddItemAsObject = false;
    $scope.canBeUseAsPredicate = false;

    var eraseSearch = false;

    var orderBtn = angular.element($element).find(GeneralItemsContainer.getOrderButtonClass($scope.type));

    // showed when the items list is empty
    $scope.message = GeneralItemsContainer.getMessage($scope.type);

    $scope.isUserLogged = false;

    // items property used to compare
    // legal value are: 'type' and 'label'
    var order = ContainerManager.options.order;

    // how order items, true is ascending, false is descending
    $scope.reverse = ContainerManager.options.reverse;

    if (!($scope.isMyNotebooks || $scope.isPredicates)) {
        // tabs used to filter items list by type
        $scope.tabs = GeneralItemsContainer.getTabs($scope.type);

        // index of the active tab (the tab that currently shows its content)
        $scope.tabs.activeTab = ContainerManager.options.initialActiveTab;
    }


    //action button configuration
    $scope.actionButton = GeneralItemsContainer.getActionButton($scope.type);

    var resetContainer = function() {
        $scope.itemSelected = null;
        $scope.isUseActive = false;
        if (!$scope.isPredicates) {
            $scope.canAddItemAsSubject = false;
            $scope.canAddItemAsObject = false;
        } else {
            $scope.canBeUseAsPredicate = false;
        }
        GeneralItemsContainer.setLastSelected( /*undefined*/ );
    };

    // set as active a label in contextual menu
    var setLabelActive = function(index) {
        for (var i in $scope.dropdownOrdering) {
            $scope.dropdownOrdering[i].isActive = false;
        }
        $scope.dropdownOrdering[index].isActive = true;
    };

    // sort button dropdown content
    $scope.dropdownOrdering = [];//TODO hujiawei 删除名称排序功能
    // $scope.dropdownOrdering = [{
    //     text: '名称升序', //Order by label asc
    //     click: function() {
    //         order = 'label';
    //         $scope.reverse = false;
    //         setLabelActive(0);
    //
    //         var eventLabel = getHierarchyString();
    //         eventLabel += "--sort--labelAsc";
    //         Analytics.track('buttons', 'click', eventLabel);
    //     },
    //     isActive: order === 'label' && $scope.reverse === false
    // }, {
    //     text: '名称降序', //Order by label desc
    //     click: function() {
    //         order = 'label';
    //         $scope.reverse = true;
    //         setLabelActive(1);
    //
    //         var eventLabel = getHierarchyString();
    //         eventLabel += "--sort--labelDesc";
    //         Analytics.track('buttons', 'click', eventLabel);
    //     },
    //     isActive: order === 'label' && $scope.reverse === true
    // }];

    //TODO hujiawei 删除类型排序功能

    // if (!$scope.isMyNotebooks && !$scope.isPredicates) {
    //     $scope.dropdownOrdering.push({
    //         text: '类型升序', //Order by type asc
    //         click: function() {
    //             //TODO: condition not in vocabularies
    //             if (!$scope.isVocabularies && $scope.dropdownOrdering[2].disable) {
    //                 return;
    //             }
    //             order = 'type';
    //             $scope.reverse = false;
    //             setLabelActive(2);
    //
    //             var eventLabel = getHierarchyString();
    //             eventLabel += "--sort--typeAsc";
    //             Analytics.track('buttons', 'click', eventLabel);
    //         },
    //         isActive: order === 'type' && $scope.reverse === false
    //     });
    //     $scope.dropdownOrdering.push({
    //         text: '类型降序', //Order by type desc
    //         click: function() {
    //             //TODO: condition not in vocabularies
    //             if (!$scope.isVocabularies && $scope.dropdownOrdering[3].disable) {
    //                 return;
    //             }
    //             order = 'type';
    //             $scope.reverse = true;
    //             setLabelActive(3);
    //
    //             var eventLabel = getHierarchyString();
    //             eventLabel += "--sort--typeDesc";
    //             Analytics.track('buttons', 'click', eventLabel);
    //         },
    //         isActive: order === 'type' && $scope.reverse === true
    //     });
    // }


    // getter function used to build hierarchystring.
    // hierarchystring is used for tracking events with analytics.
    var getHierarchyString = function() {
        // Temporary solution to find hierarchystring.
        var eventLabel = "";
        var myScope = $scope;
        do {
            if (typeof(myScope) === 'undefined' || myScope === null) {
                break;
            }
            if (myScope.hasOwnProperty('pane')) {
                if (myScope.pane.hasOwnProperty('hierarchystring')) {
                    eventLabel = myScope.pane.hierarchystring;
                }
                break;
            }
            myScope = myScope.$parent;
        }
        while (typeof(myScope) !== 'undefined' && myScope !== null);

        if ($scope.hasOwnProperty('tabs')) {
            eventLabel += "--" + $scope.tabs[$scope.tabs.activeTab].title;
        }

        return eventLabel;
    };

    var removeSpace = function(str) {
        return str.replace(/ /g, '');
    };

    // getter function used inside template to order items
    // returns the items property value used to order
    $scope.getOrderProperty = function(item) {

        if (order === 'label') {
            return removeSpace(item.label);
        } else if (order === 'type') {
            return removeSpace(TypesHelper.getLabel(item.type[0]));
        }

    };

    var onClickRemove = function() {
        if ($scope.itemSelected === null) {
            return;
        }

        if (Status.getUserStatus() && ItemsExchange.isItemInContainer($scope.itemSelected, MyItems.options.container)) {
            MyItems.deleteItemAndConsolidate($scope.itemSelected);
        }

        var eventLabel = getHierarchyString();
        eventLabel += "--remove";
        Analytics.track('buttons', 'click', eventLabel);

        resetContainer();
    };

    var onClickAdd = function() {
        if ($scope.itemSelected === null) {
            return;
        }

        if (Status.getUserStatus() && !ItemsExchange.isItemInContainer($scope.itemSelected, MyItems.options.container)) {
            MyItems.addItemAndConsolidate($scope.itemSelected);

            var eventLabel = getHierarchyString();
            eventLabel += "--addToMyItems";
            Analytics.track('buttons', 'click', eventLabel);
        }

        resetContainer();
    };

    var createNewNotebook = function() {
        //EventDispatcher.sendEvent('Dashboard.showTab', NotebookComposer.options.clientDashboardTabTitle);
        EventDispatcher.sendEvent('MyNotebooksContainer.createNewNotebook', NotebookComposer.options.clientDashboardTabTitle);
        NotebookComposer.setNotebookToEdit(null);

        var eventLabel = getHierarchyString();
        eventLabel += "--newNotebook";
        Analytics.track('buttons', 'click', eventLabel);
    };

    var onClickUsePredicate = function() {
        if ($scope.itemSelected === null) {
            return;
        }

        TripleComposer.addToPredicate($scope.itemSelected);

        var eventLabel = getHierarchyString();
        eventLabel += "--setPredicate";
        Analytics.track('buttons', 'click', eventLabel);

        resetContainer();
    };

    $scope.onClickAction = function() {
        if ($scope.isMyNotebooks) {
            createNewNotebook();
        } else if ($scope.isPredicates) {
            onClickUsePredicate();
        } else if ($scope.isMyItems) {
            onClickRemove();
        } else if ($scope.isCoreItems) {
            onClickAdd();//hujiawei 添加到我的记录
        } else {
            onClickAdd();
        }
    };

    //TODO only in myItems. Probabibly dead code. Commented.
    // delete all my Items
    /*
     $scope.onClickDeleteAllMyItems = function() {
         openConfirmModal();
     };
     */

    // confirm modal
    /*
    var modalScope = $rootScope.$new();

    modalScope.titleMessage = "Delete all my items";

    // confirm btn click
    modalScope.confirm = function() {
        if (MyPundit.isUserLogged()) {
            MyItems.deleteAllItems().then(function() {
                modalScope.notifyMessage = "Success, my items correctly deleted.";
            }, function() {
                modalScope.notifyMessage = "Error impossible to delete my items, please retry.";
            });
        }
        $timeout(function() {
            confirmModal.hide();
        }, 1000);
    };

    // cancel btn click
    modalScope.cancel = function() {
        confirmModal.hide();
    };

    var confirmModal = $modal({
        container: "[data-ng-app='Pundit2']",
        template: 'src/Core/Templates/confirm.modal.tmpl.html',
        show: false,
        backdrop: 'static',
        scope: modalScope
    });

    // open modal
    var openConfirmModal = function() {
        // promise is needed to open modal when template is ready
        modalScope.notifyMessage = "Are you sure you want to delete all my items? After you can no longer recover.";
        confirmModal.$promise.then(confirmModal.show);
    };
   */
    $scope.isSelected = function(item) {
        if ($scope.itemSelected !== null && $scope.itemSelected.uri === item.uri) {
            return true;
        } else {
            return false;
        }
    };

    if (!$scope.isMyNotebooks) {
        $scope.select = function(item, $event) {
            Preview.setLock(false);
            Preview.showDashboardPreview(item);
            Preview.setItemDashboardSticky(item);
            EventDispatcher.sendEvent('Pundit.changeSelection');
            lastSelected = {
                item: item,
                elementItem: $event.currentTarget
            };
            GeneralItemsContainer.setLastSelected(lastSelected);
            $scope.isUseActive = true;
            $scope.itemSelected = item;

            if (!$scope.isPredicates) {
                $scope.canAddItemAsSubject = TripleComposer.canAddItemAsSubject(item);
                $scope.canAddItemAsObject = TripleComposer.canAddItemAsObject(item);
            } else {
                $scope.canBeUseAsPredicate = TripleComposer.canBeUseAsPredicate(item);
            }
        };

        $scope.onClickUseSubject = function() {
            if ($scope.itemSelected === null) {
                return;
            }

            if (Status.getTemplateModeStatus()) {
                TripleComposer.addToAllSubject($scope.itemSelected);
            } else {
                TripleComposer.addToSubject($scope.itemSelected);
            }

            var eventLabel = getHierarchyString();
            eventLabel += "--setSubject";
            Analytics.track('buttons', 'click', eventLabel);

            resetContainer();
        };

        $scope.onClickUseObject = function() {
            if ($scope.itemSelected === null) {
                return;
            }

            TripleComposer.addToObject($scope.itemSelected);

            var eventLabel = getHierarchyString();
            eventLabel += "--setObject";
            Analytics.track('buttons', 'click', eventLabel);

            resetContainer();
        };
    } else {
        $scope.select = function(item, $event) {
            Preview.setLock(false);
            Preview.showDashboardPreview(item);
            Preview.setItemDashboardSticky(item);
            lastSelected = {
                item: item,
                elementItem: $event.currentTarget
            };
            GeneralItemsContainer.setLastSelected(lastSelected);
            EventDispatcher.sendEvent('Pundit.changeSelection');
            $scope.itemSelected = item;
        };
    }

    EventDispatcher.addListener('Pundit.changeSelection', function() {
        resetContainer();
    });


    //TODO: only on myitems
    if ($scope.isMyItems) {
        var tempWebPageItem = {
            uri: XpointersHelper.getSafePageContext()
        };

        var isCurrentPageInMyItems = function() {
            return ItemsExchange.isItemInContainer(tempWebPageItem, MyItems.options.container);
        };

        //TODO hujiawei 删除这条分割线
        // $scope.dropdownOrdering.push({
        //     "divider": true
        // });
        $scope.dropdownOrdering.push({
            text: '添加当前页面到我的记录中', //Add web page to My Items
            click: function() {
                //var item = PageHandler.createItemFromPage();
                if (MyPundit.isUserLogged() && !isCurrentPageInMyItems()) {
                    $scope.onClickAddPageToMyItems();
                    $scope.dropdownOrdering[$scope.dropdownOrdering.length - 1].disable = true;
                }
                $scope.dropdownOrdering[$scope.dropdownOrdering.length - 1].disable = true;
            },
            isActive: false,
            disable: !MyPundit.isUserLogged() || isCurrentPageInMyItems()
        });

        $scope.dropdownOrdering.push({
            text: '使用当前搜索词新建主语', //
            click: function() {
                if (MyPundit.isUserLogged() && typeof($scope.search.term) !== 'undefined' && $scope.search.term !== '') {
                    $scope.onClickAddNewMyItem();
                    $scope.dropdownOrdering[$scope.dropdownOrdering.length - 1].disable = true;
                }
                $scope.dropdownOrdering[$scope.dropdownOrdering.length - 1].disable = true;
            },
            isActive: false,
            disable: !MyPundit.isUserLogged()
        });


        $scope.$watch(function() {
            return MyPundit.isUserLogged();
        }, function(logged) {
            if (logged) {
                $scope.isUserLogged = true;
            } else {
                $scope.isUserLogged = false;
            }
            $scope.message.text = GeneralItemsContainer.getMessageText($scope.type, $scope.search.term);
        });

        $scope.$watch(function() {
            return ItemsExchange.getItemsByContainer(MyItems.options.container);
        }, function() {
            $scope.dropdownOrdering[$scope.dropdownOrdering.length - 1].disable = !MyPundit.isUserLogged() || isCurrentPageInMyItems();
        }, true);

        // add page to my items
        $scope.onClickAddPageToMyItems = function() {
            if (!MyPundit.isUserLogged()) {
                ContainerManager.err('User not logged');
            } else {
                var item = PageHandler.createItemFromPage();
                MyItems.addItem(item);

                var eventLabel = getHierarchyString();
                eventLabel += "--addPageToMyItems";
                Analytics.track('buttons', 'click', eventLabel);
            }
        };

        // add search term to my items
        $scope.onClickAddNewMyItem = function() {
            if (!MyPundit.isUserLogged()) {
                ContainerManager.err('User not logged');
            } else {
                var item = createItemFromSearch();
                MyItems.addItem(item);

                // var eventLabel = getHierarchyString();
                // eventLabel += "--addPageToMyItems";
                // Analytics.track('buttons', 'click', eventLabel);
            }
        };

        //TODO hujiawie 添加将搜索词新建item的功能
        var createItemFromSearch = function() {
            var values = {};
            //values = getPageMetadata();
            values.uri = XpointersHelper.getSafePageContext()+"#xpointer#"+$scope.search.term;
            values.isPartOf = XpointersHelper.getSafePageContext();
            values.pageContext = XpointersHelper.getSafePageContext();
            values.label = $scope.search.term;
            if (typeof(values.description) === 'undefined') {
                values.description = values.label;
            }
            values.type = [NameSpace.fragments.text];
            // item.rdfData = semlibItems.createBucketForPage(item).bucket;

            return new Item(values.uri, values);
        };

    }

    if ($scope.isMyPageItems || $scope.isVocabularies) {
        EventDispatcher.addListener('MyPundit.isUserLogged', function(e) {
            $scope.search.term = '';
            $scope.isUserLogged = e.args;
        });
    }


    $scope.search = GeneralItemsContainer.getSearch($scope.type);


    if ($scope.isVocabularies) {
        var promise;
        $scope.$watch(function() {
            return $scope.search.term;
        }, function(str) {
            // this happens when the user deletes last char in the <input>

            if (typeof(str) === 'undefined' || str === '') {
                $scope.search.icon = ContainerManager.options.inputIconSearch;
                eraseSearch = true;
                $timeout.cancel(promise);
            } else {
                $scope.search.icon = ContainerManager.options.inputIconClear;
                eraseSearch = false;
            }

            // need to query vocab then update showed items
            $timeout.cancel(promise);
            promise = $timeout(function() {
                querySelectors();
            }, 500);

        });

        $scope.displayedItems = [];
        var updateMessage = function() {
            if (eraseSearch === true) {
                $scope.message.text = GeneralItemsContainer.getMessage($scope.type).text;
                $scope.displayedItems = [];
                eraseSearch = false;
                return;
            }

            if ($scope.displayedItems.length === 0 && $scope.search.term !== '' && typeof($scope.search.term) !== 'undefined') {
                $scope.message.text = "No item found to: " + $scope.search.term;
            }
        };
        // this promise is resolved when we make a new search
        // and we no longer need the items related to previous research
        var queryPromise = null,
            actualContainer;
        // make a new research
        var querySelectors = function() {
            if (queryPromise !== null) {
                queryPromise.resolve();
            }
            queryPromise = $q.defer();
            SelectorsManager.getItems($scope.search.term, queryPromise.promise).then(
                function() {
                    updateMessage();
                },
                function() {
                    updateMessage();
                });
            actualContainer = $scope.tabs[$scope.tabs.activeTab].itemsContainer + $scope.search.term.split(' ').join('$');
        };

        $scope.$watch(function() {
            return ItemsExchange.getItemsByContainer(actualContainer);
        }, function(newItems) {
            //TODO: Probaby dead code. Commented.
            /*
            if (orderBtn.length === 0) {
                orderBtn = angular.element('.vocab-items-btn-order');
            }
            */
            // update all items array and display new items
            $scope.displayedItems = newItems;
            if ($scope.displayedItems.length === 0) {
                $scope.message.flag = true;
                //TODO: Probaby dead code. Commented.
                //orderBtn.addClass('disabled');
            } else {
                $scope.message.flag = false;
                //TODO: Probaby dead code. Commented.
                //orderBtn.removeClass('disabled');
            }
        }, true);

        $scope.$watch(function() {
            return $scope.tabs.activeTab;
        }, function(newActive, oldActive) {
            if (newActive !== oldActive) {
                actualContainer = $scope.tabs[$scope.tabs.activeTab].itemsContainer + $scope.search.term.split(' ').join('$');
                updateMessage();
            }
        });

    }
    //TODO: if not in vocabularies
    else {
        var allItems = [];
        if ($scope.isMyNotebooks || $scope.isPredicates) {
            $scope.displayedItems = [];
        }
        $scope.$watch(function() {
            return $scope.search.term;
        }, function(str) {

            // All items are shown
            if (typeof($scope.displayedItems) === 'undefined') {
                return;
            }

            // this happens when the user deletes last char in the <input>
            if (typeof(str) === 'undefined' || str === '') {
                str = '';
                $scope.search.icon = ContainerManager.options.inputIconSearch;
            } else {
                $scope.search.icon = ContainerManager.options.inputIconClear;
            }

            filterItems(str);

        });

        // watch only my items
        if (!($scope.isMyNotebooks || $scope.isPredicates)) {
            $scope.$watch(function() {
                return ItemsExchange.getItemsByContainer(ContainerManager.options.container);
            }, function(newItems) {
                // update all items array and display new items
                $scope.displayedItems = ContainerManager.buildItemsArray($scope.tabs.activeTab, $scope.tabs, newItems);
                if (typeof($scope.displayedItems) !== 'undefined' && typeof($scope.search.term) !== 'undefined') {
                    filterItems($scope.search.term);
                }
            }, true);
        } else {
            $scope.$watch(function() {
                return GeneralItemsContainer.itemsUpdateWatchFunction($scope.type);
            }, function(newItems) {
                // update all items array and display new items
                allItems = newItems;
                filterItems($scope.search.term);
            }, true);
        }

        // watch showed items length
        $scope.$watch(function() {
            return $scope.displayedItems.length;
        }, function(len) {
            // show empty lists messagge
            if (len === 0) {
                $scope.message.flag = true;
                if (orderBtn) {
                    orderBtn.addClass('disabled');
                }
            } else {
                $scope.message.flag = false;
                if (orderBtn) {
                    orderBtn.removeClass('disabled');
                }
            }

        });

        if (!($scope.isMyNotebooks || $scope.isPredicates)) {
            // every time that change active tab show new items array
            $scope.$watch(function() {
                return $scope.tabs.activeTab;
            }, function(activeTab) {
                $scope.displayedItems = ContainerManager.getItemsArrays()[activeTab];
                // disable sort by type dropdown link
                // enable only in All Items tab
                if ($scope.tabs[activeTab].title !== $scope.tabs[0].title && $scope.tabs[activeTab].title !== $scope.tabs[3].title) {
                    $scope.dropdownOrdering[2].disable = true;
                    $scope.dropdownOrdering[3].disable = true;
                } else {
                    $scope.dropdownOrdering[2].disable = false;
                    $scope.dropdownOrdering[3].disable = false;
                }

                if (typeof($scope.displayedItems) !== 'undefined' && typeof($scope.search.term) !== 'undefined') {
                    filterItems($scope.search.term);
                }

            });
        }

        // Filter items which are shown
        // go to lowerCase and replace multiple space with single space,
        // to make the regexp work properly
        var filterItems = function(str) {

            str = str.toLowerCase().replace(/\s+/g, ' ');
            var strParts = str.split(' '),
                reg = new RegExp(strParts.join('.*'));

            if ($scope.isMyNotebooks) {
                $scope.displayedItems = allItems.filter(function(ns) {
                    if (typeof ns.label !== 'string') {
                        return false;
                    }
                    return ns.label.toLowerCase().match(reg) !== null;
                });
            } else if ($scope.isPredicates) {
                $scope.displayedItems = allItems.filter(function(ns) {
                    if (typeof(ns.mergedLabel) === 'undefined') {
                        return ns.label.toLowerCase().match(reg) !== null;
                    } else {
                        return ns.mergedLabel.toLowerCase().match(reg) !== null;
                    }
                });
            } else {
                var itemArray = ContainerManager.getItemsArrays()[$scope.tabs.activeTab];
                //先插入与搜索词一模一样的
                $scope.displayedItems = itemArray.filter(function(items) {
                    return items.label.toLowerCase() == str;
                });
                //然后插入正则匹配的前10项
                var regItems = itemArray.filter(function(items) {
                    return items.label.toLowerCase().match(reg) !== null;
                });
                //TODO hujiawei $scope.displayedItems 为了界面的快速响应！但是不足在于没法显示之后的搜索结果！
                regItems= regItems.slice(0,10);

                $scope.displayedItems = $scope.displayedItems.concat(regItems);
            }

            // update text messagge
            $scope.message.text = GeneralItemsContainer.getMessageText($scope.type, str);

        };
    }

    /*hujiawei 添加的搜索功能*/
    //监听coreItems中的searchTerm字段，使得myitems中的搜索词和coreitems中的搜索词保持一致
    $scope.$watch(function() {
        return MyItems.options.searchTerm;
    }, function(term){
        if (typeof(term)!=='undefined' && term != $scope.search.term) {
            $scope.search.term = term;
        }
    }, true);

});
