import React from 'react';
import AppButton from 'app/components/DualPartInterstitial/AppButton';
import SnooIcon from 'app/components/SnooIcon';
import getXpromoTheme from 'lib/xpromoTheme';
import { addToQueueAdLoadingXPromoViewEvent } from 'lib/eventUtils';
import {
  XPROMO_DISPLAY_THEMES as THEME,
  XPROMO_ADLOADING_TYPES as TYPE,
} from 'app/constants';

const CreateAppButton = (title, interstitialType) => {
  addToQueueAdLoadingXPromoViewEvent(interstitialType);
  const visitTrigger = getXpromoTheme(THEME.ADLOADING).visitTrigger;
  const buttonProps = { title, interstitialType, visitTrigger };
  return <AppButton { ...buttonProps } />;
};

export const CommentsTextButton = () => {
  return (
    <div className='adLoading m-comments'>
      <h3 className='textLoader'>Comments loading
        <span className="textLoader__ball1"></span>
        <span className="textLoader__ball2"></span>
        <span className="textLoader__ball3"></span>
      </h3>
      <p>The App is 50% Faster</p>
      <div className='adLoading__button'>
        { CreateAppButton('OPEN IN APP', TYPE.COMMENTS) }
      </div>
    </div>
  );
};

export const BigLogoTextButton = () => {
  return (
    <div className='adLoading'>
      <div className='adLoading__logo'>
        <SnooIcon />
        <div className='adLoading__logoBg'></div>
      </div>
      <h3>The Reddit App is&nbsp;50% Faster than&nbsp;Web</h3>
      <p>Infinite Scrolls. Autoplay GIFs.</p>
      <div className='adLoading__wrapper'>
        <div className='adLoading__button'>
          { CreateAppButton('UPGRADE TO APP', TYPE.MAIN) }
        </div>
      </div>
    </div>
  );
};
