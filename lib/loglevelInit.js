

function KNewLogger(name, prefix, callback) {
    var logger = log.getLogger(name);
    var originalFactory = logger.methodFactory;
    logger.methodFactory = function (methodName, logLevel, loggerName) {
        var rawMethod = originalFactory(methodName, logLevel, loggerName);

        return function () {
            var callStackMsg = '';
            try {
                var stackArr = new Error().stack.split('\n');
                callStackMsg = '\n'+stackArr[2]+'\n ';
            }
            catch(e) { }

            var m = moment().format('YYYY-MM-DD HH:mm:ss.SS')+prefix;
            var args = Array.prototype.slice.call(arguments);
            args = [m].concat(args);
            args.push(callStackMsg);
            rawMethod.apply(rawMethod,args);
            callback && callback(args);
        };
    };
    logger.setLevel('TRACE'); // Be sure to call setLevel method in order to apply plugin
    return logger;
}

window.KNewLogger = KNewLogger;

sysLogger = KNewLogger('sys',' [System] : ');
webLogger = KNewLogger('web',' [Web] : ');
gameLogger = KNewLogger('game',' [Game] : ');
bookLogger = KNewLogger('book',' [Book] : ');
ajaxLogger = KNewLogger('ajax',' [Ajax] : ', function(args){
    console.log('send msg to server: msg=', args);
});

Alert = function (str) {
    return alert(str);
};