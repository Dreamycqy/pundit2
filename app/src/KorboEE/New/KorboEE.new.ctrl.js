angular.module('KorboEE')
.controller('KeeNewCtrl', function ($scope, $rootScope, $dropdown, $modal, KorboCommunicationService, $q, KorboCommunicationFactory,
                                    korboConf, $timeout, $http, TypesHelper, ItemsExchange, ContextualMenu, $window, Config, APIService, Breadcrumbs) {

    var copyCheck = false;
    var korboComm = new KorboCommunicationFactory();
    var delay;
    var api = APIService.get($scope.conf.globalObjectName);
    var basketIDforEdit;
    var revertStore = {};

    $scope.innerPanes = {
        current: 'simpleOptions',
        panes: {
            simpleOptions: {
                visible: true
            },
            advancedOptions: {
                visible: false
            },
            search: {
                visible: false
            }
        }
    }

    $scope.tabs = [];
    $scope.disactiveLanguages = [];
    $scope.disactiveLanguagesPopoverTemplate = 'src/KorboEE/New/KorboEE.languagesPopover.tmpl.html';
    $scope.imageUrl = "";
    $scope.saveClicked = false;
    $scope.activeFilter = false;
    $scope.isSaving = false;
    $scope.originalUrlCheck = true;
    $scope.loadingStatus = false;
    $scope.topArea = {
        'message': 'You are creating a new entity',
        'status': 'info'
    };
    $scope.typeFilter = {'label': ""};


    $window[$scope.conf.globalObjectName].onCancel(function () {
        ContextualMenu.wipeActionsByType('advancedMenu');
    });

    var searchConf = {
        discardSearch: function() {
            Breadcrumbs.itemSelect($scope.conf.breadcrumbName, (Breadcrumbs.getItems($scope.conf.breadcrumbName).length - 2));
        },
        selectUrl: function(item) {
            if (typeof item !== 'undefined' && typeof item.resource !== 'undefined') {
                $scope.originalUrl = item.resource;
                Breadcrumbs.itemSelect($scope.conf.breadcrumbName, (Breadcrumbs.getItems($scope.conf.breadcrumbName).length - 2));
            }
        },
        copyFromLOD: function(item) {
            console.log("COPY FROM LOD", item);
            $scope.tabs = [];
            $scope.disactiveLanguages = [];

            buildLanguagesModel(item.uri, item.providerFrom);
            Breadcrumbs.itemSelect($scope.conf.breadcrumbName, 0);
        },
        subTypeSearchURL: 'SearchURL',
        subTypeSearchAndCopy: 'SearchAndCopy',
        searchFieldLabelSearchURL: 'Search entity URL:',
        searchFieldLabelSearchAndCopy: 'Search entity to copy:',
        subType: ''
    };

    var setCurrentInnerPane = function(name) {
        switch(name) {
            case 'SearchURL':
            case 'SearchAndCopy':
                searchConf.subType = name;
                KorboCommunicationService.setSearchConf('inner', searchConf);
                name = 'search';
                break;
        }
        for (var i in $scope.innerPanes.panes) {
            $scope.innerPanes.panes[i].visible = (i == name);
        }

        $scope.innerPanes.current = name;

        ContextualMenu.modifyDisabled('showAdvanceOptions', name === 'advancedOptions');
        ContextualMenu.modifyDisabled('searchAndCopy', name === 'search');
    }

    var initTypes = function () {
        $scope.types = [];
    };

    var addActionToContextualMenu = function (lang) {
        ContextualMenu.addAction({
            name: 'rml' + lang.name,
            type: 'advancedMenu',
            label: 'Remove ' + lang.name,
            priority: 1,
            showIf: function () {
                return $scope.conf.contextMenuActiveItems.removeLanguages;
            },
            action: function (_lang) {
                return function () {
                    if ($scope.tabs.length > 1) {
                        $scope.removeLanguage(_lang);
                    }
                };
            }(lang)
        });
    };

    var pushCurrentLang = function (lang) {
        if ($scope.tabs.length === 1) {
            addActionToContextualMenu(lang);
            ContextualMenu.modifyDisabled('rml' + $scope.tabs[0].name, true);
        }
        else {
            if ($scope.tabs.length === 2) {
                addActionToContextualMenu(lang);
                ContextualMenu.modifyDisabled('rml' + $scope.tabs[0].name, false);
            }
            else {
                if ($scope.tabs.length > 2) {
                    addActionToContextualMenu(lang);
                }
            }
        }
    };

    var buildContextualMenu = function () {
        ContextualMenu.addAction({
            name: 'showAdvanceOptions',
            type: 'advancedMenu',
            label: 'Advanced options',
            priority: 3,
            showIf: function () {
                return $scope.conf.contextMenuActiveItems.advancedOptions;
            },
            action: function () {
                $scope.showAdvancedOptions();
            }
        });

        ContextualMenu.addAction({
            name: 'tripleComposer',
            type: 'advancedMenu',
            label: 'Triple composer',
            priority: 3,
            showIf: function () {
                return $scope.conf.contextMenuActiveItems.tripleComposer;
            },
            action: function () {
                /*noop*/
            }
        });

        ContextualMenu.addAction({
            name: 'editURL',
            type: 'advancedMenu',
            label: 'Edit original URL',
            priority: 3,
            showIf: function () {
                return $scope.conf.contextMenuActiveItems.editOriginalUrl;
            },
            action: function () {
                $scope.originalUrlCheck = false;
                ContextualMenu.modifyDisabled('editURL', true);
            }
        });

        ContextualMenu.addAction({
            name: 'searchOriginalURL',
            type: 'advancedMenu',
            label: 'Search original URL',
            priority: 3,
            showIf: function () {
                return $scope.editMode && $scope.conf.contextMenuActiveItems.searchOriginalUrl;
            },
            action: function () {
                setCurrentInnerPane('SearchURL');
            }
        });

        ContextualMenu.addAction({
            name: 'updateAllData',
            type: 'advancedMenu',
            label: 'Update all data',
            priority: 3,
            disable: true,
            showIf: function () {
                return $scope.conf.contextMenuActiveItems.updateAllData;
            },
            action: function () {
                /*noop*/
            }
        });

        ContextualMenu.addAction({
            name: 'searchAndCopy',
            type: 'advancedMenu',
            label: 'Search and copy from LOD',
            priority: 3,
            showIf: function () {
                return $scope.conf.contextMenuActiveItems.searchAndCopyFromLOD;
            },
            action: function () {
                /*noop*/
                Breadcrumbs.appendItem($scope.conf.breadcrumbName, {
                    label: 'Search and copy from LOD',
                    callback: function() {
                        setCurrentInnerPane('SearchAndCopy');
                        ContextualMenu.modifyDisabled('searchAndCopy', true);
                    }
                });
                setCurrentInnerPane('SearchAndCopy');
                ContextualMenu.modifyDisabled('searchAndCopy', true);
            }
        });

        ContextualMenu.addAction({
            name: 'korboHelp',
            type: 'advancedMenu',
            label: 'Korbo help',
            priority: 3,
            showIf: function () {
                return $scope.conf.contextMenuActiveItems.korboHelp;
            },
            action: function () {
                /*noop*/
            }
        });

        if ($scope.conf.contextMenuActiveItems.removeLanguages) {
            ContextualMenu.addDivider({
                priority: 3,
                type: 'advancedMenu'
            });
        }
    };

    buildContextualMenu();

    var buildTypesFromConfiguration = function () {
        var tmp = angular.copy($scope.conf.type);
        for (var i in tmp) {
            var indexFind = $scope.types.map(function (e) {
                return e.URI;
            }).indexOf(tmp[i].URI);
            if (indexFind === -1) {
                var t = {};
                t.URI = tmp[i].URI;
                t.label = tmp[i].label;
                t.checked = tmp[i].state || false;
                $scope.types.push(t);
            }
            else {
                $scope.types[indexFind].checked = true;
            }

        }
    };

    var buildTypesFromArray = function (typesToAdd) {
        for (var i = 0; i < typesToAdd.length; i++) {
            var indexFind = $scope.types.map(function (e) {
                return e.URI;
            }).indexOf(typesToAdd[i]);
            if (indexFind === -1) {
                var t = {};
                t.URI = typesToAdd[i];
                t.label = TypesHelper.getLabel(typesToAdd[i]);
                t.checked = true;
                $scope.types.push(t);
            }
            else {
                $scope.types[indexFind].checked = true;
            }
        }
    };

    //build languages tabs
    var buildLanguageTabs = function () {
        $scope.conf.languages.sort(function(a, b){
            var a_val = a.value.toLowerCase();
            var b_val = b.value.toLowerCase();
            return a_val === $scope.conf.defaultLanguage ? -1 : b_val === $scope.conf.defaultLanguage ? 1 : 0;
        });
        for (var i = 0; i < $scope.conf.languages.length; i++) {
            if ($scope.conf.languages[i].value.toLowerCase() === $scope.conf.defaultLanguage) {
                $scope.conf.languages[i].state = true;
            }
            var title = angular.uppercase($scope.conf.languages[i].value);
            var name = angular.lowercase($scope.conf.languages[i].name);

            var indexFind = $scope.tabs.map(function (e) {
                return angular.lowercase(e.title);
            }).indexOf(angular.lowercase(title));
            if (indexFind !== -1) {
                return;
            }

            var lang = {
                'title': title,
                'name': $scope.conf.languages[i].name,
                'description': "",
                'label': "",
                'mandatory': true,
                'hasError': false,
                'tooltipMessageTitle': tooltipMessageTitle + name,
                'tooltipMessageDescription': tooltipMessageDescription + name,
                'tooltipMessageError': "message",
                'tooltipMessageErrorTab': "There are some errors in the " + name + " languages fields"
            };

            if (typeof($scope.entityToCreate) !== 'undefined' && $scope.entityToCreate !== null) {
                lang.label = $scope.entityToCreate.label;
            }

            if ($scope.conf.languages[i].state) {
                $scope.tabs.push(lang);
                pushCurrentLang(lang);
                if ($scope.conf.languages[i] === $scope.conf.defaultLanguage) {
                    Breadcrumbs.setItemLabel($scope.conf.breadcrumbName, 0, lang.label);
                }
            }
            else {
                $scope.disactiveLanguages.push(lang);
            }

            // if(!$scope.editMode){
            //     if($scope.conf.languages[i].state){
            //         $scope.tabs.push(lang);
            //         pushCurrentLang(lang);
            //     } else {
            //         $scope.disactiveLanguages.push(lang);
            //     }
            // } else {
            //     var indexFind = $scope.tabs.map(function(e){ return angular.lowercase(e.title) }).indexOf(angular.lowercase(lang.title));
            //     if(indexFind === -1){
            //         $scope.disactiveLanguages.push(lang);
            //     }
            // }
        }
    };

    var discardAdvancedOptionsChanges = function() {
        $scope.imageUrl = revertStore.advancedOptions.imageUrl;
        $scope.originalUrl = revertStore.advancedOptions.originalUrl;
        $scope.types = angular.copy(revertStore.advancedOptions.types);
        delete revertStore.advancedOptions;
    }

    var backupAdvancedOptions = function() {
        revertStore.advancedOptions = {
            imageUrl: $scope.imageUrl,
            originalUrl: $scope.originalUrl,
            types: angular.copy($scope.types)
        };
    }

    $scope.showAdvancedOptions = function() {
        Breadcrumbs.appendItem($scope.conf.breadcrumbName, {
            label: 'Advanced options',
            callback: function() {
                setCurrentInnerPane('advancedOptions');
                KorboCommunicationService.setSearchConf('tab');
                backupAdvancedOptions();
            }
        });
        setCurrentInnerPane('advancedOptions');
        backupAdvancedOptions();
    }

    $scope.closeAdvancedOptions = function(confirmChanges) {
        setCurrentInnerPane('simpleOptions');
        if (!confirmChanges) {
            discardAdvancedOptionsChanges();
        }
        Breadcrumbs.itemSelect($scope.conf.breadcrumbName, Breadcrumbs.getItems($scope.conf.breadcrumbName).length - 2);
    }

    $scope.searchOriginalURL = function() {
        Breadcrumbs.appendItem($scope.conf.breadcrumbName, {
            label: 'Search original URL',
            callback: function() {
                setCurrentInnerPane('SearchURL');
            }
        });
        setCurrentInnerPane('SearchURL');
    }

    $scope.prevBasketID;
    var buildLanguagesModel = function (entityUri, provider) {

        $scope.topArea = {
            'message': 'Loading entity...',
            'status': 'info'
        };
        $scope.loadingStatus = true;

        // New AnnotationServer APIs require basketID.
        //var currentBasketID = (provider === 'korbo' ? null : $scope.conf.basketID);
        var currentBasketID = $scope.conf.basketID;

        var param = {
            item: {uri: entityUri},
            provider: provider,
            endpoint: $scope.conf.endpoint,
            basketID: currentBasketID,
            language: $scope.defaultLan.value
        };
        var langConf = $scope.conf.languages;
        KorboCommunicationService.buildLanguagesObject(param, langConf).then(function (res) {

            if (typeof(res.basketId) !== 'undefined' && res.basketId !== null) {
                $scope.prevBasketID = res.basketId;
                basketIDforEdit = res.basketId;
            }
            else {
                basketIDforEdit = $scope.prevBasketID;
            }

            //basketIDforEdit = res.basketId;
            $scope.imageUrl = res.imageUrl;
            $scope.originalUrl = res.originalUrl;
            initTypes();
            buildTypesFromArray(res.types);
            buildTypesFromConfiguration();

            for (var i in res.languages) {
                $scope.tabs.push(res.languages[i]);
                pushCurrentLang(res.languages[i]);
                if (res.languages[i].title.toLowerCase() === $scope.conf.defaultLanguage) {
                    Breadcrumbs.setItemLabel($scope.conf.breadcrumbName, 0, res.languages[i].label);
                }
            }

            buildLanguageTabs();

            $scope.topArea = {
                'message': 'You are editing the entity...',
                'status': 'info'
            };
            $scope.loadingStatus = false;

        },
        function () {
            $scope.topArea = {
                'message': 'Error getting entity info!',
                'status': 'error'
            };
        });
    };

    // check if language field are all right filled
    var checkLanguages = function () {
        var allLangAreOk = true;
        for (var l = 0; l < $scope.tabs.length; l++) {

            (function (index) {
                if (typeof($scope.tabs[index].label) === 'undefined' || $scope.tabs[index].label === '') {
                    $scope.tabs[index].hasError = true;
                    allLangAreOk = false;
                    $scope.tabs[index].tooltipMessageError = errorMandatory;
                }
                else {
                    if ($scope.tabs[index].label.length < $scope.conf.labelMinLength) {
                        $scope.tabs[index].hasError = true;
                        allLangAreOk = false;
                        $scope.tabs[index].tooltipMessageError = errorLabelTooShort;
                    }
                    else {
                        $scope.tabs[index].hasError = false;
                    }
                }

            })(l);

        }
        return allLangAreOk;
    };


    // set default language
    $scope.defaultLan = $scope.conf.languages[0];
    for (var j in $scope.conf.languages) {
        if ($scope.conf.languages[j].state === true) {
            $scope.defaultLan = $scope.conf.languages[j];
            break;
        } // end if
    } // end for


    if (typeof($scope.idEntityToEdit) !== 'undefined' && $scope.idEntityToEdit !== null) {
        buildLanguagesModel($scope.idEntityToEdit, 'korbo');
    }


    // tooltip message for image url
    $scope.imageUrlErrorMessage = "Invalid URL";
    $scope.imageUrlTooltipeMessage = "Depiction URL";
    $scope.imageUrlHasError = false;
    var urlPattern = new RegExp('(http|ftp|https)://[a-z0-9\-_]+(\.[a-z0-9\-_]+)+([a-z0-9\-\.,@\?^=%&;:/~\+#]*[a-z0-9\-@\?^=%&;/~\+#])?', 'i');

    // tooltip messages for languages
    var tooltipMessageTitle = "Insert title of the entity in ";
    var tooltipMessageDescription = "Insert description of the entity in ";
    var errorMandatory = "The Title field is mandatory and must be filled";
    var errorLabelTooShort = " The Title must be contain at least " + $scope.conf.labelMinLength + " characters";


    $scope.typesHasError = false;
    $scope.typesErrorMessage = "You must select at least one type";
    $scope.typesTooltipeMessage = "Select at least one type";

    if (!$scope.editMode) {
        initTypes();
        buildLanguageTabs();
        buildTypesFromConfiguration();
    }

    $scope.updateTypes = function () {
        var count = 0;
        for (var i in $scope.types) {
            if ($scope.types[i].checked) {
                count++;
            }
        }
        if ($scope.saveClicked) {
            if (count === 0) {
                $scope.typesHasError = true;
            }
            else {
                $scope.typesHasError = false;
            }
        }

        return count;
    };

    // return true if url is valid, false otherwise
    $scope.checkUrl = function () {
        if ($scope.imageUrl === '' || urlPattern.test($scope.imageUrl)) {
            if ($scope.saveClicked) {
                $scope.imageUrlHasError = false;
            }

            return true;
        }
        else {
            if ($scope.saveClicked) {
                $scope.imageUrlHasError = true;
            }

            return false;
        }
    };

    var updateBreadcrumbFirstItem = function() {
        Breadcrumbs.setItemLabel($scope.conf.breadcrumbName, 0, $scope.tabs[0].label);
    }

    $scope.updateTitleField = function (index) {

        if ($scope.tabs[index].label === '') {
            $scope.tabs[index].tooltipMessageError = errorMandatory;
        }
        else {
            if ($scope.tabs[index].label !== '' && $scope.tabs[index].label.length < $scope.conf.labelMinLength) {
                $scope.tabs[index].tooltipMessageError = errorLabelTooShort;
            }
            else {
                if ($scope.tabs[index].label !== '' && $scope.tabs[index].label.length >= $scope.conf.labelMinLength) {
                    $scope.tabs[index].hasError = false;
                }
            }
        }
        updateBreadcrumbFirstItem();
    };


    $scope.save = function () {
        $scope.saveClicked = true;

        var checkLang = checkLanguages();
        $scope.updateTypes();
        $scope.checkUrl();

        if (!$scope.imageUrlHasError && !$scope.typesHasError && checkLang) {
            $scope.isSaving = true;
            $scope.topArea.message = "Saving entity...";
            $scope.topArea.status = "info";

            // get checked types
            var newTypes = [];
            for (var i = 0; i < $scope.types.length; i++) {
                if ($scope.types[i].checked) {
                    newTypes.push($scope.types[i].URI);
                }
            }
            var lang = angular.lowercase($scope.tabs[0].title);

            var entityToSave = {
                // "label": $scope.tabs[0].label,
                // "abstract": $scope.tabs[0].description,
                "depiction": $scope.imageUrl,
                "type": newTypes,
                "resource": $scope.originalUrl
            };

            // declare object returned onSave() call
            var obj = {};
            obj.label = $scope.tabs[0].label;
            obj.type = newTypes;
            obj.image = $scope.imageUrl;
            obj.description = $scope.tabs[0].label;
            obj.language = $scope.defaultLan.value;

            var basketID;
            if ($scope.editMode) {
                entityToSave.id = String($scope.idEntityToEdit);
                basketID = basketIDforEdit;
            }
            else {
                basketID = $scope.conf.basketID;
            }

            var promise = korboComm.save(entityToSave, lang, $scope.conf.endpoint, basketID);
            promise.then(function (res) {

                // get id from location of entity just created// All other label types, take the last part
                var id;
                if ($scope.editMode) {
                    id = String($scope.idEntityToEdit);
                }
                else {
                    id = res.substring(res.lastIndexOf('/') + 1);
                }

                var location = res;
                var allPromises = [];

                for (var i = 0; i < $scope.tabs.length; i++) {

                    (function (index) {
                        var lang = angular.lowercase($scope.tabs[index].title);
                        var entityToEdit = {
                            "id": id,
                            "label": $scope.tabs[index].label,
                            "abstract": $scope.tabs[index].description
                        };
                        var langPromise = korboComm.save(entityToEdit, lang, $scope.conf.endpoint, basketID);
                        allPromises.push(langPromise);
                    })(i);

                }

                $q.all(allPromises).then(function () {
                    $scope.isSaving = false;
                    if ($scope.conf.useTafonyCompatibility) {
                        $scope.directiveScope.location = location;
                        $scope.directiveScope.elemToSearch = $scope.tabs[0].label;
                        $scope.directiveScope.label = $scope.tabs[0].label;
                    }
                    $scope.topAreaMessage = "Entity saved!";
                    $scope.topArea.message = "Entity saved!";
                    $scope.topArea.status = "info";

                    //TODO fire onSave
                    obj.value = location;
                    // fire save callback
                    api.fireOnSave(obj);


                    $timeout(function () {
                        ContextualMenu.wipeActionsByType('advancedMenu');
                        KorboCommunicationService.closeModal();
                        // fire cancel callback
                        api.fireOnCancel();
                        // set modal as close in configuration
                        korboConf.setIsOpenModal(false);
                    }, 1000);
                },
                function () {
                    $scope.topArea.message = "Entity saving error!";
                    $scope.topArea.status = "error";
                });
            },
            function () {
                $scope.topArea.message = "Entity saving error!";
                $scope.topArea.status = "error";
            });


        }
        else {

            $scope.topArea.message = "Some errors occurred! Check the fields and try to save again...!";
            $scope.topArea.status = "error";
        }

    };

    $scope.clearForm = function () {
        $scope.saveClicked = false;
        // reset all title and description for each languages
        for (var l = 0; l < $scope.tabs.length; l++) {
            (function (index) {
                $scope.tabs[index].label = "";
                $scope.tabs[index].description = "";
                $scope.tabs[index].hasError = false;

            })(l);
        } // end for

        initTypes();
        buildTypesFromConfiguration();

        // reset image url
        $scope.imageUrl = "";
        $scope.originalUrl = "";
        KorboCommunicationService.setEntityToCopy(null);
        $scope.topArea.message = "You are creating a new entity";
        $scope.topArea.status = "info";
    };

    $scope.previewImage = "";
    $scope.errorImage = false;
    $scope.loadingImage = false;
    var timer;

    $scope.$watch('imageUrl', function (val) {

        if (val !== '' && urlPattern.test(val)) {

            $timeout.cancel(timer);
            timer = $timeout(function () {
                $scope.loadingImage = true;
                $http({
                    headers: {'Accept': 'image/webp,*/*;q=0.8'},
                    method: 'HEAD',
                    url: val,
                    cache: false
                }).success(function () {
                    $scope.showImg = true;
                    $scope.previewImage = val;
                    $scope.errorImage = false;
                    $scope.loadingImage = false;
                }).error(function () {
                    $scope.showImg = false;
                    $scope.errorImage = true;
                    $scope.loadingImage = false;
                });
            }, 1000);

            // if input type is empty
        }
        else {
            $scope.showImg = false;
            $scope.errorImage = false;
            $scope.loadingImage = false;
        }
    });

    $scope.addLanguage = function (lang) {
        var langIndex = $scope.disactiveLanguages.indexOf(lang);
        $scope.disactiveLanguages.splice(langIndex, 1);
        $scope.tabs.push(lang);
        addActionToContextualMenu(lang);
        if ($scope.tabs.length === 2) {
            ContextualMenu.modifyDisabled('rml' + $scope.tabs[0].name, false);
        }
    };

    $scope.removeLanguage = function (lang) {
        var langIndex = $scope.tabs.indexOf(lang);
        $scope.tabs.splice(langIndex, 1);
        $scope.disactiveLanguages.push(lang);
        ContextualMenu.removeActionByName('rml' + lang.name);
        if ($scope.tabs.length < 2) {
            ContextualMenu.modifyDisabled('rml' + $scope.tabs[0].name, true);
        }
    };

    $scope.showDropdown = function ($event) {
        var resource = {name: 'resourceName'};
        ContextualMenu.show($event.pageX, $event.pageY, resource, 'advancedMenu');
        $event.stopPropagation();
    };

    $scope.typesMouseLeave = function () {
        $timeout.cancel(delay);
        delay = $timeout(function () {
            $scope.activeFilter = false;
            $scope.typeFilter.label = '';
        }, 1000);
    };
    $scope.typesMouseEnter = function () {
        $timeout.cancel(delay);
    };

    $scope.removeImage = function () {
        // reset image url
        $scope.imageUrl = "";
    };

    $scope.activeAllTypes = function () {
        for (var t in $scope.types) {
            $scope.types[t].checked = true;
        }
    };
    $scope.disableAllTypes = function () {
        for (var t in $scope.types) {
            $scope.types[t].checked = false;
        }
    };

    //entityToCreate
    $scope.$watch(function () {
        return KorboCommunicationService.getEntityToCopy();
    }, function (entity) {
        if (entity !== null) {

            if (!$scope.editMode || copyCheck) {
                ContextualMenu.wipeActionsByType('advancedMenu');
                buildContextualMenu();
                $scope.tabs = [];
                $scope.disactiveLanguages = [];

                buildLanguagesModel(entity.uri, entity.providerFrom);

                copyCheck = false;
            }
            else {
                $scope.originalUrl = entity.resource;
            }
        }

    });

    $scope.openWindow = function (url) {
        if (typeof(url) !== 'undefined' && url !== null) {
            $window.open(url);
        }

    };

    // Add first item in breadcrumbs.
    Breadcrumbs.appendItem($scope.conf.breadcrumbName, {
        label: '',
        placeholder: 'Entity title',
        charLimit: 15,
        charLimitAsLast: 40,
        callback: function() {
            if ($scope.innerPanes.current == 'advancedOptions') {
                discardAdvancedOptionsChanges();
            }
            setCurrentInnerPane('simpleOptions');
        }
    });

});

