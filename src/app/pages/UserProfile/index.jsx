import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { Anchor } from 'platform/components';
import NSFWWrapper from 'app/components/NSFWWrapper';
import { UserProfileHeader } from 'app/components/UserProfileHeader';
import { UserProfileSummary } from 'app/components/UserProfileSummary';
import Loading from 'app/components/Loading';
import { userAccountSelector } from 'app/selectors/userAccount';

const GILD_URL_RE = /u\/.*\/gild$/;

const mapStateToProps = createSelector(
  userAccountSelector,
  (state, props) => state.accounts[props.urlParams.userName.toLowerCase()],
  (state, props) => state.accountRequests[props.urlParams.userName],
  state => state.subreddits,
  state => state.preferences,
  (myUser, queriedUser, queriedUserRequest, subreddits, preferences) => {
    return {
      myUser,
      queriedUser: queriedUser || {},
      queriedUserRequest,
      isContributor: queriedUser && !!queriedUser.subredditName,
      queriedUserSubreddit: queriedUser ? subreddits[queriedUser.subredditName.toLowerCase()] : null,
      preferences,
    };
  },
);

export const UserProfilePage = connect(mapStateToProps)(props => {
  const {
    myUser,
    queriedUser,
    queriedUserRequest,
    url,
    isContributor,
    queriedUserSubreddit: userSubreddit,
    preferences,
  } = props;
  const { name: userName, karma, subredditName } = queriedUser;
  const isGildPage = GILD_URL_RE.test(url);
  const isMyUser = !!myUser && myUser.name === userName;
  const loaded = !!queriedUserRequest && !queriedUserRequest.loading;

  return (
    <NSFWWrapper
      isContentAdultStatusKnown={ loaded && (!!userSubreddit || !isContributor) }
      isContentOver18={ isContributor && userSubreddit.over18 }
      userPermitsOver18={ preferences.over18 }
    >
      <div className='UserProfilePage'>
        <Section>
          { loaded &&
            <UserProfileHeader
              userName={ userName }
              userSubreddit={ subredditName }
              karma={ karma }
              isMyUser={ isMyUser }
            />
          }
        </Section>
        { isGildPage ? <GildPageContent />
          : queriedUser && loaded ? <UserProfileContent user={ queriedUser } isMyUser={ isMyUser } />
          : <Loading /> /* do an error state here? */ }
      </div>
    </NSFWWrapper>
  );
});

export const Section = props => (
  <div className='UserProfilePage__section'>
    { props.children }
  </div>
);

function GildPageContent() { return (<div>Sorry, this page isn't ready yet</div>); }

const UserProfileContent = props => {
  const { user, isMyUser } = props;
  return (
    <div>
      <Section>
        <UserProfileSummary user={ user } isMyUser={ isMyUser } />
      </Section>
      { !isMyUser
        ? null
        : <Section>
          <OwnUserLinks userName={ user.name } />
        </Section>
      }
    </div>
  );
};

const OwnUserLinks = props => {
  const { userName } = props;

  return (
    <div className='UserProfilePage__ownUserLinks'>
      <UserLink iconName='save' text='Saved' href={ userLinkPath(userName, 'saved') } />
      <UserLink iconName='hide' text='Hidden' href={ userLinkPath(userName, 'hidden') } />
    </div>
  );
};

const userLinkPath = (userName, subpath) => `/user/${userName}/${subpath}`;

const UserLink = props => {
  const { text, iconName, href } = props;

  return (
    <Anchor className='UserProfilePage__userLink' href={ href }>
      <span className={ `UserProfilePage__userLinkIcon icon icon-large icon-${iconName} blue ` } />
      { text }
    </Anchor>
  );
};
