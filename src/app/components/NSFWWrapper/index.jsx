import React from 'react';

import Loading from 'app/components/Loading';
import NSFWInterstitial from 'app/components/NSFWInterstitial';

// If the contained content is over18, then we need to show the NSFWInterstitial
// before the user sees the actual content.
// So if we haven't confirmed the users is over 18, wait until
// the profile's subreddit info has loaded to check if we need to show the NSFWInterstitial.
const NSFWWrapper = props => {
  const { isContentAdultStatusKnown, isContentOver18, userPermitsOver18, children } = props;
  let content = children;
  if (!userPermitsOver18) {
    if (!isContentAdultStatusKnown) {
      // Show loading until we know if the content is over 18 or not
      content = <Loading />;
    } else if (isContentOver18) {
      content = <NSFWInterstitial />;
    }
  }

  return (
    <div className='UserProfilePage'>
      { content }
    </div>
  );
};

export default NSFWWrapper;
