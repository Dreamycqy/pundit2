angular.module('Pundit2.Core')

.constant('MYPUNDITDEFAULTS', {
    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#MyPundit
     *
     * @description
     * `object`
     *
     * Configuration for MyPundit module
     */

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#MyPundit.loginPollTimerMS
     *
     * @description
     * `number`
     *
     * Time interval for checking if user is logged in or not.
     * Time is expressed in milliseconds.
     * When login modal is open and user is getting log in, each <loginPollTimerMS> milliseconds server check if user is logged in or not
     *
     * Default value:
     * <pre> loginPollTimerMS: 1000 </pre>
     */
    loginPollTimerMS: 1000,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#MyPundit.loginModalCloseTimer
     *
     * @description
     * `number`
     *
     * Time interval for closing login popup window.
     * Time is expressed in milliseconds.
     * After user open login popup window, after <loginModalCloseTimer> millisecond,
     * popup will close automatically
     *
     * Default value:
     * <pre> loginModalCloseTimer: 300000 </pre>
     */
    loginModalCloseTimer: 300000, // 5 minutes

    userCookieExpireTime: 1000 * 60 * 30,

    popoverLoginURL: 'http://dev.thepund.it/connect/index.php'
})

/**
 * @ngdoc service
 * @name MyPundit
 * @module Pundit2.Core
 * @description
 *
 * Handles the authentication workflow and stores informations about the logged-in user, like username, notebooks and other useful stuff.
 *
 * Checks if the user is logged in at startup, and request him to log in if needed.
 *
 *
 */
