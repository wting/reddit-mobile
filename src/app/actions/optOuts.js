import * as overlayActions from './overlay';
import { OPT_OUT_XPROMO_INTERSTITIAL_MENU } from 'app/constants';

export const OPTOUT_SET = 'OPTOUT__SET';
export const setFlag = (flag, message) => ({
  type: OPTOUT_SET,
  message,
  flag,
});

export const setXPromoOptout = () => async (dispatch) => {
  dispatch(setFlag(OPT_OUT_XPROMO_INTERSTITIAL_MENU, 'Updated Preference'));
  dispatch(overlayActions.closeOverlay());
};
