// js/core/Analytics.js
const Analytics = {
    _startTimes: {},
    _attemptCounts: {},
    _gameMode: null,
    _sessionId: null,
    _sheetsUrl: 'https://script.google.com/macros/s/AKfycbwM61-s6lVF1sXFuaiU4sOJbwYLm0i6YggrAGecjPeW_cme6b4C3SolihOi-nk-v9Y/exec',

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

    _getDate: function() {
        const now = new Date();
        return now.getFullYear() + '-'
            + String(now.getMonth() + 1).padStart(2, '0') + '-'
            + String(now.getDate()).padStart(2, '0');
    },

    _sendToSheets: function(levelId, eventType, timeSpent) {
        const params = new URLSearchParams({
            date: this._getDate(),
            session_id: this._sessionId || '',
            game_mode: this._gameMode || '',
            level_id: levelId,
            event_type: eventType,
            time_spent: timeSpent !== undefined ? timeSpent : ''
        });
        fetch(this._sheetsUrl + '?' + params.toString(), {
            mode: 'no-cors'
        }).catch(() => {});
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
        let timeSpent;
        if (this._startTimes[levelId]) {
            timeSpent = Math.round((Date.now() - this._startTimes[levelId]) / 1000);
            delete this._startTimes[levelId];
        }
        this._sendToSheets(levelId, 'level_complete', timeSpent);
        if (typeof gtag === 'undefined') return;
        const params = this._base({
            level_id: levelId,
            attempt_count: this._attemptCounts[levelId] || 1
        });
        if (timeSpent !== undefined) params.time_spent = timeSpent;
        gtag('event', 'level_complete', params);
    },

    levelFail: function(levelId) {
        this._sendToSheets(levelId, 'level_fail');
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
