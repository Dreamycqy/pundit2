/*global PUNDITVERSION, escape*/

angular.module('Pundit2.Toolbar')

.controller('ToolbarCtrl', function($scope, $rootScope, $modal, $http, $window, NameSpace, Config,
    Toolbar, SelectorsManager, Fp3, MyPundit, Dashboard, TripleComposer, AnnotationSidebar,
    Annomatic, ResourcePanel, NotebookExchange, NotebookCommunication, TemplatesExchange,
    Analytics, PageHandler, EventDispatcher, $timeout, $interval, Keyboard, Status) {

    var progressBar = angular.element('.pnd-progress-bar');

    $scope.dropdownTemplate = "src/ContextualMenu/dropdown.tmpl.html";
    $scope.dropdownTemplateMyNotebook = "src/Toolbar/myNotebooksDropdown.tmpl.html";
    $scope.dropdownTemplateTemplates = "src/Toolbar/templatesDropdown.tmpl.html";

    $scope.isAnnotationSidebarExpanded = false;
    $scope.isAnnotationFiltersActive = false;
    $scope.isDashboardVisible = false;

    $scope.isUserLogged = false;

    $scope.askThePundit = Config.askThePundit;
    $scope.myNotebooks = Toolbar.options.myNotebooks;
    $scope.dashboard = false;
    $scope.sidebar = false;
    $scope.menuCustom = false;
    $scope.menuCustomBtn = false;
    $scope.menuCustomDropdown = [];
    $scope.menuCustomBtn = [];
    $scope.needsProgressBar = false;
    $scope.progress = '0%';

    var progressState = {
        'interval': undefined,
        'current': 0,
        'dest': 0
    };

    var menuCustom = Toolbar.options.menuCustom;

    if (menuCustom.active) {
        $scope.menuCustom = true;
        if (menuCustom.dropdown) {
            angular.forEach(menuCustom.list, function(value, key) {
                $scope.menuCustomDropdown.push({
                    text: key,
                    click: function() {
                        $scope.openUrl(value);
                    }
                });
            });
        } else {
            $scope.menuCustomBtn = menuCustom.list;
        }
    }

    if (Config.useOnlyTemplateMode) {
        angular.element(".pnd-toolbar-template-mode-button").addClass('pnd-not-clickable');
    }
    if (Config.modules.Dashboard.active) {
        $scope.dashboard = true;
    }
    if (Config.modules.AnnotationSidebar.active) {
        $scope.sidebar = true;
    }

    var lodLive = false;
    if (typeof(Config.lodLive) !== 'undefined' && Config.lodLive.active) {
        lodLive = true;
    }

    $scope.myNoteboockSigninClick = function() {
        $scope.login('toolbar--myNotebooks--login');
    };

    $scope.loginButtonClick = function($event) {
        $scope.login('toolbar--login', $event);
    };

    $scope.closePopover = function() {
        MyPundit.closeLoginPopover();
    };

    $scope.login = function(trackingLoginName) {
        ResourcePanel.hide();
        MyPundit.login();
        Analytics.track('buttons', 'click', trackingLoginName);
        return;


        //ResourcePanel.hide();
        //MyPundit.login();
        //if (trackingLoginName === undefined) {
        //    trackingLoginName = 'toolbar--otherLogin';
        //}

    };

    var logout = function() {
        ResourcePanel.hide();
        MyPundit.logout();
        Analytics.track('buttons', 'click', 'toolbar--logout');
    };

    var editYourProfile = function() {
        ResourcePanel.hide();
        MyPundit.editProfile();
        Analytics.track('buttons', 'click', 'toolbar--editProfile');
    };

    var lodliveOpen = function() {
        if (MyPundit.isUserLogged()) {
            var userData = MyPundit.getUserData();
            $window.open(Config.lodLive.baseUrl + Config.pndPurl + 'user/' + userData.id, '_blank');
            Analytics.track('buttons', 'click', 'toolbar--openYourGraph');
        }
    };

    $scope.askThePunditClick = function() {
        Analytics.track('buttons', 'click', 'toolbar--askThePundit--' + ($scope.isUserLogged ? 'logged' : 'anonymous'));
    };

    // modal
    var infoModalScope = $rootScope.$new(),
        sendModalScope = $rootScope.$new();

    var infoModal = $modal({
        container: "[data-ng-app='Pundit2']",
        templateUrl: 'src/Core/Templates/info.modal.tmpl.html',
        show: false,
        backdrop: 'static',
        scope: infoModalScope,
        keyboard: false
    });

    var sendModal = $modal({
        container: "[data-ng-app='Pundit2']",
        templateUrl: 'src/Core/Templates/send.modal.tmpl.html',
        show: false,
        backdrop: 'static',
        scope: sendModalScope,
        keyboard: false
    });

    infoModalScope.titleMessage = "About Pundit";
    infoModalScope.info = [{
            label: "Pundit version: ",
            value: PUNDITVERSION.version
        }, {
            label: "Annotation server URL: ",
            value: NameSpace.as
        }, {
            label: "Korbo basket: ",
            value: "-"
        }, // is always defined? read from korbo selector instance? if i have more than one instance}?
        {
            label: "Contact the Pundit team:",
            value: "punditdev@netseven.it"
        }, {
            label: "License: ",
            value: "http://url3.com"
        }, {
            label: "Credits: ",
            value: "-"
        }
    ];

    infoModalScope.links = [{
        label: "Developed by:",
        linkLabel: "Net7 srl",
        ref: "http://www.netseven.it"
    }];
    if (Config.confURL !== 'local') {
        infoModalScope.links.push({
            label: 'Configuration file',
            linkLabel: Config.confURL,
            ref: Config.confURL
        });
    }

    if (Config.vocabularies.length > 0) {
        infoModalScope.info.push({
            label: "Predicates vocabularies: ",
            value: Config.vocabularies.toString()
        });
    } else if (Config.useBasicRelations) {
        infoModalScope.info.push({
            label: "Predicates vocabularies: ",
            value: "Pundit default basic relations"
        });
    }

    var str = "",
        providers = SelectorsManager.getActiveSelectors();
    for (var p in providers) {
        str += " " + providers[p].config.label;
    }
    infoModalScope.info.push({
        label: "Providers:",
        value: str
    });

    sendModalScope.titleMessage = "Need help? Contact us!";
    sendModalScope.text = {
        msg: "",
        subject: ""
    };

    var sendMail = function(subject, body) {
        var user = MyPundit.getUserData();
        var link = "mailto:punditbug@netseven.it" +
            "?cc=" +
            "&subject=" + escape(subject) +
            "&body=" + escape(body) +
            "%0A%0A" + "Pundit version: " + PUNDITVERSION.version +
            "%0A%0A" + "Configuration file: " + Config.confURL +
            "%0A" + "Web page: " + document.URL +
            "%0A" + "Broswer info: " + window.navigator.userAgent +
            "%0A%0A" + "User openid: " + user.openid +
            "%0A" + "User uri: " + user.uri +
            "%0A" + "User name: " + user.fullName +
            "%0A" + "User mail: " + user.email;

        //window.location.href = link;
        window.open(link);
    };

    sendModalScope.send = function() {
        // send a mail
        sendMail(sendModalScope.text.subject, sendModalScope.text.msg);
        sendModal.hide();
        Analytics.track('buttons', 'click', 'toolbar--reportBug--send');
    };

    sendModalScope.cancel = function() {
        sendModal.hide();
        if (typeof modalEscapeHandler !== 'undefined') {
            Keyboard.unregisterHandler(modalEscapeHandler);
            modalEscapeHandler = undefined;
        }
        Analytics.track('buttons', 'click', 'toolbar--reportBug--cancel');
    };

    // found bug btn
    // var removeWatch;
    infoModalScope.send = function() {
        // open a second modal to report a bug
        sendModal.$promise.then(function() {

            sendModalScope.text.msg = "";
            sendModalScope.text.subject = "";
            sendModal.show();

            var sendBtn = angular.element('.pnd-send-modal-send');
            $scope.$watch(function() {
                return sendModalScope.text.subject;
            }, function(text) {
                if (text.length > 2) {
                    sendBtn.removeClass('disabled');
                } else {
                    sendBtn.addClass('disabled');
                }
            }, true);

        });
    };

    // close btn
    infoModalScope.close = function() {
        infoModal.hide();
        if (typeof modalEscapeHandler !== 'undefined') {
            Keyboard.unregisterHandler(modalEscapeHandler);
            modalEscapeHandler = undefined;
        }
    };

    var modalEscapeHandler;
    var addModalEscapeHandler = function(callback) {
        modalEscapeHandler = Keyboard.registerHandler('ToolbarController', {
            keyCode: 27,
            ignoreOnInput: false,
            stopPropagation: true
        }, callback);
    };

    // open info modal
    var showInfo = function() {
        ResourcePanel.hide();
        addModalEscapeHandler(function() {
            infoModalScope.close();
        });
        infoModal.$promise.then(infoModal.show);
        Analytics.track('buttons', 'click', 'toolbar--aboutPundit');
    };

    // open bug modal
    var showBug = function() {
        ResourcePanel.hide();
        addModalEscapeHandler(function() {
            sendModalScope.cancel();
        });
        infoModalScope.send();
        Analytics.track('buttons', 'click', 'toolbar--reportBug');
    };

    $scope.isAnnomaticRunning = false;

    $scope.canUsePageAsSubject = true;

    // Watch Annomatic status
    $scope.$watch(function() {
        return Annomatic.isRunning();
    }, function(currentState) {
        $scope.isAnnomaticRunning = currentState;
    });

    // Watch Sidebar status
    $scope.$watch(function() {
        return AnnotationSidebar.isAnnotationSidebarExpanded();
    }, function(currentState) {
        $scope.isAnnotationSidebarExpanded = currentState;
    });

    $scope.$watch(function() {
        return AnnotationSidebar.needToFilter();
    }, function(currentState) {
        $scope.isAnnotationFiltersActive = currentState;
    });

    // Watch Toolbar status
    $scope.$watch(function() {
        return Dashboard.isDashboardVisible();
    }, function(currentState) {
        $scope.isDashboardVisible = currentState;
    });

    $scope.errorMessageDropdown = Toolbar.getErrorMessageDropdown();

    $scope.userNotLoggedDropdown = [{
        text: 'Please log in to select the notebook to store your annotations',
        header: true
    }, {
        text: 'Log in',
        click: $scope.myNoteboockSigninClick
    }];

    $scope.infoDropdown = [{
        text: 'About Pundit',
        click: showInfo
    }, {
        text: 'Help',
        click: showBug
    }, ];
    if (Fp3.options.active) {
        $scope.infoDropdown.push({
            text: Fp3.options.label,
            click: Fp3.post
        });
    }

    if (lodLive) {
        $scope.userLoggedInDropdown = [{
            text: 'Open your graph',
            click: lodliveOpen
        }, {
            text: 'Edit your profile',
            click: editYourProfile
        }, {
            text: 'Log out',
            click: logout
        }];
    } else {
        $scope.userLoggedInDropdown = [{
            text: 'Edit your profile',
            click: editYourProfile
        }, {
            text: 'Log out',
            click: logout
        }];
    }


    var myNotebooks;
    // TODO add a function on click that add this watcher
    // when drodown is showed and remove when dropdown is closed
    $scope.$watch(function() {
        return NotebookExchange.getMyNotebooks();
    }, function(ns) {
        // update all notebooks array and display new notebook
        myNotebooks = ns;
        updateMyNotebooks();
    }, true);

    $scope.currentNotebookLabel = typeof MyPundit.getInfoCookie().notebookLabel === 'undefined' ? "Loading..." : MyPundit.getInfoCookie().notebookLabel;
    $scope.$watch(function() {
        return NotebookExchange.getCurrentNotebooks();
    }, function(newCurr) {
        if (typeof(newCurr) !== "undefined") {
            updateMyNotebooks();
            $scope.currentNotebookLabel = newCurr.label;
            MyPundit.setInfoCookie({
                notebookLabel: newCurr.label
            });
        }
    });

    $scope.userNotebooksDropdown = [{
        text: 'Please select the notebook you want to use',
        header: true
    }];

    var updateMyNotebooks = function() {
        var notebooks = myNotebooks;
        var j = 1;
        for (var i = 0; i < notebooks.length; i++) {
            $scope.userNotebooksDropdown[j] = {
                text: notebooks[i].label,
                currentNotebook: function() {
                    var current = NotebookExchange.getCurrentNotebooks();
                    if (typeof(current) !== "undefined" && notebooks[i].id === current.id) {
                        return true;
                    } else {
                        return false;
                    }
                }(),
                visibility: notebooks[i].visibility,
                click: function(_i) {
                    return function() {
                        NotebookCommunication.setCurrent(notebooks[_i].id);
                        Analytics.track('buttons', 'click', 'toolbar--userNotebook');
                    };
                }(i)
            };
            j++;
        }
    };

    // check configuration object to see if templates are enabled
    $scope.useTemplates = Config.useTemplates;

    // configured templates are empty then we remove the relative buttons
    if (Config.templates.length === 0) {
        $scope.useTemplates = false;
    }

    if ($scope.useTemplates) {

        $scope.userTemplateDropdown = [{
            text: 'Select the template you wish to use',
            header: true
        }];

        if (typeof MyPundit.getInfoCookie().templateId !== 'undefined') {
            TemplatesExchange.setCurrent(MyPundit.getInfoCookie().templateId);
        }
        if (typeof MyPundit.getInfoCookie().templateColor !== 'undefined') {
            $scope.currentTemplateColor = MyPundit.getInfoCookie().templateColor;
        }
        $scope.currentTemplateLabel = typeof MyPundit.getInfoCookie().templateLabel === 'undefined' ? "Loading..." : MyPundit.getInfoCookie().templateLabel;

        $scope.$watch(function() {
            return TemplatesExchange.getTemplates().length;
        }, function() {
            updateTemplates();
        });

        $scope.$watch(function() {
            return TemplatesExchange.getCurrent();
        }, function(newCurr) {
            if (typeof(newCurr) !== "undefined") {
                updateTemplates();
                $scope.currentTemplateLabel = newCurr.label;
                $scope.currentTemplateColor = newCurr.hasColor;
                MyPundit.setInfoCookie({
                    templateLabel: newCurr.label,
                    templateId: newCurr.id,
                    templateColor: newCurr.hasColor
                });
            }
        });

        // TODO if the template mode can change only by click on the toolbar btn
        // remove this watch and do this action inside the toggleTemplateMode function
        var templateModeSpan = angular.element('.pnd-toolbar-template-mode-button span'),
            templateSwitchSpan = angular.element('.pnd-toolbar-template-menu-button span');
        $scope.$watch(function() {
            return Toolbar.isActiveTemplateMode();
        }, function(val) {
            if (val) {
                templateModeSpan.removeClass('pnd-toolbar-not-active-element');
                templateSwitchSpan.removeClass('pnd-toolbar-not-active-element');
            } else {
                templateModeSpan.addClass('pnd-toolbar-not-active-element');
                templateSwitchSpan.addClass('pnd-toolbar-not-active-element');
            }
        });

        var updateTemplates = function() {
            var templates = TemplatesExchange.getTemplates();
            var j = 1;
            for (var i = 0; i < templates.length; i++) {
                $scope.userTemplateDropdown[j] = {
                    text: templates[i].label,
                    hasColor: templates[i].hasColor,
                    currentTemplate: function() {
                        var current = TemplatesExchange.getCurrent();
                        if (typeof(current) !== "undefined" && templates[i].id === current.id) {
                            return true;
                        } else {
                            return false;
                        }
                    }(),
                    click: function(_i) {
                        return function() {
                            TemplatesExchange.setCurrent(templates[_i].id);
                            if (Toolbar.isActiveTemplateMode()) {
                                TripleComposer.showCurrentTemplate();
                                // disable save btn
                                angular.element('.pnd-triplecomposer-save').addClass('disabled');
                            }
                            Analytics.track('buttons', 'click', 'toolbar--userTemplate');
                        };
                    }(i)
                };
                j++;
            }
        };

    } // end-if-use-templates

    $scope.userData = {};
    // listener for user status
    // when user is logged in, set flag isUserLogged to true
    $scope.$watch(function() {
        return MyPundit.isUserLogged();
    }, function(newStatus) {
        $scope.isUserLogged = newStatus;
        $scope.userData = MyPundit.getUserData();
    });

    // Handles userdata changes after edit profile, maybe we can remove the above
    // $watch.
    EventDispatcher.addListener('MyPundit.isUserLogged', function(e) {
        $scope.isUserLogged = e.args;
        $scope.userData = MyPundit.getUserData();
    });

    // Handle changes in triple composer.
    EventDispatcher.addListeners(['TripleComposer.statementChanged', 'TripleComposer.reset'], function(e) {
        if (e.name === 'TripleComposer.reset') {
            $scope.canUsePageAsSubject = true;
            return;
        }
        var item = PageHandler.getPageItem();
        $scope.canUsePageAsSubject = TripleComposer.canAddItemAsSubject(item);
    });

    // return true if no errors are occured --> status button ok must be visible
    $scope.showStatusButtonOk = function() {
        return !Toolbar.getErrorShown() && !Toolbar.isLoading();
    };

    // return true if an error is occured --> status button error must be visible
    $scope.showStatusButtonError = function() {
        return Toolbar.getErrorShown();
    };

    $scope.showStatusButtonLoading = function() {
        return Toolbar.isLoading() && !Toolbar.getErrorShown();
    };

    // return true if user is not logged in --> login button must be visible
    $scope.showLogin = function() {
        return $scope.isUserLogged === false;
    };

    // return true if user is logged in --> user button must be visible
    $scope.showUserButton = function() {
        return $scope.isUserLogged === true;
    };

    // return true if user is logged in --> dashboard button is active
    $scope.isDashboardActive = function() {
        return $scope.isUserLogged === true;
    };

    $scope.annotateWebPage = function() {
        if (!$scope.canUsePageAsSubject) {
            return;
        }
        var item = PageHandler.getPageItem();
        TripleComposer.addToSubject(item);
    };

    $scope.toggleTemplateMode = function() {
        if (TripleComposer.isEditMode() || $scope.isAnnomaticRunning) {
            return;
        }
        ResourcePanel.hide();
        Analytics.track('buttons', 'click', 'toolbar--templateActivation--' + (Toolbar.isActiveTemplateMode() ? 'deactivate' : 'activate'));
        Toolbar.toggleTemplateMode();
    };

    $scope.onClickTemplateDropdown = function() {
        MyPundit.closeLoginPopover();
        Analytics.track('buttons', 'click', 'toolbar--templateList');
        ResourcePanel.hide();
    };

    $scope.infoClickHandler = function() {
        MyPundit.closeLoginPopover(); //TODO hujiawei 删除点击状态按钮的菜单列表功能
    };

    $scope.onClickNotebookDropdown = function() {
        MyPundit.closeLoginPopover();
        Analytics.track('buttons', 'click', 'toolbar--notebooks--' + ($scope.isUserLogged ? 'logged' : 'anonymous'));
    };

    // return true if user is logged in --> template menu is active
    $scope.isTemplateMenuActive = function() {
        return $scope.isUserLogged === true;
    };

    // return true if user is logged in --> notebook menu is active
    $scope.isNotebookMenuActive = function() {
        return $scope.isUserLogged === true;
    };

    // get Ask the Pundit link
    $scope.getAskLink = function() {
        return Toolbar.getAskLink();
    };

    $scope.dashboardClickHandler = function() {
        if (!$scope.isAnnomaticRunning) {
            ResourcePanel.hide();
            Analytics.track('buttons', 'click', 'toolbar--dashboard--' + (Dashboard.isDashboardVisible() ? 'closed' : 'open'));
            TripleComposer.closeAfterOpOff();
            Dashboard.toggle();
        }
    };

    $scope.annotationsClickHandler = function() {
        ResourcePanel.hide();
        Analytics.track('buttons', 'click', 'toolbar--annotationsSidebar--' + (AnnotationSidebar.isAnnotationSidebarExpanded() ? 'closed' : 'open'));
        AnnotationSidebar.toggle();
    };

    $scope.openUrl = function(url) {
        $window.open(url, '_self');
    };

    EventDispatcher.addListener('Status.progress', function(evt) {
        progressBar.css('opacity', 1);
        $scope.needsProgressBar = evt.args.needsProgressBar;
        progressState.dest = evt.args.progress;
        $scope.progress = evt.args.progress + '%';
        if (evt.args.progress >= 100) {
            $timeout(function() {
                progressBar.animate({
                    'opacity': 0
                }, 500, function() {
                    $scope.needsProgressBar = false;
                    Status.resetProgress();
                });
            }, 1000);
        }
        /*
        if (typeof progressState.interval === 'undefined') {
            progressState.interval = $interval(function(){
                $scope.progress = progressState.current + '%';
                progressState.current ++;
                if (progressState.current >= progressState.dest) {
                    progressState.current = progressState.dest
                    $interval.cancel(progressState.interval);
                    progressState.interval = undefined;
                    $scope.progress = progressState.current + '%';
                }
            }, 10);
        }
        */
    });

    EventDispatcher.addListener('Status.progressReset', function() {
        $scope.progress = 0 + '%';
        progressBar.css('opacity', 0);
    });

    EventDispatcher.addListener('Client.hide', function( /*e*/ ) {
        MyPundit.closeLoginPopover();
        angular.element('.dropdown-menu').dropdown("toggle");
    });

    $timeout(function() {
        angular.element('#pundit2_preload').remove();
    }, 1000);
});
