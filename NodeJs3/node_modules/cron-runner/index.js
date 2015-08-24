var inherit = require('inherit'),
    Logger = require('bem-site-logger'),
    CronJob = require('cron').CronJob;

module.exports = inherit({

    _STATE: {
        IDLE: 0,
        ACTIVE: 1
    },

    _job: undefined,
    _options: undefined,
    _logger: undefined,
    _state: undefined,

    /**
     * Constructor function
     * @param {Object} options object.
     * (Should contain field 'cron' as object with fields:
     * - {String} pattern - cron pattern
     * - {Boolean} startImmediately - if true then cron will be started immediately
     * @private
     */
    __constructor: function (options) {
        this._options = options;

        if (!this._options) {
            throw new Error('Options were not set');
        }

        var o = this._options['cron'];
        if (!o) {
            throw new Error('Cron options were not set');
        }

        typeof o === 'string' && (o = { pattern: o });

        if (!o.pattern) {
            throw new Error('Cron pattern was not set');
        }

        this._logger = Logger.setOptions(options['logger']).createLogger(module);
        this._state = this._STATE.IDLE;

        o.startImmediately = o.startImmediately || false;
        this._job = new CronJob({
            cronTime: o.pattern,
            onTick: this.execute,
            start: o.startImmediately,
            context: this
        });
    },

    /**
     * Switches state to IDLE state
     * @returns {exports}
     */
    setIdle: function () {
        this._state = this._STATE.IDLE;
        return this;
    },

    /**
     * Switches state to ACTIVE state
     * @returns {exports}
     */
    setActive: function () {
        this._state = this._STATE.ACTIVE;
        return this;
    },

    /**
     * Checks is current state is ACTIVE state
     * @returns {boolean}
     */
    isActive: function () {
        return this._state === this._STATE.ACTIVE;
    },

    /**
     * Method for cron script execution
     */
    execute: function () {
        this._logger.info('cron runner start execute');
        return true;
    },

    /**
     * Starts cron execution
     * @returns {exports}
     */
    start: function () {
        if (!this._job) {
            var error = new Error('Cron job has\'t been initialized yet');
            this._logger.error(error.message);
            throw error;
        }

        this._logger.info('Start cron job');
        this._job.start();
        return this;
    },

    /**
     * Stops cron execution
     * @returns {exports}
     */
    stop: function () {
        if (!this._job) {
            var error = new Error('Cron job has\'t been initialized yet');
            this._logger.error(error.message);
            throw error;
        }

        this._logger.info('Stop cron job');
        this._job.stop();
        return this;
    }
});