.service('MyPundit', function(MYPUNDITDEFAULTS, $http, $q, $timeout, $modal, $window, $interval,
    BaseComponent, EventDispatcher, NameSpace, Analytics, $popover, $rootScope, $cookies) {

    var myPundit = new BaseComponent('MyPundit', MYPUNDITDEFAULTS);

    var isUserLogged = false;
    var loginServer,
        editProfile,
        loginStatus,
        userData = {},
        infoCookie = {
            templateLabel: undefined,
            templateId: undefined,
            templateColor: undefined,
            notebookLabel: undefined
        };

    var loginExecute = function(where, popoverPlacement, skipClose) {
        loginPromise = $q.defer();

        if (myPundit.isUserLogged()) {
            loginPromise.resolve(true);
        } else {
            loginStatus = 'loggedOff';
            myPundit.popoverLogin(where, popoverPlacement, skipClose);
        }

        return loginPromise.promise;
    };

    myPundit.useCookies = true;

    /**
     * @ngdoc method
     * @name MyPundit#getLoginStatus
     * @module Pundit2.Core
     * @function
     *
     * @description
     * Return the current login status.
     *
     * @return {string} current login status, that could be
     * * `loggedIn`: if user is correctly logged in
     * * `loggedOff`: if user is not logged in
     * * `waitingForLogIn`: when authentication workflow is running but user is not logged in yet
     *
     */
    myPundit.getLoginStatus = function() {
        return loginStatus;
    };

    /**
     * @ngdoc method
     * @name MyPundit#isUserLogged
     * @module Pundit2.Core
     * @function
     *
     * @description
     * Get if user is logged or not
     *
     * @return {boolean} true if user is logged in, false otherwise
     *
     */
    myPundit.isUserLogged = function() {
        return isUserLogged;
    };

    // used only in test
    myPundit.setIsUserLogged = function(bool) {
        isUserLogged = bool;
    };

    /**
     * @ngdoc method
     * @name MyPundit#getUserData
     * @module Pundit2.Core
     * @function
     *
     * @description
     * Return all information about logged-in user
     *
     * @return {object} object contain the following properties:
     * * `loginStatus` - `{number}`: must be 1 where user is logged in
     * * `id` - `{string}`: userID
     * * `uri` - `{string}`: user's profile uri
     * * `openid` - `{string}`: user's openid uri used to get login
     * * `firstName` - `{string}`: user's first name
     * * `lastName` - `{string}`: user's last name
     * * `fullName` - `{string}`: user's full name
     * * `email` - `{string}`: user's email
     * * `loginServer` - `{string}`: url to server login page
     *
     */
    myPundit.getUserData = function() {
        if (userData !== '' && typeof(userData) !== 'undefined') {
            return userData;
        }
    };

    myPundit.getInfoCookie = function() {
        return infoCookie;
    };

    myPundit.setInfoCookie = function(data) {
        angular.extend(infoCookie, data);
        var expirationDate = (new Date()).getTime() + myPundit.options.userCookieExpireTime;
        expirationDate = new Date(expirationDate);
        $cookies.putObject('pundit.Info', infoCookie, {
            expires: expirationDate,
            path: '/'
        });
    };

    /**
     * @ngdoc method
     * @name MyPundit#checkLoggedIn
     * @module Pundit2.Core
     * @function
     *
     * @description
     * Check if user is logged in or not.
     *
     * @returns {Promise} the promise will be resolved as true if is logged in, false otherwise
     *
     */
    myPundit.checkLoggedIn = function(forceHttpCall, dispatchDocumentEvent) {
        var promise = $q.defer(),
            httpCall;

        if (typeof forceHttpCall === 'undefined') {
            forceHttpCall = false;
        }
        if (typeof dispatchDocumentEvent === 'undefined') {
            dispatchDocumentEvent = true;
        }
        var expirationDate = (new Date()).getTime() + myPundit.options.userCookieExpireTime;
        expirationDate = new Date(expirationDate);

        if (myPundit.useCookies && !forceHttpCall) {
            var cookieUserdata = $cookies.getObject('pundit.User');
            var cookieInfo = $cookies.getObject('pundit.Info');
            angular.extend(infoCookie, cookieInfo);
            if (typeof cookieUserdata !== 'undefined' && cookieUserdata !== null && cookieUserdata.loginStatus === 1) {
                isUserLogged = true;
                loginStatus = 'loggedIn';
                userData = cookieUserdata;
                loginServer = userData.loginServer;
                editProfile = userData.editProfile;
                $cookies.putObject('pundit.User', cookieUserdata, {
                    expires: expirationDate,
                    path: '/'
                });
                EventDispatcher.sendEvent('MyPundit.isUserLogged', isUserLogged);
                $timeout(function() {
                    promise.resolve(true);
                }, 5);

                $timeout(function() {
                    myPundit.checkLoggedIn(true);
                }, 500);

                return promise.promise;
            }
        }

        httpCall = $http({
            headers: {
                'Accept': 'application/json'
            },
            method: 'GET',
            url: NameSpace.get('asUsersCurrent'),
            withCredentials: true

        }).success(function(data) {
            loginServer = data.loginServer;
            editProfile = data.editProfile;
            // user is not logged in

            if (data.loginStatus === 0) {
                isUserLogged = false;
                EventDispatcher.sendEvent('MyPundit.isUserLogged', isUserLogged);
                $cookies.remove('pundit.User', {
                    path: '/'
                });
                $cookies.remove('pundit.Info', {
                    path: '/'
                });
                promise.resolve(false);
            } else {
                // user is logged in
                isUserLogged = true;
                loginStatus = 'loggedIn';
                userData = data;
                $cookies.putObject('pundit.User', data, {
                    expires: expirationDate,
                    path: '/'
                });
                EventDispatcher.sendEvent('MyPundit.isUserLogged', isUserLogged);
                promise.resolve(true);
            }
            if (dispatchDocumentEvent) {
                EventDispatcher.sendEvent('Pundit.dispatchDocumentEvent', {
                    event: 'Pundit.userLoggedStatusChanged',
                    data: null
                });
            }
        }).error(function() {
            myPundit.err('Server error');
            EventDispatcher.sendEvent('Pundit.alert', {
                title: 'Oops! Something went wrong.',
                id: 'ERROR',
                timeout: null,
                message: 'There was an error while trying to communicate with server. Please reaload the page in few minutes'
            });
            promise.reject('check logged in promise error');
        });

        return promise.promise;
    };

    var loginPromise;

    /**
     * @ngdoc method
     * @name MyPundit#login
     * @module Pundit2.Core
     * @function
     *
     * @description
     * Check if user is logged in or not and:
     *
     * * if user is logged in, resolve the login promise as true
     * * if user is not logged in, will be open the login modal to continue authentication
     *
     * @returns {Promise} the promise will be resolved as true when user has finished authentication and is logged in correctly, false otherwise
     *
     */
    //hujiawei 这个方法在点击的登录的时候会被调用 -> MyPundit.login();
    myPundit.login = function(popoverPlacement) {
        return loginExecute('login', popoverPlacement, false);
    };

    //hujiawei 这个方法的调用已经被屏蔽了
    myPundit.loginWithoutSwitch = function(popoverPlacement) {
        return loginExecute('login', popoverPlacement, true);
    };

    // TODO remove it, remove the old login popup and manage popover in unit test
    myPundit.oldLogin = function() {

        loginPromise = $q.defer();

        if (myPundit.isUserLogged()) {
            loginPromise.resolve(true);
        } else {
            loginStatus = 'loggedOff';
            myPundit.openLoginPopUp();
        }

        return loginPromise.promise;
    };

    var loginPollTimer;

    /**
     * @ngdoc method
     * @name MyPundit#openLoginPopUp
     * @module Pundit2.Core
     * @function
     *
     * @description
     * Open the OpenID login popup where user can get login authentication
     *
     * When popup is opened, start a polling that check if login is happened or not
     *
     * When user is logged in correctly, promise will be resolves as true
     *
     * If user close modal login, promise will be resolved as false
     *
     */
    myPundit.openLoginPopUp = function() {

        $timeout.cancel(loginPollTimer);
        if (typeof(loginPromise) === 'undefined') {
            myPundit.err('Login promise not defined, you should call login() first');
            return;
            // TODO Fix and check unit test
            // } else if(typeof(loginServer) === 'undefined') {
            //     myPundit.checkLoggedIn();
            //     myPundit.err('Login server url not defined, something wrong with client boot (?)');
            //     loginPromise.reject('login error');
            //     return;
        } else {
            // login status is waiting for login
            loginStatus = 'waitingForLogIn';

            // open popup to get login
            var loginpopup = $window.open(loginServer, 'loginpopup', 'left=260,top=120,width=480,height=360');

            var stopTime = $interval(function() {
                if (typeof(loginpopup) !== 'undefined' && (loginpopup.closed || loginpopup === null)) {
                    $interval.cancel(stopTime);
                    $timeout(function() {
                        $timeout.cancel(loginPollTimer);
                    }, 5000);
                }
            }, 1000);

            // polls for login happened
            var check = function() {

                var promise = myPundit.checkLoggedIn();
                promise.then(
                    // success
                    function(isUserLogged) {
                        if (isUserLogged) {
                            loginPromise.resolve(true);
                            $interval.cancel(stopTime);
                            $timeout.cancel(loginPollTimer);
                            Analytics.track('main-events', 'user--login');
                            loginpopup.close();
                        }
                    },
                    function() {
                        loginPromise.reject('login error');
                    }
                ); // end promise.then

                loginPollTimer = $timeout(check, myPundit.options.loginPollTimerMS);
            };

            check();

            $timeout(function() {
                $timeout.cancel(loginPollTimer);
                //loginPromise.reject('login error');
                loginPromise.resolve(false);
                loginpopup.close();
            }, myPundit.options.loginModalCloseTimer);
        }

    };

    // logout

    /**
     * @ngdoc method
     * @name MyPundit#logout
     * @module Pundit2.Core
     * @function
     *
     * @description
     * Get user logout
     *
     * @returns {Promise} the promise will be resolved as true when user is logged out
     *
     */
    myPundit.logout = function() {

        var logoutPromise = $q.defer(),
            httpCallLogout;

        httpCallLogout = $http({
            headers: {
                'Accept': 'application/json'
            },
            method: 'GET',
            url: NameSpace.get('asUsersLogout'),
            withCredentials: true

        }).success(function() {
            isUserLogged = false;
            EventDispatcher.sendEvent('MyPundit.isUserLogged', isUserLogged);
            userData = {};
            logoutPromise.resolve(true);
            Analytics.track('main-events', 'user--logout');
            EventDispatcher.sendEvent('Pundit.dispatchDocumentEvent', {
                event: 'Pundit.userProfileUpdated',
                data: null
            });
        }).error(function() {
            logoutPromise.reject('logout promise error');
        });

        $cookies.remove('pundit.User', {
            path: '/'
        });
        $cookies.remove('pundit.Info', {
            path: '/'
        });

        return logoutPromise.promise;
    };

    var popoverState = {
        autoCloseWait: 2,
        autoCloseIntervall: null,
        autoCloseTimeout: null,
        anchor: undefined,
        loginSrc: loginServer, //myPundit.options.popoverLoginURL,//'http://dev.thepund.it/connect/index.php',
        options: {
            templateUrl: 'src/Core/Templates/login.popover.tmpl.html',
            container: "[data-ng-app='Pundit2']",
            placement: "bottom-left",
            // target: '.pnd-toolbar-login-button',
            // container: '.pnd-wrp',
            trigger: 'manual'
        },
        renderIFrame: function(where) {
            var iframeSrc = '';
            switch (where) {
                case 'login':
                    iframeSrc = loginServer;
                    break;
                case 'editProfile':
                    iframeSrc = editProfile;
                    break;
            }
            angular.element(".pnd-login-popover-container .iframe-container iframe").remove();
            angular.element(".pnd-login-popover-container .iframe-container")
                .append('<iframe src="' + iframeSrc + '"></iframe>');
            popoverState.popover.$scope.isLoading = true;
            popoverState.popover.$scope.postLoginPreCheck = false;
            popoverState.popover.$scope.loginSuccess = false;
            popoverState.popover.$scope.loginSomeError = false;
        },
        loginSuccess: function() {
            popoverState.popover.$scope.autoCloseIn = popoverState.autoCloseWait;
            popoverState.popover.$scope.loginSuccess = true;
            popoverState.autoCloseIntervall = $interval(function() {
                if (popoverState.popover === null || typeof popoverState.popover === 'undefined') {
                    $interval.cancel(popoverState.autoCloseIntervall);
                    return;
                }
                var sec = popoverState.popover.$scope.autoCloseIn;
                sec--;
                if (sec < 1) {
                    $interval.cancel(popoverState.autoCloseIntervall);
                    myPundit.closeLoginPopover();
                } else {
                    popoverState.popover.$scope.autoCloseIn = sec;
                }
            }, 1000);
        },
        popover: null
    };

    var updateUser = false;
    var popoverLoginPostMessageHandler = function(params) {
        if (popoverState.popover === null || typeof popoverState.popover.$scope === 'undefined') {
            return;
        }

        if (typeof params.data !== 'undefined') {
            if (params.data === 'loginPageLoaded' || params.data === 'pageLoaded') {
                popoverState.popover.$scope.isLoading = false;
                popoverState.popover.$scope.$digest();
            } else if (params.data === 'loginCheck') {
                popoverState.popover.$scope.isLoading = true;
                popoverState.popover.$scope.postLoginPreCheck = true;
                popoverState.popover.$scope.$digest();
            } else if (params.data === 'profileSuccessfullyUpdated') {
                $timeout.cancel(popoverState.autoCloseTimeout);
                popoverState.autoCloseTimeout = $timeout(function() {
                    myPundit.closeLoginPopover();
                }, 2500);
                if (!updateUser) {
                    console.log("updating user name by event");
                    updateUser = true;
                    EventDispatcher.sendEvent('Pundit.dispatchDocumentEvent', {
                        event: 'Pundit.userProfileUpdated',
                        data: null
                    });
                    myPundit.checkLoggedIn(true).then(function() {
                        updateUser = false;
                        $rootScope.$$phase || $rootScope.$digest();
                    });
                }
            } else if (params.data === 'forcePopoverClose') {
                if (typeof popoverState.autoCloseTimeout !== 'undefined' && popoverState.autoCloseTimeout !== null) {
                    $timeout.cancel(popoverState.autoCloseTimeout);
                }
                if (typeof popoverState.autoCloseIntervall !== 'undefined' && popoverState.autoCloseIntervall !== null) {
                    $interval.cancel(popoverState.autoCloseIntervall);
                }
                if (!updateUser) {
                    console.log("updating user name by force close");
                    updateUser = true;
                    $timeout(function() {
                        EventDispatcher.sendEvent('Pundit.dispatchDocumentEvent', {
                            event: 'Pundit.userProfileUpdated',
                            data: null
                        });
                        myPundit.checkLoggedIn(true).then(function() {
                            updateUser = false;
                            $rootScope.$$phase || $rootScope.$digest();
                        });
                    }, 50);
                }
                myPundit.closeLoginPopover();
            } else if (params.data === 'userLoggedIn') {
                popoverState.popover.$scope.postLoginPreCheck = true;
                myPundit.checkLoggedIn().then(function(status) {
                    popoverState.popover.$scope.isLoading = false;
                    if (status) {
                        popoverState.loginSuccess();
                        loginPromise.resolve(true);
                    } else {
                        popoverState.popover.$scope.loginSomeError = true;
                        loginPromise.resolve(false);
                    }
                }, function() {
                    popoverState.popover.$scope.isLoading = false;
                    popoverState.popover.$scope.loginSomeError = true;
                    myPundit.err('popoverLoginPostMessageHandler error');
                });
            }
        }
    };

    var clearOldListeners = function() {
        if (typeof window.punditPostMessageListeners !== 'undefined') {
            // clear old listeners.
            for (var i in window.punditPostMessageListeners) {
                if (window.addEventListener) {
                    window.removeEventListener("message", window.punditPostMessageListeners[i]);
                } else {
                    if (window.attachEvent) {
                        window.detachEvent("onmessage", window.punditPostMessageListeners[i]);
                    }
                }
            }
        }
        window.punditPostMessageListeners = [];
    };

    myPundit.addPostMessageListener = function() {
        clearOldListeners();
        if (window.addEventListener) {
            window.addEventListener("message", popoverLoginPostMessageHandler, false);
        } else {
            if (window.attachEvent) {
                window.attachEvent("onmessage", popoverLoginPostMessageHandler, false);
            }
        }
        window.punditPostMessageListeners.push(popoverLoginPostMessageHandler);
    };


    myPundit.removePostMessageListener = function() {
        clearOldListeners();
    };

    // First init.
    myPundit.removePostMessageListener();
    myPundit.addPostMessageListener();

    // TODO This is not really a popoverLogin but more a popover toggler
    myPundit.popoverLogin = function(where, popoverPlacement, skipClose) {
        if (typeof(loginPromise) === 'undefined' && where !== 'editProfile') {
            return;
            // loginPromise = $q.defer();
        }

        // If there's already a Login popover I close and destroy it
        if (popoverState.popover !== null) {
            if (typeof skipClose !== 'undefined' && skipClose) {
                return;
            }

            popoverState.popover.hide();
            popoverState.popover.destroy(); // TODO Doesn't remove the code?????
            popoverState.popover = null;
            EventDispatcher.sendEvent('MyPundit.popoverClose');
            return;
        }

        // popoverState.anchor = angular.element('.pnd-toolbar-login-button');
        // popoverState.popover = $popover(angular.element(".pnd-toolbar-toggle-button"), popoverState.options);

        var popoverOptions = popoverState.options;
        if (typeof popoverPlacement !== 'undefined') {
            popoverOptions = angular.copy(popoverState.options);
            popoverOptions.placement = popoverPlacement;
        }
        var anchor;
        if (where === 'login') {
            anchor = angular.element(".pnd-login-button");
            if (anchor.length === 0) {
                loginPromise.reject();
                return loginPromise.promise;
            }
            popoverState.popover = $popover(anchor, popoverOptions);
        } else if (where === 'editProfile') {
            anchor = angular.element(".pnd-toolbar-user-button");
            popoverState.popover = $popover(anchor, popoverOptions);
            if (anchor.length === 0) {
                return;
            }
        }

        popoverState.popover.$scope.isLoading = true;
        popoverState.popover.$scope.loginSuccess = false;
        popoverState.popover.$scope.loginSomeError = false;

        // TODO ???
        // popoverState.popover.$scope.loadedContent = function() {};

        popoverState.popover.$scope.closePopover = function() {
            myPundit.closeLoginPopover();
        };

        popoverState.popover.$scope.loginRetry = function() {
            popoverState.renderIFrame();
        };

        popoverState.popover.$promise.then(function() {
            popoverState.popover.show();
            popoverState.renderIFrame(where);
            checkPopoverPosition();
        });

        if (typeof loginPromise !== 'undefined') {
            return loginPromise.promise;
        }
    };

    var checkPopoverPosition = function() {
        var popoverRect = popoverState.popover.$element[0].getClientRects()[0];
        var pageVisibleRight = $window.innerWidth + $window.scrollX;
        if ($window.scrollX + popoverRect.right > pageVisibleRight) {
            popoverState.popover.$options.placement = 'left';
            popoverState.popover.$element.removeClass('left').removeClass('top').removeClass('right').removeClass('bottom');
            popoverState.popover.$element.find('.arrow-top').removeClass('arrow-top').addClass('arrow-right');
            popoverState.popover.$applyPlacement();
        }
    };

    myPundit.getLoginPopoverSrc = function() {
        return popoverState.loginSrc;
    };

    myPundit.closeLoginPopover = function() {
        if (popoverState.popover === null) {
            return;
        }

        popoverState.popover.hide();
        popoverState.popover.destroy();
        popoverState.popover = null;

    };

    myPundit.editProfile = function() {
        if (!isUserLogged) {
            myPundit.err('User not logged');
            return;
        }
        myPundit.popoverLogin('editProfile');
    };

    myPundit.checkUserCookie = function() {
        // TODO: expand this check
        $cookies.remove('pundit.User', {
            path: '/'
        });
        $cookies.remove('pundit.Info', {
            path: '/'
        });
    };

    var clientHidden = false;
    EventDispatcher.addListener('Client.hide', function( /*e*/ ) {
        if (!clientHidden) {
            myPundit.removePostMessageListener();
        }
        clientHidden = true;
    });

    EventDispatcher.addListener('Client.show', function( /*e*/ ) {
        if (clientHidden) {
            myPundit.addPostMessageListener();
        }
        clientHidden = false;
    });

    return myPundit;
});
