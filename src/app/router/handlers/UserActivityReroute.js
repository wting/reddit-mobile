import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import UserActivityHandler from 'app/router/handlers/UserActivity';

export default class UserActivityRerouteHandler extends BaseHandler {
  async [METHODS.GET](dispatch, getState) {
    const { platform: { currentPage }} = getState();
    const { urlParams, queryParams } = currentPage;
    const { userName } = urlParams;
    const url = UserActivityHandler.activityUrl(userName, queryParams.activity);

    dispatch(platformActions.redirect(url));
  }
}
