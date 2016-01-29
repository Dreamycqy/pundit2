angular.module('Pundit2.GeneralItemsContainer')

.constant('GENERALITEMSCONTAINER', {

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#GeneralItemsContainer
     *
     * @description
     * `object`
     *
     * Configuration object for GeneralItemsContainer module.
     */

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#GeneralItemsContainer.myItemsType
     *
     * @description
     * `string`
     *
     * Type myitems
     *
     * Default value:
     * <pre> myItemsType: 'myItems' </pre>
     */
    myItemsType: 'myItems',

    coreItemsType: 'coreItems',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#GeneralItemsContainer.pageItemsType
     *
     * @description
     * `string`
     *
     * Type pageitems
     *
     * Default value:
     * <pre> pageItemsType: 'pageItems' </pre>
     */
    pageItemsType: 'pageItems',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#GeneralItemsContainer.vocabulariesType
     *
     * @description
     * `string`
     *
     * Type vocabularies
     *
     * Default value:
     * <pre> vocabulariesType: 'vocabularies' </pre>
     */
    vocabulariesType: 'vocabularies',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#GeneralItemsContainer.myNotebooksType
     *
     * @description
     * `string`
     *
     * Type mynotebooks
     *
     * Default value:
     * <pre> myNotebooksType: 'myNotebooks' </pre>
     */
    myNotebooksType: 'myNotebooks',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#GeneralItemsContainer.predicatesType
     *
     * @description
     * `string`
     *
     * Type predicates
     *
     * Default value:
     * <pre> predicatesType: 'predicates' </pre>
     */
    predicatesType: 'predicates'

})

