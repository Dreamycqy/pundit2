angular.module('Pundit2.TripleComposer')

.constant('TRIPLECOMPOSERDEFAULTS', {

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TripleComposer
     *
     * @description
     * `object`
     *
     * Configuration for TripleComposer module. This module allows you to create annotations
     * consist of one or more triple and save on server.
     * By default the TripleComposer directive is contained in the central panel (tools) of the dashboard.
     */

    /**
     * @ngdoc property
     * @name modules#TripleComposer.active
     *
     * @description
     * `boolean`
     *
     * Default state of the TripleComposer module, if it is set to true
     * the client adds to the DOM (inside dashboard) the TripleComposer directive in the boot phase.
     *
     * Default value:
     * <pre> active: true </pre>
     */

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TripleComposer.clientDashboardTemplate
     *
     * @description
     * `string`
     *
     * Path of template containing tripleComposer directive, client will append the content of this template
     * to the DOM (inside dashboard directive) to bootstrap this component.
     *
     * Default value:
     * <pre> clientDashboardTemplate: "src/Tools/TripleComposer/ClientTripleComposer.tmpl.html" </pre>
     */
    clientDashboardTemplate: "src/Tools/TripleComposer/ClientTripleComposer.tmpl.html",

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TripleComposer.clientDashboardPanel
     *
     * @description
     * `string`
     *
     * Name of the panel where append the directive (legal value to default are: 'lists', 'tools' and 'details').
     *
     * Default value:
     * <pre> clientDashboardPanel: "tools" </pre>
     */
    clientDashboardPanel: "tools",

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TripleComposer.clientDashboardTabTitle
     *
     * @description
     * `string`
     *
     * Tab title inside panel dashboard tabs.
     *
     * Default value:
     * <pre> clientDashboardTabTitle: "Annotation Composer" </pre>
     */
    clientDashboardTabTitle: "Annotation composer",

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TripleComposer.savingMsg
     *
     * @description
     * `string`
     *
     * Message shown at the beginning of the process of saving the annotation.
     *
     * Default value:
     * <pre> savingMsg: "We are saving your annotation" </pre>
     */
    savingMsg: "We are saving your annotation",

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TripleComposer.savingMsgTime
     *
     * @description
     * `string`
     *
     * Time for which the saving message is displayed (in milliseconds).
     *
     * Default value:
     * <pre> savingMsgTime: 500 </pre>
     */
    savingMsgTime: 1250,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TripleComposer.notificationSuccessMsg
     *
     * @description
     * `string`
     *
     * Message shown after an annotation has been saved successfully.
     *
     * Default value:
     * <pre> notificationSuccessMsg: "Your annotation has been saved successfully" </pre>
     */
    notificationSuccessMsg: "Your annotation has been saved successfully",
    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TripleComposer.notificationErrorMsg
     *
     * @description
     * `string`
     *
     * Message shown after an annotation was not saved properly.
     *
     * Default value:
     * <pre> notificationErrorMsg: "We were unable to save your annotation" </pre>
     */
    notificationErrorMsg: "We were unable to save your annotation",

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TripleComposer.notificationMsgTime
     *
     * @description
     * `string`
     *
     * Time for which the notification message is displayed (in milliseconds).
     *
     * Default value:
     * <pre> notificationMsgTime: 1000 </pre>
     */
    notificationMsgTime: 1500,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TripleComposer.inputIconSearch
     *
     * @description
     * `string`
     *
     * Icon shown in the search input when it's empty
     *
     * Default value:
     * <pre> inputIconSearch: 'pnd-icon-search' </pre>
     */
    inputIconSearch: 'pnd-icon-search',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TripleComposer.inputIconClear
     *
     * @description
     * `string`
     *
     * Icon shown in the search input when it has some content
     *
     * Default value:
     * <pre> inputIconClear: 'pnd-icon-close' </pre>
     */
    inputIconClear: 'pnd-icon-close',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TripleComposer.cMenuType
     *
     * @description
     * `string`
     *
     * Contextual menu type showed by statement
     *
     * Default value:
     * <pre> cMenuType: 'tripleComposer' </pre>
     */
    cMenuType: 'tripleComposer',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#TripleComposer.debug
     *
     * @description
     * `boolean`
     *
     * Active debug log
     *
     * Default value:
     * <pre> debug: false </pre>
     */
    debug: false

})

