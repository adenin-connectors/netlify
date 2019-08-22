'use strict';

module.exports = async (activity) => {
  try {
    const request = activity.Request.Data;

    if (!request.created_at) return;

    const date = new Date(request.created_at).toISOString();
    const roles = activity.Context.connector.custom3.split(',').map((role) => role.trim());

    const collections = [{
      name: 'open',
      users: [],
      roles: roles,
      date: date
    }];

    const entity = {
      _type: 'build-status',
      id: request.site_id,
      title: request.name,
      description: request.state,
      link: request.log_access_attributes.url,
      date: date
    };

    activity.Response.Data = {
      entity: entity,
      collections: collections
    };
  } catch (error) {
    $.handleError(activity, error);
  }
};