.service('GeneralItemsContainer', function(GENERALITEMSCONTAINER, BaseComponent, MyItemsContainer, CoreItemsContainer,
                                           PageItemsContainer, SelectorsManager, MyNotebooksContainer,
                                           NotebookExchange, PredicatesContainer, VocabulariesContainer,
                                           Config, ItemsExchange, Keyboard, EventDispatcher, Preview,
                                           MyPundit) {

    var generalItemsContainer = new BaseComponent('GeneralItemsContainer', GENERALITEMSCONTAINER);

    var MY_ITEMS_TYPE = generalItemsContainer.options.myItemsType;
    var CORE_ITEMS_TYPE = generalItemsContainer.options.coreItemsType;
    var PAGE_ITEMS_TYPE = generalItemsContainer.options.pageItemsType;
    var VOCABULARIES_TYPE = generalItemsContainer.options.vocabulariesType;
    var MY_NOTEBOOKS_TYPE = generalItemsContainer.options.myNotebooksType;
    var PREDICATES_TYPE = generalItemsContainer.options.predicatesType;

    //return the correct manager associated to the type
    generalItemsContainer.getManager = function(type) {
        if (type === MY_ITEMS_TYPE) {
            return MyItemsContainer;
        } else if (type === CORE_ITEMS_TYPE) {
            return CoreItemsContainer;
        } else if (type === PAGE_ITEMS_TYPE) {
            return PageItemsContainer;
        } else if (type === VOCABULARIES_TYPE) {
            return VocabulariesContainer;
        } else if (type === MY_NOTEBOOKS_TYPE) {
            return MyNotebooksContainer;
        } else if (type === PREDICATES_TYPE) {
            return PredicatesContainer;
        }
        //default myitems
        return MyItemsContainer;
    };

    generalItemsContainer.getMessage = function(type) {

        var text = '';
        if (generalItemsContainer.isMyItemsType(type)) {
            text = '未找到结果';//No my items found.
        } else if (generalItemsContainer.isCoreItemsType(type)) {
            text = '未找到结果';//No core items found.
        } else if (generalItemsContainer.isPageItemsType(type)) {
            text = 'No page items found.';
        } else if (generalItemsContainer.isVocabulariesType(type)) {
            text = 'Use this panel to search entities from Linked Data providers. Once you find the desired entity you can use it as Subject, Object or add it to My Items.';
        } else if (generalItemsContainer.isMyNotebooksType(type)) {
            text = 'No notebooks found.';
        } else if (generalItemsContainer.isPredicatesType(type)) {
            text = 'No predicates found.';
        }

        var message = {
            // show or not
            flag: true,
            // text to show
            text: text
        };

        return message;
    };

    generalItemsContainer.getTabs = function(type) {
        var tabs = [];
        if (generalItemsContainer.isPredicatesType(type) || generalItemsContainer.isMyNotebooksType(type)) {
            return tabs;
        }

        if (generalItemsContainer.isCoreItemsType(type)) {
            tabs = [{
                title: '所有记录',
                // this is the centralized template to items list
                template: 'src/Lists/itemList.tmpl.html',
                filterFunction: function() {
                    return true;
                }
            }, {
                title: '核心概念',
                // this is the centralized template to items list
                template: 'src/Lists/itemList.tmpl.html',
                filterFunction: function(item) {
                    return item.isConcept();
                }
            }, {
                title: '知识体系',
                // this is the centralized template to items list
                template: 'src/Lists/itemList.tmpl.html',
                filterFunction: function(item) {
                    return item.isCategory();
                }
            }, {
                title: '知识点实例',
                template: 'src/Lists/itemList.tmpl.html',
                filterFunction: function(item) {
                    return item.isInstance();
                }
            }];
            return tabs;
        }

        if (!generalItemsContainer.isVocabulariesType(type)) {
            // tabs used to filter items list by type (all, text, image and pages)
            tabs = [{
                title: '所有记录', //All Items
                // this is the centralized template to items list
                template: 'src/Lists/itemList.tmpl.html',
                filterFunction: function() {
                    return true;
                }
            }, {
                title: '核心概念',
                // this is the centralized template to items list
                template: 'src/Lists/itemList.tmpl.html',
                filterFunction: function(item) {
                    return item.isConcept();
                }
            }, {
                title: '知识体系',
                // this is the centralized template to items list
                template: 'src/Lists/itemList.tmpl.html',
                filterFunction: function(item) {
                    return item.isCategory();
                }
            }, {
                title: '知识点实例',
                template: 'src/Lists/itemList.tmpl.html',
                filterFunction: function(item) {
                    return item.isInstance();
                }
            }, {
                title: '文本', //Text
                // this is the centralized template to items list
                template: 'src/Lists/itemList.tmpl.html',
                filterFunction: function(item) {
                    return item.isTextFragment();
                }
            }, {
                title: '图片', //Images
                // this is the centralized template to items list
                template: 'src/Lists/itemList.tmpl.html',
                filterFunction: function(item) {
                    return item.isImage() || item.isImageFragment();
                }
            }, {
                title: '网页', //Pages
                // this is the centralized template to items list
                template: 'src/Lists/itemList.tmpl.html',
                filterFunction: function(item) {
                    return item.isWebPage();
                }
            }];
            // {
            //     title: '实例', //Entities
            //     template: 'src/Lists/itemList.tmpl.html',
            //     filterFunction: function(item) {
            //         return item.isEntity();
            //     }
            // },
        } else {
            // build tabs by reading active selectors inside selectors manager
            var selectors = SelectorsManager.getActiveSelectors();
            for (var j in selectors) {
                tabs.push({
                    title: selectors[j].config.label,
                    template: 'src/Lists/itemList.tmpl.html',
                    itemsContainer: selectors[j].config.container
                });
            }
        }

        return tabs;

    };

    var noItemsFound = '未找到结果';//Oops, try again. It looks like your search didn\'t return anything.

    generalItemsContainer.getMessageText = function(type, str) {
        var text = '',
            items = ItemsExchange.getItemsByContainer(type);

        if (generalItemsContainer.isMyItemsType(type)) {
            if (MyPundit.isUserLogged() === false) {
                return 'My Items are only available to logged users. Please log in and use this section to store and use items.';
            }
            // if (items.length === 0) {//hujiawei 不显示以下内容
            //     return 'You can add items here selecting parts of text or entities in the Linked Data panel and clicking "Add to My Items".';
            // }
            if (str === '') {
                return '未找到结果';//No item found.
            } else {
                return noItemsFound;
            }
        } else if (generalItemsContainer.isCoreItemsType(type)) {
            if (MyPundit.isUserLogged() === false) {
                return 'Core Items are only available to logged users. Please log in and use this section to store and use items.';
            }
            if (str === '') {
                return '未找到结果';//No item found.
            } else {
                return noItemsFound;
            }
        } else if (generalItemsContainer.isPageItemsType(type)) {
            if (str === '') {
                return 'No page item found.';
            } else {
                return noItemsFound;
            }
        } else if (generalItemsContainer.isVocabulariesType(type)) {
            if (str === '') {
                return 'No vocabulary found.';
            } else {
                return noItemsFound;
            }
        } else if (generalItemsContainer.isMyNotebooksType(type)) {
            if (str === '') {
                if (MyPundit.isUserLogged() === false) {
                    return 'Please log in to see your notebooks.';
                } else {
                    return 'No notebook found.';
                }
            } else {
                return noItemsFound;
            }
        } else if (generalItemsContainer.isPredicatesType(type)) {
            if (str === '') {
                return 'No predicate found.';
            } else {
                return noItemsFound;
            }
        }

        return text;
    };


    generalItemsContainer.getSearch = function(type) {

        var icon = generalItemsContainer.getManager(type).options.inputIconSearch;
        var term = '';
        var orderLabel = '';
        var placeholder = '';

        if (generalItemsContainer.isMyItemsType(type)) {
            orderLabel = 'Order my items';
        } else if (generalItemsContainer.isCoreItemsType(type)) {
            orderLabel = 'Order core items';
        } else if (generalItemsContainer.isPageItemsType(type)) {
            orderLabel = 'Order page items';
        } else if (generalItemsContainer.isVocabulariesType(type)) {
            orderLabel = 'Order vocabularies';
        } else if (generalItemsContainer.isMyNotebooksType(type)) {
            orderLabel = 'Order my notebooks';
            placeholder = 'search notebooks';
        } else if (generalItemsContainer.isPredicatesType(type)) {
            orderLabel = 'Order predicates';
            placeholder = 'search property';
        }
        var search = {
            icon: icon,
            term: term,
            placeholder: placeholder,
            orderLabel: orderLabel
        };

        if (generalItemsContainer.isVocabulariesType(type)) {
            search.additionalClass = 'vocab-items-btn-order';
        }
        return search;
    };

    generalItemsContainer.getActionButton = function(type) {
        var title = '';
        var text = '';
        var action = '';
        var requireLoggedUser = true;
        var btnClass = 'pnd-triplecomposer-cancel pnd-btn pnd-btn-xs pnd-btn-full';

        if (generalItemsContainer.isMyItemsType(type)) {
            title = 'Remove from My Items';
            text = '删除';//Remove
            action = 'remove';
            btnClass = 'pnd-btn';
        } else if (generalItemsContainer.isCoreItemsType(type)) {
            title = 'Add to  My Items';
            text = '添加到我的记录';//Add to My Items
            action = 'add';
            //requireLoggedUser = true;//
            btnClass = 'pnd-btn';
        } else if (generalItemsContainer.isPageItemsType(type)) {
            title = 'Add to  My Items';
            text = 'Add to My Items';
            action = 'add';
            requireLoggedUser = true;
            btnClass = 'pnd-btn';
        } else if (generalItemsContainer.isVocabulariesType(type)) {
            title = 'Add to My Items';
            text = 'Add to My Items';
            action = 'add';
            requireLoggedUser = true;
            btnClass = 'pnd-btn';
        } else if (generalItemsContainer.isMyNotebooksType(type)) {
            title = 'Create new notebook';
            text = 'Create new notebook';
            requireLoggedUser = false;
            btnClass = 'pnd-btn pnd-btn-calltoaction my-notebooks-btn-new';
        } else if (generalItemsContainer.isPredicatesType(type)) {
            title = 'Use as predicate';
            text = 'Set predicate';
            requireLoggedUser = false;
            btnClass = 'pnd-btn pnd-btn-predicate';
        }

        var actionButton = {
            title: title,
            text: text,
            action: action,
            btnClass: btnClass,
            requireLoggedUser: requireLoggedUser
        };

        return actionButton;
    };

    generalItemsContainer.getOrderButtonClass = function(type) {
        if (generalItemsContainer.isMyNotebooksType(type)) {
            return '.my-notebooks-btn-order';
        } else if (generalItemsContainer.isPredicatesType(type)) {
            return '.predicates-items-btn-order';
        }
        return '';
    };

    generalItemsContainer.itemsUpdateWatchFunction = function(type) {
        if (generalItemsContainer.isMyNotebooksType(type)) {
            return NotebookExchange.getMyNotebooks();
        } else if (generalItemsContainer.isPredicatesType(type)) {
            return ItemsExchange.getItemsByContainer(Config.modules.Client.relationsContainer);
        } else if (generalItemsContainer.isMyItemsType(type) || generalItemsContainer.isPageItemsType(type) || generalItemsContainer.isCoreItemsType(type)) {
            var ContainerManager = generalItemsContainer.getManager(type);
            ItemsExchange.getItemsByContainer(ContainerManager.options.container);
        }

        return;
    };

    generalItemsContainer.isMyItemsType = function(type) {
        return type === MY_ITEMS_TYPE;
    };

    generalItemsContainer.isCoreItemsType = function(type) {
        return type === CORE_ITEMS_TYPE;
    };

    generalItemsContainer.isPageItemsType = function(type) {
        return type === PAGE_ITEMS_TYPE;
    };

    generalItemsContainer.isVocabulariesType = function(type) {
        return type === VOCABULARIES_TYPE;
    };

    generalItemsContainer.isMyNotebooksType = function(type) {
        return type === MY_NOTEBOOKS_TYPE;
    };

    generalItemsContainer.isPredicatesType = function(type) {
        return type === PREDICATES_TYPE;
    };

    generalItemsContainer.setLastSelected = function(lastSelectedData) {
        lastSelected = lastSelectedData;
    };

    var lastSelected;
    var listContainer;
    var keyHandlers = {};
    keyHandlers.enter = Keyboard.registerHandler('ResourcePanelController', {
        keyCode: 13,
        ignoreOnInput: false,
        stopPropagation: true,
    }, function(/*event, eventKeyConfig*/){
        if (typeof lastSelected !== 'undefined') {
            var generalItemContainer = angular.element(lastSelected.elementItem).closest('general-items-container');
            var actionButtons = generalItemContainer.find('.pnd-panel-tab-content-footer').find('.pnd-btn.pnd-btn-subject,.pnd-btn.pnd-btn-object,.pnd-btn.pnd-btn-predicate');
            for (var i in actionButtons) {
                if (!actionButtons.eq(i).is(':disabled')) {
                    actionButtons.eq(i).trigger('click');
                    return;
                }
            }
        }
    });

    keyHandlers.arrowUp = Keyboard.registerHandler('ResourcePanelController', {
        keyCode: 38,
        ignoreOnInput: true,
        stopPropagation: true,
    }, function(/*event, eventKeyConfig*/){
        arrowKeyPressed(38);
    });

    keyHandlers.arrowDown = Keyboard.registerHandler('ResourcePanelController', {
        keyCode: 40,
        ignoreOnInput: true,
        stopPropagation: true,
    }, function(/*event, eventKeyConfig*/){
        arrowKeyPressed(40);
    });

    var arrowKeyPressed = function(code) {
        if (typeof lastSelected === 'undefined') {
            return;
        }

        var elem = angular.element(lastSelected.elementItem);
        var li = elem.parent();
        var ul = li.parent();
        listContainer = ul.parent().hasClass('pnd-inner-scrollable') ? ul.parent() : li.closest('.pnd-tab-content');
        var other;
        switch(code) {
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
            if ( (other.offset().top - ul.offset().top) < listContainer.scrollTop()) {
                listContainer.scrollTop(other.offset().top - ul.offset().top);
            }
            else if (
            (other.offset().top + other.height() - ul.offset().top > listContainer.height() - listContainer.scrollTop())
            ) {
                //console.log("scrolling to: " + (other.offset().top + other.height() - ul.offset().top - listContainer.height()));
                listContainer.scrollTop((other.offset().top + other.height() - ul.offset().top - listContainer.height()));
            }
        }
    };

    return generalItemsContainer;
});
