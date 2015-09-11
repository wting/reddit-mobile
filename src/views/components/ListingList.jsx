import React from 'react';
import constants from '../../constants';
import globals from '../../globals';
import propTypes from '../../propTypes';
import uniq from 'lodash/array/uniq';
import throttle from 'lodash/function/throttle';

import Ad from '../components/Ad';
import BaseComponent from './BaseComponent';
import CommentPreview from '../components/CommentPreview';
import Listing from '../components/Listing';
import InfiniteScroller from '../components/infiniteScroller';

const _AD_LOCATION = 11;

class ListingList extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      adLocation: Math.min(_AD_LOCATION, props.listings.length),
      compact: globals().compact,
      visibleItems: [],
      loadingDone: false
    };

    this._lazyLoad = this._lazyLoad.bind(this);
    this._resize = this._resize.bind(this);
    this.loadChildren = this.loadChildren.bind(this);
    this.listingsWrapScroll = throttle(this.listingsWrapScroll.bind(this), 200);
  }

  componentDidMount() {
    globals().app.on(constants.RESIZE, this._resize);
    this._addListeners();
    this._resize();
    if (typeof this.props.compact === 'undefined') {
      this._onCompactToggle = this._onCompactToggle.bind(this);
      globals().app.on(constants.COMPACT_TOGGLE, this._onCompactToggle);
    }    

    globals().app.on("infinite:loadOneMore", this.loadChildren)
    this.loadChildren();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.compact !== this.state.compact) {
      this._resize();
      // this._lazyLoad();  need to get rid of this, and splice ad in sooner, maybe in componentDidUpdate now?
    }
    if (prevProps.listings !== this.props.listings) {
      this._addListeners();
    }
  }

  componentWillReceiveProps(nextProps) {
    var compact = nextProps.compact;
    if (compact !== 'undefined' && compact !==this.state.compact) {
      this.setState({compact: compact});
    }
  }

  componentWillUnmount() {
    this._removeListeners();
    globals().app.off(constants.RESIZE, this._resize);
    if (typeof this.props.compact === 'undefined') {
      globals().app.off(constants.COMPACT_TOGGLE, this._onCompactToggle);
    }
    globals().app.off("infinite:loadOneMore", this.loadChildren)
  }

  loadChildren(lastWasBelowBottom) {
    if (lastWasBelowBottom) {
      globals().app.off("infinite:loadOneMore", this.loadChildren);
      var loadingDone = true;
    }

    var visibleItems = this.state.visibleItems.slice();
    if (visibleItems.length <= 0) {
      visibleItems.push({listing: this.props.listings[0], index: 0})      
    } else {
      var length = visibleItems.length;
      visibleItems.push({listing: this.props.listings[length], index: length});
    }
    var newState = {visibleItems: visibleItems};
    if (loadingDone) {
      newState.loadingDone = loadingDone;
    }
    this.setState(newState);
  }

  _getLoadedDistance () {
    return window.innerHeight * 2;
  }

  _checkAdPos() {
    var loadedDistance = this._getLoadedDistance();

    if (!this.refs.ad) {
      return false;
    }

    return this.refs.ad.checkPos(loadedDistance);
  }

  _hasAd() {
    return this.props.showAds && this.refs.ad;
  }

  _isIndexOfAd(index) {
    return this._hasAd() && index === this.state.adLocation;
  }

  _lazyLoad() {
    var listings = this.props.listings;
    var loadedDistance = this._getLoadedDistance();
    var adIsMidListing = listings.length > this.state.adLocation;

    // for (var i = 0; i < listings.length; i++) {
    //   var listing = this.refs['listing' + i];

    //   // Check ad first since it'll be before the `i`th listing.
    //   if (this._isIndexOfAd(i) && !this._checkAdPos()) {
    //     return;
    //   }

    //   if (listing.checkPos && !listing.checkPos(loadedDistance)) {
    //     return;
    //   }
    // }

    // // Ad is after all the listings
    // if (this._hasAd() && !this._checkAdPos()) {
    //   return;
    // }

    // this._removeListeners();
  }

  _addListeners() {
    if (!this._hasListeners) {
      this._hasListeners = true;
      globals().app.on(constants.SCROLL, this._lazyLoad);
      globals().app.on(constants.RESIZE, this._lazyLoad);
      this._lazyLoad();
    }
  }

  _removeListeners() {
    if (this._hasListeners) {
      globals().app.off(constants.SCROLL, this._lazyLoad);
      globals().app.off(constants.RESIZE, this._lazyLoad);
      this._hasListeners = false;
    }
  }

  _resize() {
    var width = this.refs.root.getDOMNode().offsetWidth;
    // for (var i = 0; i < this.props.listings.length; i++) {
    //   var ref = this.refs['listing' + i];

    //   ref.resize && ref.resize(width);
    // }

    // if (this.refs.ad) {
    //   this.refs.ad.resize(width);
    // }
  }

  buildAd() {
    var srnames = uniq(this.props.listings.map(function(l) {
      return l.subreddit;
    }));

    return (
      <Ad
        loid={this.props.loid}
        key='ad'
        ref='ad'
        {...this.props}
        srnames={srnames}
        afterLoad={this._checkAdPos.bind(this)}
        compact={ this.state.compact }
        />
    );
  }

  getNode() {
    return React.findDOMNode(this);
  }

  updateStatus(posData, listingsIndex) {
    if (posData.distanceAboveTop > 300) {
      this.removeListing('top');
      return;
    } else if (posData.distanceAboveTop < 300 && posData.distanceAboveTop > 0) {
      this.addListing('top', listingsIndex);
      return;
    }

    if (posData.distanceBelowBottom > 300) {
      this.removeListing('bottom');
      return;
    } else if (posData.distanceBelowBottom < 300 && posData.distanceBelowBottom > 0) {
      this.addListing('bottom', listingsIndex);
    }
  }

  removeListing(side) {
    // removes appropriate element from beginning or end of visible array;
    switch(side) {
      case 'top':
        var visibleItems = this.state.visibleItems;
        visibleItems = visibleItems.slice(1, visibleItems.length - 1);
        this.setState({visibleItems: visibleItems});
        break;
      case 'bottom':
        var visibleItems = this.state.visibleItems;
        var length = visibleItems.length;
        visibleItems = visibleItems.slice(0, length - 1);
        this.setState({visibleItems: visibleItems});
        break;
    }
  }

  addListing(side, listingsIndex) {
    // adds appropriate element from listings array to beginning or end of visible array;
    switch(side) {
      case 'top':
        var indexMinusOne = listingsIndex - 1;
        if (indexMinusOne < 0) {return;}
        var visibleItems = this.state.visibleItems;

        visibleItems.unshift({
          listing: this.props.listings[indexMinusOne],
          index: indexMinusOne
        });

        this.setState({visibleItems: visibleItems});
        break;
      case 'bottom':
        if (listingsIndex + 1 > this.props.listings.length) {return;}
        var visibleItems = this.state.visibleItems;

        visibleItems.push({
          listing: this.props.listings[listingsIndex + 1],
          index: listingsIndex + 1
        }); 

        this.setState({visibleItems: visibleItems});
        break;
    }
  } 

  render() {
    var props = this.props;
    var page = props.firstPage || 0;
    var length = props.listings.length;
    var { compact, visibleItems, loadingDone }  = this.state;
    var listings = (
      visibleItems.map((item, i) => {
        var listing = item.listing;
        var listingsIndex = item.index;

        var index = (page * 25) + i;
        if (listing._type === 'Comment') {
          return (
            <CommentPreview
              comment={listing}
              key={'page-comment-' + index}
              page={page}
              ref={'listing' + i}
            />
          );
        } else {
          if (props.showHidden || !listing.hidden) {
            return (
              <Listing
                loadingDone={ loadingDone }
                isFirstOrLast={i === 0 || (i === visibleItems.length - 1 && loadingDone)}
                updateStatus={this.updateStatus.bind(this)}
                getScrollContainer={this.getNode.bind(this)}
                index={index}
                listingsIndex={listingsIndex}
                key={'page-listing-' + index}
                listing={listing}
                ref={'listing' + i}
                z={length - i}
                {...props}
                compact={ compact }
              />
            );
          }
        }
      })
    );

    // If ads are enabled, splice an ad into the listings.
    // if (props.showAds && listings.length) {
    //   listings.splice(this.state.adLocation, 0, this.buildAd());
    // }

    return (
      <div className='ListingList__scroll-wrap' ref='root' onScroll={this.listingsWrapScroll}>
        { listings }
      </div>
    );
  }

  listingsWrapScroll(e) {
    globals().app.emit("infinite:scroll", e);
  }

  _onCompactToggle() {
    this.setState({compact: globals().compact});
  }
}

ListingList.propTypes = {
  compact: React.PropTypes.bool,
  firstPage: React.PropTypes.number,
  listings: React.PropTypes.arrayOf(React.PropTypes.oneOfType([
    propTypes.comment,
    propTypes.listing,
  ])).isRequired,
  showAds: React.PropTypes.bool,
  showHidden: React.PropTypes.bool,
};

export default ListingList;
