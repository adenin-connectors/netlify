/* eslint-disable max-len */
'use strict';

const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const pagination = $.pagination(activity);
    const dateRange = $.dateRange(activity);

    const response = await api(`/build-status/open?page=${pagination.page}&pageSize=${pagination.pageSize}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);

    if ($.isErrorResponse(activity, response)) return;

    const items = response.body.Data.items;

    logger.error('context is' + JSON.stringify(activity.Context));
    logger.error('response is' + JSON.stringify(response));

    let failCount = 0;

    for (let i = 0; i < items.length; i++) {
      if (items[i].description !== 'building' && items[i].description !== 'ready') failCount++;
    }

    activity.Response.Data.items = response.body.Data.items;

    if (parseInt(pagination.page) === 1) {
      activity.Response.Data.title = T(activity, 'Build Status');
      activity.Response.Data.link = '';
      activity.Response.Data.linkLabel = T(activity, 'All builds');
      activity.Response.Data.actionable = failCount > 0;

      if (failCount > 0) {
        activity.Response.Data.value = failCount;
        activity.Response.Data.date = response.body.Data.items[0].date;
        activity.Response.Data.color = 'blue';
        activity.Response.Data.description = failCount > 1 ? T(activity, '{0} builds are currently failing.', failCount) : T(activity, '1 build is currently failing.');
      } else {
        activity.Response.Data.description = T(activity, 'All builds are succeeding.');
      }
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
