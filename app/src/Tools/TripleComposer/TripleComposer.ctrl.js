angular.module('Pundit2.TripleComposer')

.controller('TripleComposerCtrl', function($rootScope, $scope, $http, $q, $timeout, NameSpace, EventDispatcher,
    MyPundit, Toolbar, TripleComposer, AnnotationsCommunication, AnnotationsExchange, TemplatesExchange, Analytics) {

    // statements objects are extend by this.addStatementScope()
    // the function is called in the statement directive link function
    $scope.statements = TripleComposer.getStatements();

    $scope.showHeader = function() {
        return TripleComposer.showHeader();
    }

    $scope.showFooter = function() {
        return TripleComposer.showFooter();
    }

    $scope.saving = false;
    $scope.textMessage = TripleComposer.options.savingMsg;

    $scope.headerMessage = "Create new annotation";

    $scope.editMode = false;
    $scope.$watch(function() {
        return TripleComposer.isEditMode();
    }, function(editMode) {
        if (editMode) {
            $scope.headerMessage = "Edit and update your annotation";
        } else {
            $scope.headerMessage = "Create new annotation";
        }
        $scope.editMode = editMode;
    });

    $scope.templateMode;
    var lastHeader;
    $scope.$watch(function() {
        return Toolbar.isActiveTemplateMode();
    }, function(newVal, oldVal) {
        $scope.templateMode = newVal;
        if (newVal) {
            lastHeader = $scope.headerMessage;
            $scope.headerMessage = "Complete your annotation and save!";
        } else if (newVal !== oldVal) {
            $scope.headerMessage = lastHeader;
        }
    });

    var loadShortMsg = "Loading",
        successShortMsg = "Saved",
        warnShortMsg = "Warning!";

    var loadIcon = "pnd-icon-refresh pnd-icon-spin",
        successIcon = "pnd-icon-check-circle",
        warnIcon = "pnd-icon-exclamation-circle";

    var loadMessageClass = "pnd-message",
        successMessageClass = "pnd-message-success",
        warnMessageClass = "pnd-message-warning";

    $scope.shortMessagge = loadShortMsg;
    $scope.savingIcon = loadIcon;
    $scope.shortMessageClass = loadMessageClass;

    this.removeStatement = function(id) {
        id = parseInt(id, 10);
        TripleComposer.removeStatement(id);
        if (TripleComposer.isAnnotationComplete()) {
            angular.element('.pnd-triplecomposer-save').removeClass('disabled');
        }
    };

    this.addStatementScope = function(id, scope) {
        id = parseInt(id, 10);
        TripleComposer.addStatementScope(id, scope);
    };

    this.duplicateStatement = function(id) {
        id = parseInt(id, 10);
        TripleComposer.duplicateStatement(id);
    };

    this.isAnnotationComplete = function() {
        if (TripleComposer.isAnnotationComplete()) {
            angular.element('.pnd-triplecomposer-save').removeClass('disabled');
        }
    };

    this.isTripleErasable = function() {
        TripleComposer.isTripleErasable();
    };

    $scope.isAnnotationErasable = function() {
        return !TripleComposer.isTripleEmpty();
    };

    $scope.onClickAddStatement = function() {
        angular.element('.pnd-triplecomposer-save').addClass('disabled');
        TripleComposer.addStatement();
    };

    $scope.cancel = function() {
        if ($scope.editMode) {
            angular.element('.pnd-triplecomposer-save').addClass('disabled');
            TripleComposer.reset();
            TripleComposer.setEditMode(false);
            TripleComposer.updateVisibility();
        }

        EventDispatcher.sendEvent('Pundit.changeSelection');
    };

    $scope.resetComposer = function() {
        angular.element('.pnd-triplecomposer-save').addClass('disabled');
        if ($scope.templateMode) {
            TripleComposer.wipeNotFixedItems();
            return;
        }
        TripleComposer.reset();
        EventDispatcher.sendEvent('Pundit.changeSelection');

        var eventLabel = getHierarchyString();
        eventLabel += "--resetComposer";
        Analytics.track('buttons', 'click', eventLabel);
    };

    $scope.editAnnotation = function() {
        var annID = TripleComposer.getEditAnnID();

        if (typeof(annID) !== 'undefined') {

            var savePromise = initSavingProcess();
            angular.element('.pnd-triplecomposer-cancel').addClass('disabled');

            AnnotationsCommunication.editAnnotation(
                annID,
                TripleComposer.buildGraph(),
                TripleComposer.buildItems(),
                TripleComposer.buildTargets()
            ).then(function() {
                stopSavingProcess(
                    savePromise,
                    TripleComposer.options.notificationSuccessMsg,
                    TripleComposer.options.notificationMsgTime,
                    false
                );
            }, function() {
                stopSavingProcess(
                    savePromise,
                    TripleComposer.options.notificationErrorMsg,
                    TripleComposer.options.notificationMsgTime,
                    true
                );
            });
        }
    };

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

        return eventLabel;
    }

    // update triple composer messagge then after "time" (ms)
    // restore default template content
    var updateMessagge = function(msg, time, err) {
        $scope.textMessage = msg;

        if (err) {
            $scope.shortMessagge = warnShortMsg;
            $scope.savingIcon = warnIcon;
            $scope.shortMessageClass = warnMessageClass;
        } else {
            $scope.shortMessagge = successShortMsg;
            $scope.savingIcon = successIcon;
            $scope.shortMessageClass = successMessageClass;
        }

        $timeout(function() {
            TripleComposer.setEditMode(false);
            angular.element('.pnd-triplecomposer-cancel').removeClass('disabled');
            $scope.saving = false;
            TripleComposer.updateVisibility();
        }, time);
    };

    var promiseResolved;
    var initSavingProcess = function() {
        // disable save button
        angular.element('.pnd-triplecomposer-save').addClass('disabled');

        // init save process showing saving message
        $scope.textMessage = TripleComposer.options.savingMsg;
        $scope.shortMessagge = loadShortMsg;
        $scope.savingIcon = loadIcon;
        $scope.shortMessageClass = loadMessageClass;

        promiseResolved = false;
        //savePromise = $timeout(function(){ promiseResolved = true; }, TripleComposer.options.savingMsgTime);
        $scope.saving = true;
        return $timeout(function() {
            promiseResolved = true;
        }, TripleComposer.options.savingMsgTime);
    };

    var stopSavingProcess = function(promise, msg, msgTime, err) {

        // if you have gone at least 500ms
        if (promiseResolved) {
            updateMessagge(msg, msgTime, err);
        } else {
            promise.then(function() {
                updateMessagge(msg, msgTime, err);
            });
        }

        if ($scope.templateMode) {
            TripleComposer.wipeNotFixedItems();
            return;
        }

        TripleComposer.reset();
    };

    $scope.saveAnnotation = function() {

        var promise = $q.defer();

        MyPundit.login().then(function(logged) {

            if (logged) {
                var abort = $scope.statements.some(function(el) {
                    var t = el.scope.get();
                    // if the triple is mandatory it must be completed before saving annotation
                    // if the triple is not mandatory it can be saved with incomplete triples (this triples is skipped)
                    if (el.scope.isMandatory && (t.subject === null || t.predicate === null || t.object === null)) {
                        return true;
                    }
                });

                if (abort) {
                    // try to save incomplete annotation
                    promise.reject();
                    return;
                }

                var savePromise = initSavingProcess();

                var httpPromise;
                if ($scope.templateMode) {
                    httpPromise = AnnotationsCommunication.saveAnnotation(
                        TripleComposer.buildGraph(),
                        TripleComposer.buildItems(),
                        TripleComposer.buildTargets(),
                        TemplatesExchange.getCurrent().id);
                } else {
                    httpPromise = AnnotationsCommunication.saveAnnotation(
                        TripleComposer.buildGraph(),
                        TripleComposer.buildItems(),
                        TripleComposer.buildTargets());
                }

                httpPromise.then(function() {
                    // resolved
                    stopSavingProcess(
                        savePromise,
                        TripleComposer.options.notificationSuccessMsg,
                        TripleComposer.options.notificationMsgTime,
                        false
                    );
                    promise.resolve();
                }, function() {
                    // rejected
                    TripleComposer.closeAfterOpOff();
                    stopSavingProcess(
                        savePromise,
                        TripleComposer.options.notificationErrorMsg,
                        TripleComposer.options.notificationMsgTime,
                        true
                    );
                    promise.resolve();
                });

            } //end if logged
        }); // end my pundit login

        EventDispatcher.sendEvent('Pundit.changeSelection');

        var eventLabel = getHierarchyString();
        eventLabel += "--saveAnnotation";
        Analytics.track('buttons', 'click', eventLabel);

        return promise.promise;

    }; // end save function

    EventDispatcher.addListener('ResourcePanel.toggle', function(e) {
        var isResourcePanelOpend = e.args;
        if (isResourcePanelOpend) {
            angular.element('.pnd-triplecomposer-statements-container').addClass('pnd-triplecomposer-statement-not-scroll');
        } else {
            angular.element('.pnd-triplecomposer-statements-container').removeClass('pnd-triplecomposer-statement-not-scroll');
        }
    });

    EventDispatcher.addListener('Annotators.saveAnnotation', function() {
        var uncomplete = $scope.statements.some(function(el) {
            var t = el.scope.get();
            if (t.subject === null || t.predicate === null || t.object === null) {
                return true;
            }
        });
        if (uncomplete) {
            TripleComposer.openTripleComposer();
        } else {
            $scope.saveAnnotation().catch(function() {
                // incomplete annotation
                // open triple composer to tell user to complete the annotation
                TripleComposer.openTripleComposer();
            });
        }

    });

});