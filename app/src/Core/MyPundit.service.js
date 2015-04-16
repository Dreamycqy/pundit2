function GLOBAL_PUNDIT_IFRAME_LOADED() {
    alert("LOADED");
}
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
    BaseComponent, EventDispatcher, NameSpace, Analytics, $popover, $rootScope) {

    var myPundit = new BaseComponent('MyPundit', MYPUNDITDEFAULTS);

    var isUserLogged = false;
    var loginServer,
        loginStatus,
        userData = {};

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
    myPundit.checkLoggedIn = function() {

        var promise = $q.defer(),
            httpCall;

        httpCall = $http({
            headers: {
                'Accept': 'application/json'
            },
            method: 'GET',
            url: NameSpace.get('asUsersCurrent'),
            withCredentials: true

        }).success(function(data) {
            loginServer = data.loginServer;
            // user is not logged in
            if (data.loginStatus === 0) {
                isUserLogged = false;
                EventDispatcher.sendEvent('MyPundit.isUserLogged', isUserLogged);
                promise.resolve(false);
            } else {
                // user is logged in
                isUserLogged = true;
                loginStatus = 'loggedIn';
                userData = data;
                EventDispatcher.sendEvent('MyPundit.isUserLogged', isUserLogged);
                promise.resolve(true);
            }

        }).error(function() {
            myPundit.err('Server error');
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
    myPundit.login = function() {

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
        }).error(function() {
            logoutPromise.reject('logout promise error');
        });

        return logoutPromise.promise;
    };

    // MODAL HANDLER

    var loginModal = $modal({
        container: "[data-ng-app='Pundit2']",
        template: 'src/Core/Templates/login.modal.tmpl.html',
        show: false,
        backdrop: 'static'
    });

    /**
     * @ngdoc method
     * @name MyPundit#closeLoginModal
     * @module Pundit2.Core
     * @function
     *
     * @description
     * Close login modal and cancel polling timeout
     *
     * Login promise will not be resolved
     *
     */
    myPundit.closeLoginModal = function() {
        loginModal.hide();
        $timeout.cancel(loginPollTimer);
    };

    // close modal, cancel timeout and resolve loginPromise
    /**
     * @ngdoc method
     * @name MyPundit#cancelLoginModal
     * @module Pundit2.Core
     * @function
     *
     * @description
     * Close login modal and cancel polling timeout
     *
     * In this case, authentication process will be interrupted and login promise will be resolved as true
     *
     */
    myPundit.cancelLoginModal = function() {
        loginModal.hide();
        loginPromise.resolve(false);
        $timeout.cancel(loginPollTimer);
    };

    var popoverState = {
        autoCloseWait: 5,
        autoCloseIntervall: null,
        anchor: undefined,
        loginSrc: myPundit.options.popoverLoginURL,//'http://dev.thepund.it/connect/index.php',
        options: {
            template: 'src/Core/Templates/login.popover.tmpl.html',
            container: "[data-ng-app='Pundit2']",
            placement: "bottom-left"
        },
        renderIFrame: function() {
            angular.element(".pnd-login-popover-container .iframe-container iframe").remove();
            angular.element(".pnd-login-popover-container .iframe-container")
                .append('<iframe src="' + popoverState.loginSrc + '"></iframe>');
            popoverState.popover.$scope.isLoading = true;
            popoverState.popover.$scope.loginSuccess = false;
            popoverState.popover.$scope.loginSomeError = false;
        },
        loginSuccess: function() {
            popoverState.popover.$scope.autoCloseIn = popoverState.autoCloseWait;
            popoverState.popover.$scope.loginSuccess = true;
            popoverState.autoCloseIntervall = $interval(function(){
                var sec = popoverState.popover.$scope.autoCloseIn;
                sec --;
                if (sec < 1) {
                    $interval.cancel(popoverState.autoCloseIntervall);
                    myPundit.closeLoginPopover();
                }
                else {
                    popoverState.popover.$scope.autoCloseIn = sec;
                }
            }, 1000);
        },
        popover: null
    };

    var popoverLoginPostMessageHandler = function(params) {
        console.log(params);
        if (typeof params.data !== 'undefined') {
            if(params.data === 'loginPageLoaded') {
                popoverState.popover.$scope.isLoading = false;
                popoverState.popover.$scope.$digest();
            }
            else if(params.data === 'userLoggedIn') {
                myPundit.checkLoggedIn().then(function(status){
                    if (status) {
                        popoverState.loginSuccess();
                    }
                    else {
                        popoverState.popover.$scope.loginSomeError = true;
                        //popoverState.popover.$scope.$digest();
                    }
                }, function() {
                    popoverState.popover.$scope.loginSomeError = true;
                    //popoverState.popover.$scope.$digest();
                    //popoverState.loginSuccess();
                });
            }
        }
    };

    if (window.addEventListener) {
        window.addEventListener("message", popoverLoginPostMessageHandler, false);
    }
    else {
        if (window.attachEvent) {
            window.attachEvent("onmessage", popoverLoginPostMessageHandler, false);
        }
    }

    myPundit.popoverLogin = function(event) {

        console.log("popoverState.popover" + popoverState.popover);

        if (popoverState.popover != null) {
            return;
        }

        console.log("AAA");

        var target = event.originalEvent.target;

        popoverState.anchor = angular.element('.pnd-toolbar-login-button');
        popoverState.popover = $popover(angular.element(target), popoverState.options);

        //popoverState.popover = $popover(popoverState.anchor, popoverState.options);
        popoverState.popover.$scope.isLoading = true;
        popoverState.popover.$scope.loginSuccess = false;
        popoverState.popover.$scope.loginSomeError = false;
        popoverState.popover.$scope.loadedContent = function() {
            alert("Content loaded");
        };

        popoverState.popover.$scope.closePopover = function () {
            myPundit.closeLoginPopover();
        };

        popoverState.popover.$scope.loginRetry = function () {
            popoverState.renderIFrame();
        };

        popoverState.popover.$promise.then(function() {
            popoverState.popover.show();
            popoverState.renderIFrame();
        });
    }

    myPundit.getLoginPopoverSrc = function() {
        return popoverState.loginSrc;
    }

    myPundit.closeLoginPopover = function() {
        if (popoverState.popover === null) {
            return;
        }

        popoverState.popover.hide();
        popoverState.popover.destroy();
        popoverState.popover = null;

    }


    return myPundit;
});