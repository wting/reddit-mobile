import './styles.less';

import React from 'react';

import { Anchor } from 'platform/components';

class Tutorial extends React.Component {
  render() {
    return (
      <div className='Tutorial'>
        <div className='Tutorial__row'>
          <img className='Tutorial__rowImg' src='/img/tutorial-post.png' />
          <span className='Tutorial__rowText'>Welcome! Reddit has subreddit communities for every topic imaginable</span>
        </div>
        <div className='Tutorial__row'>
          <img className='Tutorial__rowImg' src='/img/tutorial-vote.png' />
          <span className='Tutorial__rowText'>Vote on posts and help communities lift the best content to the top</span>
        </div>
        <div className='Tutorial__row'>
          <img className='Tutorial__rowImg' src='/img/tutorial-discuss.png' />
          <span className='Tutorial__rowText'>Subscribe to communities to fill up this empty screen with fresh posts</span>
        </div>
        <Anchor className='Tutorial__button' href='/r/popular'>Explore popular communities</Anchor>
      </div>
    );
  }
}

export default Tutorial;
