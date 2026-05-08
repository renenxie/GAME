// js/core/Analytics.js
const Analytics = {
    _startTimes: {},
    _attemptCounts: {},
    _gameMode: null,

    setGameMode: function(mode) {
        this._gameMode = mode;
    },

    _base: function(extra) {
        const params = {};
        if (this._gameMode) params.game_mode = this._gameMode;
        return Object.assign(params, extra);
    },

    levelStart: function(levelId) {
        this._startTimes[levelId] = Date.now();
        this._attemptCounts[levelId] = (this._attemptCounts[levelId] || 0) + 1;
        if (typeof gtag === 'undefined') return;
        gtag('event', 'level_start', this._base({ level_id: levelId }));
    },

    levelComplete: function(levelId) {
        if (typeof gtag === 'undefined') return;
        const params = this._base({
            level_id: levelId,
            attempt_count: this._attemptCounts[levelId] || 1
        });
        if (this._startTimes[levelId]) {
            params.time_spent = Math.round((Date.now() - this._startTimes[levelId]) / 1000);
            delete this._startTimes[levelId];
        }
        gtag('event', 'level_complete', params);
    },

    levelFail: function(levelId) {
        if (typeof gtag === 'undefined') return;
        gtag('event', 'level_fail', this._base({ level_id: levelId }));
    },

    gameError: function(errorType, deviceModel) {
        if (typeof gtag === 'undefined') return;
        const params = this._base({ error_type: errorType });
        if (deviceModel) params.device_model = deviceModel;
        gtag('event', 'game_error', params);
    }
};

window.Analytics = Analytics;
