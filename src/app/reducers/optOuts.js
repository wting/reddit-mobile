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
import { OPT_OUT_XPROMO_INTERSTITIAL } from 'app/constants';

const { URL_FLAG, STORE_KEY } = OPT_OUT_XPROMO_INTERSTITIAL;

export const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case platformActions.SET_PAGE: {
      const { queryParams } = action.payload;
      const xpromoSetting = queryParams[URL_FLAG];

      // If the setting is not present, we treat it as such.
      if (xpromoSetting === undefined) {
        return state;
      }

      // Unset the flag
      if (xpromoSetting === 'false') {
        return merge(state, {
          [STORE_KEY]: undefined,
        });
      }

      return merge(state, {
        [STORE_KEY]: true,
      });
    }

    default: return state;
  }
}
