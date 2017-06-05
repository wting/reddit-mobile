/**
  NOTE: currently we have only one URL-flag that should be maintained:
  '?no_xpromo_interstitial=true' — will dismiss all the XPromo experiments.

  The synchronisation of URL-flags consists of the two parts:
  1) we record the opt-out status to redux state:
  — (Client.js, on the beginning) reading of LocalStorage key 'opt Outs' if exist;
  - (Here) monitoring of all the URL changes and availability of the proper /?' pathnames;
  2) and sync it to localStorage:
  — (LocalStorageSync.js) via 'makeLocalStorageArchiver' that will synchronize
  LocalStorage everytime when page will changed/updated by the router.
*/

import merge from 'platform/merge';
import * as platformActions from 'platform/actions';
import * as optOuts from 'app/actions/optOuts';
import { OPT_OUT_FLAGS } from 'app/constants';

export const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case platformActions.SET_PAGE: {
      const { queryParams } = action.payload;
      const matchedOptOutFlag = OPT_OUT_FLAGS.find((item) => {
        return (queryParams[item.URL_FLAG] !== undefined);
      });
      // Dismiss if the optOut array
      // does not match current URL
      if (!matchedOptOutFlag) {
        return state;
      }
      const { URL_FLAG, STORE_KEY } = matchedOptOutFlag;
      const xpromoSetting = queryParams[URL_FLAG];

      // Disable the optOut flag if URL setting is false
      if (xpromoSetting === 'false') {
        return merge(state, {[STORE_KEY]: undefined});
      }
      // Enable the optOut flag (for all other cases)
      return merge(state, {[STORE_KEY]: true });
    }

    case optOuts.OPTOUT_SET: {
      const { STORE_KEY } = action.flag;
      return merge(state, {[STORE_KEY]: true });
    }

    default: return state;
  }
}
