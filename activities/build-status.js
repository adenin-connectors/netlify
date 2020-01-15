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

    const buildsFailing = [];
    let failCount = 0;

    for (let i = 0; i < items.length; i++) {
      if (items[i].description !== 'building' && items[i].description !== 'ready') {
        buildsFailing.push(items[i]);
        failCount++;
      }
    }

    activity.Response.Data.items = response.body.Data.items.sort($.compare.dateDescending);

    if (parseInt(pagination.page) === 1) {
      activity.Response.Data.title = T(activity, 'Build Status');
      activity.Response.Data.link = '';
      activity.Response.Data.linkLabel = T(activity, 'All builds');
      activity.Response.Data.actionable = failCount > 0;

      if (failCount > 0) {
        activity.Response.Data.value = failCount;
        activity.Response.Data.date = activity.Response.Data.items[0].date;
        activity.Response.Data.color = 'red';
        activity.Response.Data.description = failCount > 1 ? T(activity, '{0} builds are currently failing.', failCount) : T(activity, '1 build is currently failing.');

        switch (buildsFailing.length) {
        case 1:
          activity.Response.Data.briefing = T(activity, `Build <b>${buildsFailing[0].title}</b> is currently failing.`);
          break;
        case 2:
          activity.Response.Data.briefing = T(activity, `Builds <b>${buildsFailing[0].title}</b> and <b>${buildsFailing[1].title}</b> are currently failing.`);
          break;
        default:
          activity.Response.Data.briefing = T(activity, `Build <b>${buildsFailing[0].title}</b> and <b>${buildsFailing.length - 1}</b> more are currently failing.`);
        }
      } else {
        activity.Response.Data.description = T(activity, 'All builds are succeeding.');
      }
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
