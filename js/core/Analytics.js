// js/core/Analytics.js
const Analytics = {
    _startTimes: {},
    _attemptCounts: {},
    _gameMode: null,
    _sessionId: null,

    setGameMode: function(mode) {
        this._gameMode = mode;
        this._sessionId = this._generateSessionId();
    },

    _generateSessionId: function() {
        const now = new Date();
        const date = now.getFullYear().toString()
            + String(now.getMonth() + 1).padStart(2, '0')
            + String(now.getDate()).padStart(2, '0');
        const key = 'gs_count_' + date;
        const count = (parseInt(localStorage.getItem(key) || '0') + 1);
        localStorage.setItem(key, count.toString());
        return date + '-' + String(count).padStart(4, '0');
    },

    _base: function(extra) {
        const params = {};
        if (this._gameMode) params.game_mode = this._gameMode;
        if (this._sessionId) params.game_session_id = this._sessionId;
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
