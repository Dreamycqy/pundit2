/*global mixpanel, MIXPANEL_CUSTOM_LIB_URL*/

angular.module('Pundit2.Core')

.constant('ANALYTICSDEFAULTS', {

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#Analytics
     *
     * @description
     * `object`
     *
     * Configuration object for Analytics module. Analytics provides
     * methods to submit events tracked by other modules, by managing
     * queues to avoid losing packets
     */

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#Analytics.trackingCode
     *
     * @description
     * `string`
     *
     * Web Property ID for the Google Web Property you wish to track
     *
     * Default value:
     * <pre> trackingCode: 'UA-XXXX-Y' </pre>
     */
    trackingCode: 'UA-50437894-1',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#Analytics.trackingCodeMixpanel
     *
     * @description
     * `string`
     *
     * Mixpanel user code
     *
     * Default value:
     * <pre> trackingCodeMixpanel: '********************************' </pre>
     */
    trackingCodeMixpanel: '0b6a2f9852b34ae5bb58dd3dbd2eb565',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#Analytics.globalTracker
     *
     * @description
     * `string`
     *
     * Custom name for the global variable of Analytics
     *
     * Default value:
     * <pre> globalTracker: '__gaPndtTracker' </pre>
     */
    globalTracker: '__gaPndtTracker',

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#Analytics.maxHits
     *
     * @description
     * `number`
     *
     * Each web property starts with 20 hits that are replenished at a rate of 2 hit per second.
     *
     * Default value:
     * <pre> maxHits: 20 </pre>
     */
    maxHits: 20,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#Analytics.bufferDelay
     *
     * @description
     * `number`
     *
     * Delay in ms for the refresh of the buffer
     *
     * Default value:
     * <pre> bufferDelay: 1000 </pre>
     */
    bufferDelay: 1000,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#Analytics.doTracking
     *
     * @description
     * `boolean`
     *
     * Enable / Disable the tracking
     *
     * Default value:
     * <pre> doTracking: false </pre>
     */
    doTracking: false, //hujiawei true,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#Analytics.doMixpanel
     *
     * @description
     * `boolean`
     *
     * Enable / Disable Mixpanel tracking
     *
     * Default value:
     * <pre> doMixpanel: false </pre>
     */
    doMixpanel: false,

    /**
     * @module punditConfig
     * @ngdoc property
     * @name modules#Analytics.debug
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

.service('Analytics', function(BaseComponent, $window, $document, $interval, $timeout, ANALYTICSDEFAULTS) {

    var analytics = new BaseComponent('Analytics', ANALYTICSDEFAULTS);

    var cache = {
        events: []
    };
    var numSent = 0;
    var isSendRunning = false;
    var isTimeRunning = false;
    var updateHitsTimer;
    var currentHits = analytics.options.maxHits;

    if (analytics.options.doTracking || analytics.options.doMixpanel) {
        if (angular.element('script').length === 0) {
            angular.element('head').append('<script type="text/javascript"></script>');
        }
    }


    // Google Analytics code
    if (analytics.options.doTracking) {
        (function(i, s, o, g, r, a, m) {
            i.GoogleAnalyticsObject = r;
            i[r] = i[r] || function() {
                (i[r].q = i[r].q || []).push(arguments);
            };
            i[r].l = 1 * new Date();
            a = s.createElement(o);
            m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            a.onload = function() {
                analytics.log('GA async script loaded');
                ga = $window[analytics.options.globalTracker];
            };
            m.parentNode.insertBefore(a, m);
        })($window, $document[0], 'script', '/punditapp/scripts/ga.js', analytics.options.globalTracker); //TODO: rimuovere http: per versione finale

        //hujiawei  //www.google-analytics.com/analytics.js
        //上面会去加载GA，解决方案是下载ga.js，放在/script/ga目录下，替换之，显著提高页面加载速度

        var ga = $window[analytics.options.globalTracker];
        ga('create', analytics.options.trackingCode, {
            'storage': 'none', // no cookies
            'cookieDomain': 'none' // no domain
                // 'clientId' : getClientID() // custom id
        });
        // ga('set', 'checkProtocolTask', function() {}); //HACK
    }

    // Mixpanel code
    if (analytics.options.doMixpanel) {
        (function(f, b) {
            if (!b.__SV) {
                var a, e, i, g;
                window.mixpanel = b;
                b._i = [];
                b.init = function(a, e, d) {
                    function f(b, h) {
                        var a = h.split('.');
                        2 === a.length && (b = b[a[0]], h = a[1]);
                        b[h] = function() {
                            b.push([h].concat(Array.prototype.slice.call(arguments, 0)));
                        };
                    }
                    var c = b;
                    'undefined' !== typeof d ? c = b[d] = [] : d = 'mixpanel';
                    c.people = c.people || [];
                    c.toString = function(b) {
                        var a = 'mixpanel';
                        'mixpanel' !== d && (a += '.' + d);
                        b || (a += ' (stub)');
                        return a;
                    };
                    c.people.toString = function() {
                        return c.toString(1) + '.people (stub)';
                    };
                    i = 'disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user'.split(' ');
                    for (g = 0; g < i.length; g++){
                        f(c, i[g]);
                    }
                    b._i.push([a, e, d]);
                };
                b.__SV = 1.2;
                a = f.createElement('script');
                a.type = 'text/javascript';
                a.async = !0;
                a.src = 'undefined' !== typeof MIXPANEL_CUSTOM_LIB_URL ? MIXPANEL_CUSTOM_LIB_URL : '//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
                e = f.getElementsByTagName('script')[0];
                e.parentNode.insertBefore(a, e);
            }
        })(document, window.mixpanel || []);
        mixpanel.init(analytics.options.trackingCodeMixpanel);
    }

    var updateHits = function() {
        if (currentHits >= analytics.options.maxHits) {
            isTimeRunning = false;
            analytics.log(analytics.options.maxHits + ' hits available again');
            return;
        }

        updateHitsTimer = $timeout(function() {
            currentHits = Math.min(currentHits + 2, analytics.options.maxHits);
            //analytics.log('Hits: '+currentHits);
            updateHits();
            sendHits();
        }, analytics.options.bufferDelay);
    };

    var sendHits = function() {
        if (cache.events.length === 0) {
            isSendRunning = false;
            return;
        }

        if (currentHits > 0) {
            numSent++;
            var currentEvent = cache.events.shift();

            ga('send', {
                'hitType': 'event',
                'eventCategory': currentEvent.eventCategory,
                'eventAction': currentEvent.eventAction,
                'eventLabel': currentEvent.eventLabel,
                'eventValue': currentEvent.eventValue
            });
            currentHits--;

            if (!isTimeRunning) {
                isTimeRunning = true;
                updateHits();
            }
            analytics.log('Tracked (' + numSent + ' sent / ' + currentHits + ' available) event ' + currentEvent.eventCategory + ' (' + currentEvent.eventAction + ': ' + currentEvent.eventLabel + ')');

            sendHits();
        }
    };

    var sendToMixpanel = function(event) {
        if (analytics.options.doMixpanel === false) {
            return;
        }
        if (event.eventAction !== 'click') {
            return;
        }
        mixpanel.track(event.eventLabel, event);
    };

    analytics.getHits = function() {
        return currentHits;
    };

    analytics.track = function(category, action, label, value) {
        if (!analytics.options.doTracking) {
            return;
        }
        if (!angular.isDefined(category) || !angular.isDefined(action)) {
            analytics.err('Category and Action are required');
            return;
        }

        cache.events.push({
            'eventCategory': category,
            'eventAction': action,
            'eventLabel': label,
            'eventValue': value
        });

        sendToMixpanel(cache.events[cache.events.length - 1]);

        if (!isSendRunning) {
            isSendRunning = true;
            sendHits();
        }
    };

    analytics.log('Component running');
    return analytics;
});