.service('TripleComposer', function($rootScope, BaseComponent, EventDispatcher, TRIPLECOMPOSERDEFAULTS, TypesHelper, NameSpace, Config,
    AnnotationsExchange, ItemsExchange, Dashboard, ContextualMenu, TemplatesExchange, Status, Utils, Analytics) {

    var tripleComposer = new BaseComponent('TripleComposer', TRIPLECOMPOSERDEFAULTS);

    var state = {};
    var firstInstanceName; // it will be default triple composer.

    var limitToSuggestedTypes = tripleComposer.limitToSuggestedTypes = Config.limitToSuggestedTypes;

    //var statements = [{
    //    id: 1
    //}];

    var statementChangeStatus = function() {
        EventDispatcher.sendEvent('TripleComposer.statementChange');
    };

    var trackContextualEvent = function(eventString) {
        var eventLabel = "contextualMenu--" + eventString;
        Analytics.track('buttons', 'click', eventLabel);
    };

    var contextualMenuInitialized = false;
    var fixName = function(name) {
        if (typeof name === 'undefined') {
            return firstInstanceName;
        }
        return name;
    };

    var dateSpace = [
        NameSpace.gYear,
        NameSpace.gYearMonth,
        NameSpace.date,
        NameSpace.dateTime
    ];

    // Contextual Menu actions for my items and page items
    var initContextualMenu = function() {
        if (contextualMenuInitialized) {
            return;
        }
        ContextualMenu.addAction({
            type: [
                Config.modules.PageItemsContainer.cMenuType,
                Config.modules.MyItemsContainer.cMenuType,
                Config.modules.SelectorsManager.cMenuType,
                Config.modules.TextFragmentHandler.cMenuType,
                Config.modules.TextFragmentAnnotator.cMenuType,
                Config.modules.ImageHandler.cMenuType
            ],
            name: 'useAsSubject',
            label: 'Use as subject',
            showIf: function(item) {
                return /*!Toolbar.isActiveTemplateMode() &&*/ tripleComposer.canAddItemAsSubject(item);
            },
            priority: 101,
            action: function(item) {
                if (Status.getTemplateModeStatus()) {
                    tripleComposer.addToAllSubject(item);
                } else {
                    tripleComposer.addToSubject(item);
                }
                if (typeof item.image !== 'undefined'){
                    EventDispatcher.sendEvent('TripleComposer.useAsSubjectImg', item);

                } else {
                    EventDispatcher.sendEvent('TripleComposer.useAsSubject', item);

                }
                trackContextualEvent('useAsSubject');
            }
        });

        ContextualMenu.addAction({
            type: [
                Config.modules.PageItemsContainer.cMenuType,
                Config.modules.MyItemsContainer.cMenuType,
                Config.modules.SelectorsManager.cMenuType,
                Config.modules.TextFragmentHandler.cMenuType,
                Config.modules.TextFragmentAnnotator.cMenuType,
                Config.modules.ImageHandler.cMenuType
            ],
            name: 'useAsObject',
            label: 'Use as object',
            showIf: function(item) {
                return /*!Toolbar.isActiveTemplateMode() &&*/ tripleComposer.canAddItemAsObject(item);
            },
            priority: 100,
            action: function(item) {
                tripleComposer.addToObject(item);
                EventDispatcher.sendEvent('TripleComposer.useAsObject', item);
                trackContextualEvent('useAsObject');
            }
        });

        ContextualMenu.addAction({
            type: [
                Config.modules.PredicatesContainer.cMenuType
            ],
            name: 'useAsPredicate',
            label: 'Use as predicate',
            showIf: function(item) {
                if (tripleComposer.canBeUseAsPredicate(item)) {
                    ContextualMenu.modifyHeaderActionByName('useAsPredicate', false);
                } else {
                    ContextualMenu.modifyHeaderActionByName('useAsPredicate', true);
                }
                return true;
            },
            priority: 100,
            action: function(item) {
                tripleComposer.addToPredicate(item);
                EventDispatcher.sendEvent('TripleComposer.useAsPredicate', item);
                trackContextualEvent('useAsPredicate');
            }
        });

        ContextualMenu.addAction({
            name: 'newTriple',
            type: tripleComposer.options.cMenuType,
            label: 'New triple',
            priority: 3,
            showIf: function() {
                return true;
            },
            action: function(statement) {
                angular.element('.pnd-triplecomposer-save').addClass('disabled');
                tripleComposer.addStatement(statement.tripleComposerName);
                statementChangeStatus();
                trackContextualEvent('newTriple');
            }
        });

        ContextualMenu.addAction({
            name: 'duplicateTriple',
            type: tripleComposer.options.cMenuType,
            label: 'Duplicate triple',
            priority: 3,
            showIf: function() {
                return true;
            },
            action: function(statement) {
                var id = parseInt(statement.id, 10);
                tripleComposer.duplicateStatement(id, statement.tripleComposerName);
                statementChangeStatus();
                trackContextualEvent('duplicateTriple');
            }
        });

        ContextualMenu.addAction({
            name: 'removeTriple',
            type: tripleComposer.options.cMenuType,
            label: 'Remove triple',
            priority: 3,
            showIf: function() {
                return true;
            },
            action: function(statement) {
                var id = parseInt(statement.id, 10);
                tripleComposer.removeStatement(id, statement.tripleComposerName);
                if (tripleComposer.isAnnotationComplete()) {
                    angular.element('.pnd-triplecomposer-save').removeClass('disabled');
                }
                statementChangeStatus();
                trackContextualEvent('removeTriple');
            }
        });

        contextualMenuInitialized = true;
    }; // initContextualMenu()


    tripleComposer.initInstance = function(name) {
        if (typeof firstInstanceName === 'undefined') {
            firstInstanceName = name;
        }
        state[name] = {
            nextId: 1,
            statements: [{
                id: 1
            }],
            editMode: false,
            editAnnID: undefined,
            closeAfterOp: false,
            showHeader: true,
            showFooter: true,
            saving: false,
            afterSave: undefined
        };
    };

    tripleComposer.remove = function(name) {
        delete state[name];
    };

    tripleComposer.showHeader = function(newVal, name) {
        name = fixName(name);
        if (typeof newVal === 'boolean') {
            state[name].showHeader = newVal;
        }
        return state[name].showHeader;
    };

    tripleComposer.showFooter = function(newVal, name) {
        name = fixName(name);
        if (typeof newVal === 'boolean') {
            state[name].showFooter = newVal;
        }
        return state[name].showFooter;
    };

    tripleComposer.initContextualMenu = function() {
        initContextualMenu();
    };

    tripleComposer.getStatements = function(name) {
        name = fixName(name);
        if (typeof state[name] === 'undefined') {
            return [];
        }
        return state[name].statements;
        //return statements;
    };

    tripleComposer.isEditMode = function(name) {
        name = fixName(name);
        return typeof state[name] !== 'undefined' ? state[name].editMode : false;
        //return editMode;
    };

    tripleComposer.closeAfterOp = function(name) {
        name = fixName(name);
        if (typeof state[name] === 'undefined') {
            return;
        }
        state[name].closeAfterOp = true;
    };

    tripleComposer.setSaving = function(saving, name) {
        name = fixName(name);
        if (typeof state[name] === 'undefined') {
            return;
        }
        state[name].saving = saving;
    };

    tripleComposer.isSaving = function(name) {
        name = fixName(name);
        if (typeof state[name] === 'undefined') {
            return;
        }
        return state[name].saving;
    };

    tripleComposer.setAfterSave = function(callback, name) {
        name = fixName(name);
        if (typeof state[name] === 'undefined') {
            return;
        }
        state[name].afterSave = callback;
    };

    tripleComposer.closeAfterOpOff = function(name) {
        name = fixName(name);
        if (typeof state[name] === 'undefined') {
            return;
        }
        state[name].closeAfterOp = false;
    };

    tripleComposer.updateVisibility = function(name) {
        name = fixName(name);
        if (typeof state[name].afterSave !== 'undefined') {
            state[name].afterSave();
            state[name].afterSave = undefined;
        }
        else if (state[name].closeAfterOp && Dashboard.isDashboardVisible()) {
            Dashboard.toggle();
        }
        state[name].closeAfterOp = false;
    };

    tripleComposer.getEditAnnID = function(name) {
        name = fixName(name);
        return state[name].editAnnID;
    };

    tripleComposer.setEditMode = function(bool, name) {
        name = fixName(name);
        state[name].editMode = bool;
        for (var i in state[name].statements) {
            if (typeof(state[name].statements[i].scope) !== 'undefined') {
                state[name].statements[i].scope.editMode = bool;
            }
        }
    };

    tripleComposer.addStatement = function(name) {
        name = fixName(name);
        state[name].nextId = state[name].nextId + 1;
        var l = state[name].statements.push({
            id: state[name].nextId
        });
        return state[name].statements[l - 1];
    };

    tripleComposer.removeStatement = function(id, name) {
        name = fixName(name);
        // at least one statetement must be present
        if (state[name].statements.length === 1) {
            state[name].statements[0].scope.wipe();
            return;
        }

        var index = -1;
        state[name].statements.some(function(s, i) {
            if (s.id === id) {
                index = i;
                return true;
            }
        });
        if (index > -1) {
            state[name].statements.splice(index, 1);
        }

        if (state[name].statements.length === 1) {
            if (state[name].statements[0].scope.isStatementEmpty()) {
                ContextualMenu.modifyDisabled('removeTriple', true);
            }
        }
        tripleComposer.log('Try to remove statement at index', index);
    };

    tripleComposer.reset = function(name) {
        name = fixName(name);
        if (typeof state[name] === 'undefined') {
            return;
        }
        state[name].nextId = 1;
        state[name].statements.splice(0, state[name].statements.length);
        state[name].statements.push({
            id: state[name].nextId
        });
        state[name].editMode = false;
        EventDispatcher.sendEvent('TripleComposer.reset');
        tripleComposer.log('statements reset', state[name].statements);
    };

    tripleComposer.wipeNotFixedItems = function(name) {
        name = fixName(name);
        for (var i in state[name].statements) {
            if (!state[name].statements[i].scope.subjectFixed) {
                state[name].statements[i].scope.wipeSubject();
            }
            if (!state[name].statements[i].scope.predicateFixed) {
                state[name].statements[i].scope.wipePredicate();
            }
            if (!state[name].statements[i].scope.objectFixed) {
                state[name].statements[i].scope.wipeObject();
            }
        }
        tripleComposer.log('Wiped not fixed items.');
    };

    // extend arr object with scope property
    tripleComposer.addStatementScope = function(id, scope, name) {
        name = fixName(name);
        var index = -1;
        state[name].statements.some(function(s, i) {
            if (s.id === id) {
                index = i;
                return true;
            }
        });

        if (index > -1) {
            // extend scope with actual mode
            scope.editMode = state[name].editMode;
            state[name].statements[index].scope = scope;
        }

        /*
        if (statements.length > 1) {
            ContextualMenu.modifyDisabled('removeTriple', false);
        }
        */

        tripleComposer.log('statement extended with scope', state[name].statements[index]);
    };

    // duplicate a statement and add it to the statements array
    // this produce the view update and a new <statement> directive
    // is added to the triple composer directive
    tripleComposer.duplicateStatement = function(id, name) {
        name = fixName(name);
        var index = -1;
        state[name].statements.some(function(s, i) {
            if (s.id === id) {
                index = i;
                return true;
            }
        });

        if (index > -1) {
            state[name].nextId = state[name].nextId + 1;
            state[name].statements.push({
                id: state[name].nextId,
                scope: {
                    duplicated: state[name].statements[index].scope.copy()
                }
            });
        }

        if (state[name].statements.length > 1) {
            ContextualMenu.modifyDisabled('removeTriple', false);
        }

    };

    tripleComposer.canAddItemAsSubject = function(item, name) {
        name = fixName(name);
        // search first empty subject
        var index = -1;
        if (typeof state === 'undefined' || typeof state[name] === 'undefined') {
            return false;
        }
        state[name].statements.some(function(s, i) {
            if (typeof s.scope === 'undefined') {
                return false;
            }
            if (!s.scope.subjectFound) {
                index = i;
                return true;
            }
        });
        // all subject are full
        if (index === -1) {
            return false;
        }

        if (limitToSuggestedTypes === false) {
            return true;
        }

        var suggestFound = false,
            predicate = state[name].statements[index].scope.get().predicate;

        if (predicate === null || predicate.suggestedSubjectTypes.length === 0) {
            return true;
        }
        // check if subject type match predicate suggestedSubjectTypes
        item.type.some(function(type) {
            if (predicate.suggestedSubjectTypes.indexOf(type) > -1) {
                suggestFound = true;
                return suggestFound;
            }
        });

        if (!suggestFound) {
            tripleComposer.log('Impossible to add item as Subject: predicate suggestedSubjectTypes not match');
        } else {
            tripleComposer.log('Predicate suggestedSubjectTypes match.');
        }

        return suggestFound;
    };

    tripleComposer.canBeUseAsPredicate = function(item, name) {
        name = fixName(name);
        var subjectCheck = false;
        var objectCheck = false;

        // search first empty prendicate
        var index = -1;
        state[name].statements.some(function(s, i) {
            if (!s.scope.predicateFound) {
                index = i;
                return true;
            }
        });
        // all predicate are full
        if (index === -1) {
            return false;
        }

        var subject = state[name].statements[index].scope.get().subject;
        var object = state[name].statements[index].scope.get().object;
        if (subject === null && object === null) {
            return true;
        }

        if (limitToSuggestedTypes === false) {
            return true;
        }

        if (subject !== null && item.suggestedSubjectTypes.length !== 0) {
            // check if subject type match predicate suggestedSubjectTypes
            item.suggestedSubjectTypes.some(function(type) {
                if (subject.type.indexOf(type) > -1) {
                    subjectCheck = true;
                    return subjectCheck;
                }
            });
        } else {
            subjectCheck = true;
        }

        if (object !== null && item.suggestedObjectTypes.length !== 0) {
            // check if object type match predicate suggestedObjectTypes
            item.suggestedObjectTypes.some(function(type) {
                if (object.type.indexOf(type) > -1) {
                    objectCheck = true;
                    return objectCheck;
                }
            });
        } else {
            objectCheck = true;
        }

        return subjectCheck && objectCheck;
    };

    tripleComposer.canAddItemAsObject = function(item, name) {
        name = fixName(name);
        // search first empty subject
        var index = -1;
        if (typeof state[name] === 'undefined') {
            return false;
        }
        state[name].statements.some(function(s, i) {
            if (!s.scope.objectFound) {
                index = i;
                return true;
            }
        });
        // all object are full
        if (index === -1) {
            return false;
        }

        if (limitToSuggestedTypes === false) {
            return true;
        }

        var suggestFound = false,
            predicate = state[name].statements[index].scope.get().predicate;

        if (predicate === null || predicate.suggestedObjectTypes.length === 0) {
            return true;
        }
        // check if object type match predicate suggestedObjectTypes
        item.type.some(function(type) {
            if (predicate.suggestedObjectTypes.indexOf(type) > -1) {
                suggestFound = true;
                return suggestFound;
            }
        });

        if (!suggestFound) {
            tripleComposer.log('Impossible to add item as Object: predicate suggestedObjectTypes not match');
        } else {
            tripleComposer.log('Predicate suggestedObjectTypes match.');
        }

        return suggestFound;
    };

    tripleComposer.canUseItemInTripleAs = function(item, triple, useAs) {
        if (typeof item === 'undefined' || typeof item.type === 'undefined') {
            return false;
        }
        if (typeof triple === 'undefined') {
            return false;
        }
        if (typeof triple.predicate === 'undefined' || triple.predicate === null || limitToSuggestedTypes === false) {
            return true;
        }

        var res = false;

        switch (useAs) {
            case 'sub':
                if (triple.predicate.suggestedSubjectTypes.length === 0) {
                    res = true;
                    break;
                }
                item.type.some(function(type) {
                    if (triple.predicate.suggestedSubjectTypes.indexOf(type) > -1) {
                        res = true;
                        return res;
                    }
                });
                break;
            case 'obj':
                if (triple.predicate.suggestedObjectTypes.length === 0) {
                    res = true;
                    break;
                }
                item.type.some(function(type) {
                    if (triple.predicate.suggestedObjectTypes.indexOf(type) > -1) {
                        res = true;
                        return res;
                    }
                });
                break;
        }

        return res;
    };

    tripleComposer.openTripleComposer = function() {
        if (!Dashboard.isDashboardVisible()) {
            Dashboard.toggle();
        }
        $rootScope.$$phase || $rootScope.$digest();
        //EventDispatcher.sendEvent('Dashboard.showTab', tripleComposer.options.clientDashboardTabTitle);
        EventDispatcher.sendEvent('TripleComposer.openTripleComposer', tripleComposer.options.clientDashboardTabTitle);
    };

    // Used to add a object from outside of triple composer
    tripleComposer.addToObject = function(item, name) {
        name = fixName(name);
        if (Dashboard.isDashboardVisible() === false) {
            tripleComposer.closeAfterOp(name);
        }
        tripleComposer.openTripleComposer();

        for (var i in state[name].statements) {
            // find the first empty subject
            if (!state[name].statements[i].scope.objectFound) {
                // set it
                state[name].statements[i].scope.setObject(item);
                $rootScope.$$phase || $rootScope.$digest();
                tripleComposer.log('Add item as object: ' + item.label);
                return;
            }
        }
        tripleComposer.log('Error: impossible to add object (all full)');
    };

    // Used to add a predicate from outside of triple composer
    tripleComposer.addToPredicate = function(item, name) {
        name = fixName(name);
        if (Dashboard.isDashboardVisible() === false) {
            tripleComposer.closeAfterOp(name);
        }
        tripleComposer.openTripleComposer();

        for (var i in state[name].statements) {
            // find the first empty subject
            if (!state[name].statements[i].scope.predicateFound) {
                // set it
                state[name].statements[i].scope.setPredicate(item);
                $rootScope.$$phase || $rootScope.$digest();
                tripleComposer.log('Add item as predicate: ' + item.label);
                return;
            }
        }
        tripleComposer.log('Error: impossible to add predicate (all full)');
    };

    // Used to add a subject from outside of triple composer
    tripleComposer.addToSubject = function(item, name) {
        name = fixName(name);
        if (Dashboard.isDashboardVisible() === false) {
            tripleComposer.closeAfterOp(name);
        }
        tripleComposer.openTripleComposer();

        for (var i in state[name].statements) {
            // find the first empty subject
            if (!state[name].statements[i].scope.subjectFound) {
                // set it
                state[name].statements[i].scope.setSubject(item);
                $rootScope.$$phase || $rootScope.$digest();
                tripleComposer.log('Add item as subject: ' + item.label);
                return;
            }
        }
        tripleComposer.log('Error: impossible to add subject (all full)');
    };

    tripleComposer.addToAllSubject = function(item, fixed, name) {
        name = fixName(name);
        // template have always a free subject ?
        for (var i in state[name].statements) {
            state[name].statements[i].scope.setSubject(item, fixed);
        }
        $rootScope.$$phase || $rootScope.$digest();
        tripleComposer.log('Add item: ' + item.uri + 'as subject of all triples');
    };

    tripleComposer.isAnnotationComplete = function(name) {
        name = fixName(name);
        var complete = true;
        state[name].statements.some(function(s) {
            if (s.scope.isMandatory && !s.scope.isStatementComplete()) {
                complete = false;
                return true;
            }
        });
        return complete;
    };

    tripleComposer.isTripleEmpty = function(name) {
        name = fixName(name);
        if (state[name].statements.length > 1 && !state[name].statements[0].scope.templateMode) {
            return false;
        }

        var empty = true;

        state[name].statements.some(function(s) {
            if (!s.scope.isStatementEmpty()) {
                empty = false;
                return;
            }
        });
        return empty;
    };

    tripleComposer.isTripleErasable = function(name) {
        name = fixName(name);
        if (state[name].statements.length === 1) {
            if (!state[name].statements[0].scope.isStatementEmpty()) {
                ContextualMenu.modifyDisabled('removeTriple', false);
            } else {
                ContextualMenu.modifyDisabled('removeTriple', true);
            }
        } else {
            ContextualMenu.modifyDisabled('removeTriple', false);
        }
    };

    tripleComposer.showCurrentTemplate = function(name) {
        name = fixName(name);
        if (typeof state[name] === 'undefined') {
            return;
        }
        tripleComposer.reset(name);
        var i, tmpl = TemplatesExchange.getCurrent();

        if (typeof(tmpl) === 'undefined') {
            return;
        }

        // at least one statement is present
        for (i = 1; i < tmpl.triples.length; i++) {
            tripleComposer.addStatement(name);
        }

        var removeWatcher = $rootScope.$watch(function() {
            return state[name].statements[tmpl.triples.length - 1].scope;
        }, function(newScope) {
            if (typeof(newScope) !== 'undefined') {
                tripleComposer.log('Now the last statement is populated with relative scope');

                // read triples from template and fix items
                for (i = 0; i < state[name].statements.length; i++) {
                    var triple = tmpl.triples[i];

                    if (typeof(triple.predicate) !== 'undefined') {
                        state[name].statements[i].scope.setPredicate(ItemsExchange.getItemByUri(triple.predicate.uri), true);
                    }
                    if (typeof(triple.subject) !== 'undefined') {
                        state[name].statements[i].scope.setSubject(triple.subject.value, true);
                    }
                    if (typeof(triple.object) !== 'undefined') {
                        // TODO check the datatype and use "literal" in the object definiton
                        if (triple.object.type === 'date') {
                            state[name].statements[i].scope.setObject(triple.object, true);
                        } else {
                            state[name].statements[i].scope.setObject(triple.object.value, true);
                        }
                    }
                    // check if the triple is mandatory (if must be completed or if can be skipped when save annotation)
                    if (typeof(triple.mandatory) !== 'undefined') {
                        state[name].statements[i].scope.isMandatory = triple.mandatory;
                    }
                    tripleComposer.log('New statement populated with', triple);
                }
                removeWatcher();
            }
        });

        tripleComposer.log('Showed template: ' + tmpl.label);
    };

    // build all statement relative to the passed annotation
    tripleComposer.editAnnotation = function(annID, name) {
        name = fixName(name);
        // wipe all statements
        tripleComposer.reset(name);
        state[name].editAnnID = annID;

        var ann = AnnotationsExchange.getAnnotationById(annID),
            i;

        var triples = [];
        for (var s in ann.graph) {
            for (var p in ann.graph[s]) {
                for (var o in ann.graph[s][p]) {
                    triples.push({
                        subject: s,
                        predicate: p,
                        object: ann.graph[s][p][o]
                    });
                }
            }
        }

        var l = triples.length;
        // one triple is added by the reset function (defulat is one empty triple)
        for (i = 0; i < l - 1; i++) {
            tripleComposer.addStatement(name);
        }

        var removeWatcher = $rootScope.$watch(function() {
            return state[name].statements[l - 1].scope;
        }, function(newScope) {
            if (typeof(newScope) !== 'undefined') {
                tripleComposer.log('Now the last statement is populated with relative scope');
                for (i = 0; i < state[name].statements.length; i++) {
                    state[name].statements[i].scope.setSubject(ItemsExchange.getItemByUri(triples[i].subject));
                    state[name].statements[i].scope.setPredicate(ItemsExchange.getItemByUri(triples[i].predicate));
                    if (triples[i].object.type === 'uri') {
                        state[name].statements[i].scope.setObject(ItemsExchange.getItemByUri(triples[i].object.value));
                    } else if (triples[i].object.type === 'literal') {
                        if (dateSpace.indexOf(triples[i].object.datatype) !== -1) {
                            var newItem = {
                                type: 'date',
                                datatype: triples[i].object.datatype,
                                value: triples[i].object.value
                            };
                            state[name].statements[i].scope.setObject(newItem);
                        } else {
                            state[name].statements[i].scope.setObject(triples[i].object.value);
                        }
                    } else {
                        tripleComposer.log('Try to add incompatible type of object', triples[i].object);
                    }
                    tripleComposer.setEditMode(true, name);
                    tripleComposer.log('New statement populated with', triples[i]);
                }
                removeWatcher();
            }
        });
    };

    // build the items object used inside http call
    tripleComposer.buildItems = function(name) {
        name = fixName(name);
        var res = {};
        var val;

        state[name].statements.forEach(function(el) {
            var triple = el.scope.get();

            // skip incomplete triple
            if (triple.subject === null || triple.predicate === null || triple.object === null) {
                return;
            }

            // check if items are image fragment
            // in this case add the polygon to the items list
            if (typeof(triple.subject.polygon) !== 'undefined' && typeof(triple.subject.polygonUri) !== 'undefined') {
                // make a polygon rdf object
                res[triple.subject.polygonUri] = {};
                res[triple.subject.polygonUri][NameSpace.item.type] = [{
                    type: 'uri',
                    value: NameSpace.selectors.polygonType
                }];
                val = {
                    type: 'polygon',
                    points: triple.subject.polygon
                };
                res[triple.subject.polygonUri][NameSpace.rdf.value] = [{
                    type: 'literal',
                    value: angular.toJson(val)
                }];
            }
            if (typeof(triple.object.polygon) !== 'undefined' && typeof(triple.object.polygonUri) !== 'undefined') {
                // make a polygon rdf object
                res[triple.object.polygonUri] = {};
                res[triple.object.polygonUri][NameSpace.item.type] = [{
                    type: 'uri',
                    value: NameSpace.selectors.polygonType
                }];
                val = {
                    type: 'polygon',
                    points: triple.object.polygon
                };
                res[triple.object.polygonUri][NameSpace.rdf.value] = [{
                    type: 'literal',
                    value: angular.toJson(val)
                }];
            }

            // add item and its rdf properties
            res[triple.subject.uri] = triple.subject.toRdf();

            res[triple.predicate.uri] = triple.predicate.toRdf();

            // discard literals
            if (typeof(triple.object.uri) !== 'undefined') {
                res[triple.object.uri] = triple.object.toRdf();
                // add object types and its label
                triple.object.type.forEach(function(e, i) {
                    var type = triple.object.type[i];
                    res[type] = {};
                    res[type][NameSpace.rdfs.label] = [{
                        type: 'literal',
                        value: TypesHelper.getLabel(e)
                    }];
                });
            }

            // add subject types and its label
            triple.subject.type.forEach(function(e, i) {
                var type = triple.subject.type[i];
                res[type] = {};
                res[type][NameSpace.rdfs.label] = [{
                    type: 'literal',
                    value: TypesHelper.getLabel(e)
                }];
            });

            // add predicate types and its label
            triple.predicate.type.forEach(function(e, i) {
                var type = triple.predicate.type[i];
                res[type] = {};
                res[type][NameSpace.rdfs.label] = [{
                    type: 'literal',
                    value: TypesHelper.getLabel(e)
                }];
            });

        });

        return res;
    };

    tripleComposer.buildObject = function(item, objType) {
        if (typeof(item) === 'string' && typeof(objType) === 'undefined') {
            // literal
            return {
                type: 'literal',
                datatype: NameSpace.string,
                value: item
            };
        } else if (typeof(objType) !== 'undefined') {
            // date
            return {
                type: 'literal',
                datatype: objType,
                value: item
            };
        } else {
            // standard item
            return {
                type: 'uri',
                value: item.uri
            };
        }
    };

    tripleComposer.buildTargets = function(name) {
        name = fixName(name);
        var res = [];

        state[name].statements.forEach(function(el) {
            var triple = el.scope.get();

            // skip incomplete triple
            if (triple.subject === null || triple.predicate === null || triple.object === null) {
                return;
            }

            if (triple.subject.isTextFragment() || triple.subject.isImage() || triple.subject.isImageFragment()) {
                if (res.indexOf(triple.subject.uri) === -1) {
                    res.push(triple.subject.uri);
                }
            }
            if (triple.predicate.isTextFragment() || triple.predicate.isImage() || triple.predicate.isImageFragment()) {
                if (res.indexOf(triple.predicate.uri) === -1) {
                    res.push(triple.predicate.uri);
                }
            }

            if (typeof(triple.object) !== 'string') {
                if (triple.object.isTextFragment() || triple.object.isImage() || triple.object.isImageFragment()) {
                    if (res.indexOf(triple.object.uri) === -1) {
                        res.push(triple.object.uri);
                    }
                }
            }
        });

        return res;
    };

    tripleComposer.buildGraph = function(name) {
        name = fixName(name);
        var res = {};

        state[name].statements.forEach(function(el) {
            var triple = el.scope.get();

            // skip incomplete triple
            if (triple.subject === null || triple.predicate === null || triple.object === null) {
                return;
            }

            if (typeof(res[triple.subject.uri]) === 'undefined') {
                // subject uri not exist (happy it's easy)
                res[triple.subject.uri] = {};
                // predicate uri not exist
                res[triple.subject.uri][triple.predicate.uri] = [tripleComposer.buildObject(triple.object, triple.objType)];
            } else {
                // subject uri already exists

                if (typeof(res[triple.subject.uri][triple.predicate.uri]) === 'undefined') {
                    // predicate uri not exist (happy it's easy)
                    res[triple.subject.uri][triple.predicate.uri] = [tripleComposer.buildObject(triple.object, triple.objType)];
                } else {

                    // predicate uri already exists
                    var u = triple.object.uri,
                        arr = res[triple.subject.uri][triple.predicate.uri];
                    // search object
                    var found = arr.some(function(o) {
                        return angular.equals(o.value, u);
                    });
                    // object not eqaul (happy it's easy)
                    if (!found) {
                        arr.push(tripleComposer.buildObject(triple.object, triple.objType));
                    }

                }

            }

        });

        return res;
    };

    // When all modules have been initialized, services are up, Config are setup etc..
    EventDispatcher.addListener('Client.boot', function() {
        initContextualMenu();
    });

    EventDispatcher.addListeners(['Client.hide', 'AnnotationsCommunication.deleteAnnotation'], function() {
        tripleComposer.reset();
    });

    return tripleComposer;
});