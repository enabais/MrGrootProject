# cron-runner
Custom code execution periodically

[![NPM](https://nodei.co/npm/cron-runner.png)](https://nodei.co/npm/cron-runner/)

[![Coveralls branch](https://img.shields.io/coveralls/bem-site/cron-runner/master.svg)](https://coveralls.io/r/bem-site/cron-runner?branch=master)
[![Travis](https://img.shields.io/travis/bem-site/cron-runner.svg)](https://travis-ci.org/bem-site/cron-runner)
[![David](https://img.shields.io/david/bem-site/cron-runner.svg)](https://david-dm.org/bem-site/cron-runner)
[![David](https://img.shields.io/david/dev/bem-site/cron-runner.svg)](https://david-dm.org/bem-site/cron-runner#info=devDependencies)

![GitHub Logo](./logo.png)

[RUSSIAN DOCUMENTATION](./README.ru.md)

## Usage

You should inherit from given module with help of [inherit](https://www.npmjs.com/package/inherit)

```
var inherit = require('inherit'),
    CronRunner = require('cron-runner');

var MyCronRunner = inherit(CronRunner, {
    __constructor: function (options) {
        this.__base(options);
        //TODO implement your custom initialization code here
    },

    execute: function () {
        //TODO implement your custom execution code here
    }
});

var mcr = new MyCronRunner({
    cron: {
        pattern: '0 */1 * * * *'
    }
});

mcr.start();
```

### API

#### constructor

You should call constructor of cron-runner module with options object (required). 
The fields of this object should be:

* `cron` - simple string or object with field `cron` which contains cron pattern string value. 
You can receive more details about cron patterns [here](https://www.npmjs.com/package/cron).
* `logger` - logger configuration. This is optional configuration field for
[logger](https://github.com/bem-site/logger) initialization.

#### setIdle
Switches state of runner to IDLE state. You can call it after your custom execution code for unlock
next execution calls.

#### setActive
Switches state of runner to ACTIVE state. You can call it before your custom execution code for lock
next execution calls if current execution has not performed yet.

#### isActive
Returns `true` if cron runner is in ACTIVE state. Otherwise returns `false`.

#### execute
Normally you should override this methods in you CronRunner inheritance and write your custom code

#### start
Performs start of running cron tasks.

#### stop
Performs stop of running cron tasks.

## Testing

Run tests:
```
npm run mocha
```

Run tests with istanbul coverage calculation:
```
npm run istanbul
```

Run codestyle verification (jshint and jscs)
```
npm run codestyle
```

Special thanks to:

* Nikolay Ilchenko (http://github.com/tavriaforever)
* Konstantinova Gela (http://github.com/gela-d)

Maintainer @tormozz48
Please send your questions and proposals to: tormozz48@gmail.com
