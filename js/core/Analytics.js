// js/core/Analytics.js
const Analytics = {
    _startTimes: {},
    _attemptCounts: {},

    levelStart: function(levelId) {
        this._startTimes[levelId] = Date.now();
        this._attemptCounts[levelId] = (this._attemptCounts[levelId] || 0) + 1;
        if (typeof gtag === 'undefined') return;
        gtag('event', 'level_start', { level_id: levelId });
    },

    levelComplete: function(levelId) {
        if (typeof gtag === 'undefined') return;
        const params = {
            level_id: levelId,
            attempt_count: this._attemptCounts[levelId] || 1
        };
        if (this._startTimes[levelId]) {
            params.time_spent = Math.round((Date.now() - this._startTimes[levelId]) / 1000);
            delete this._startTimes[levelId];
        }
        gtag('event', 'level_complete', params);
    },

    levelFail: function(levelId, failReason, checkpoint) {
        if (typeof gtag === 'undefined') return;
        const params = { level_id: levelId };
        if (failReason) params.fail_reason = failReason;
        if (checkpoint != null) params.checkpoint = String(checkpoint);
        gtag('event', 'level_fail', params);
    },

    gameError: function(errorType, deviceModel) {
        if (typeof gtag === 'undefined') return;
        const params = { error_type: errorType };
        if (deviceModel) params.device_model = deviceModel;
        gtag('event', 'game_error', params);
    }
};

window.Analytics = Analytics;
