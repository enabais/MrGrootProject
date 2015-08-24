# cron-runner
Иструмент для выполнения вашего кода по расписанию.

[![NPM](https://nodei.co/npm/cron-runner.png)](https://nodei.co/npm/cron-runner/)

[![Coveralls branch](https://img.shields.io/coveralls/bem-site/cron-runner/master.svg)](https://coveralls.io/r/bem-site/cron-runner?branch=master)
[![Travis](https://img.shields.io/travis/bem-site/cron-runner.svg)](https://travis-ci.org/bem-site/cron-runner)
[![David](https://img.shields.io/david/bem-site/cron-runner.svg)](https://david-dm.org/bem-site/cron-runner)
[![David](https://img.shields.io/david/dev/bem-site/cron-runner.svg)](https://david-dm.org/bem-site/cron-runner#info=devDependencies)

![GitHub Logo](./logo.png)

[ENGLISH DOCUMENTATION](./README.md)

## Использование

Для использования вы должны отнаследовать класс который предоставляет 
данный инструмент с помощью модуля [inherit](https://www.npmjs.com/package/inherit), например

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

Конструктор cron-runner модуля должен вызываться с обязательной передачей опций. 
Опции для инициализации данного модуля представляют собой объект с полями:

* `cron` - строка или объект с полем `pattern` который содежит информацию о расписании вызова кода. 
Более детально о шаблонах cron можно прочитать [здесь](https://www.npmjs.com/package/cron).
* `logger` - конфигруация логгер. Это опциональное поле для инициализации 
[инструмента логгирования](https://github.com/bem-site/logger).

#### setActive
Переключает состояние иструмента в `ACTIVE`. Этот метод может быть вызван перед вызовом вашего кода
для того чтобы предотвратить исполнение кода при следующем запуске по таймеру в случае когда
исполняемый код еще не закончил выполнение.

#### setIdle
Переключает состояние иструмента в `IDLE`. Этот метод может быть использован для того, чтобы
разблокировать выполнение последующих операций.

#### isActive
Возвращает `true` если инструмент находится в состоянии `ACTIVE`. В противном случае возвращает `false`.

#### execute
Этот метод должен быть переопределен в вашем дочернем классе. Содержит исполняемый код
который доджен выполняться по расписанию.

#### start
Запускает выполнение cron задачи по расписанию.

#### stop
Останавливает выполнение cron задачи по расписанию.

## Тестирование

Запуск тестов:
```
npm run mocha
```

Запуск тестов с вычислением покрытия кода тестами с помощью инструмента [istanbul](https://www.npmjs.com/package/istanbul):
```
npm run istanbul
```

Проверка синткасиса кода с помощью jshint и jscs
```
npm run codestyle
```

Особая благодарность за помощь в разработке:

* Ильченко Николай (http://github.com/tavriaforever)
* Константинова Гела (http://github.com/gela-d)

Разработчик Кузнецов Андрей Сергеевич @tormozz48
Вопросы и предложения присылать по адресу: tormozz48@gmail.com
