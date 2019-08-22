'use strict';

const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const response = await api('/build-status/open');

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data = {
      success: response && response.statusCode === 200
    };
  } catch (error) {
    activity.Response.Data.success = false;

    $.handleError(activity, error);
  }
};
