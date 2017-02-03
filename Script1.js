function Alerter(str) {
    var myName = arguments.callee.toString();
    log('Alerter::' + str + '::' + myName + '::');
    log('Alerter::' + str + '::' + arguments.callee.name + '::');
};

var Alerter2 = function (str) {
    var myName = arguments.callee.toString();
    log('Alerter2::' + str + '::' + myName + '::');
    log('Alerter2::' + str + '::' + arguments.callee.name + '::');
    log('Alerter2::' + str + '::' + Alerter2.name + '::');
};

log('Blank Space::' + str + '::' + Alerter2.name + '::');

on('ready', function () {
    'use strict';

    var str = 'test message';
    Alerter(str);
    Alerter2(str);
    log('on(ready)::' + str + '::' + Alerter2.name + '::');
    sendChat('me', str);
});