import './styles.less';
import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { isXPromoAdLoadingEnabled } from 'app/selectors/xpromo';
import Loading from 'app/components/Loading';
import { OptOutWrapper } from './OptOutWrapper';
import {
  CommentsTextButton,
  BigLogoTextButton,
} from './Loaders';

import { dismissedState } from 'app/selectors/xpromo';

class Loader extends React.Component {
  constructor(props) {
    super(props);
    this.state = { mounted: false };
  }
  componentDidMount() {
    this.setState({ mounted: true });
  }
  render() {
    const { type, isInterstitialDismissed } = this.props;

    // Normal client-side rendering
    if (this.state.mounted) {
      if (this.props.isEnabled) {

        // Comments loading
        if (type==='comments') {
          if (isInterstitialDismissed) {
            return <CommentsTextButton />;
          }
          return <Loading />;
        }

        // Main page loading
        return <BigLogoTextButton />;
      }
      return <Loading />;
    }
    // The first server-side and client-side rendering
    // (where Client.js is not available yet), and we
    // need to check the OptOut options and choose which
    // preloader will be displayed
    return (
      <OptOutWrapper { ...this.props }>
        <Loading />
        <BigLogoTextButton />
      </OptOutWrapper>
    );
  }
}

const selector = createStructuredSelector({
  isEnabled: state => isXPromoAdLoadingEnabled(state),
  isInterstitialDismissed: state => dismissedState(state),
});

export default connect(selector)(Loader);
