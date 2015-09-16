import React from 'react';
import constants from '../../constants';
import globals from '../../globals';
import propTypes from '../../propTypes';
import uniq from 'lodash/array/uniq';
import throttle from 'lodash/function/throttle';
import findIndex from 'lodash/array/findIndex';
import checkVisibility from '../../lib/checkVisibility';

import Ad from '../components/Ad';
import BaseComponent from './BaseComponent';
import CommentPreview from '../components/CommentPreview';
import Listing from '../components/Listing';

const _AD_LOCATION = 11;

class ListingList extends React.Component {
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
    this.loadChild = this.loadChild.bind(this);
    this.listingsWrapScroll = throttle(this.listingsWrapScroll.bind(this), 50);
  }

  componentDidMount() {
    globals().app.on(constants.RESIZE, this._resize);
    this._addListeners();
    this._resize();
    if (typeof this.props.compact === 'undefined') {
      this._onCompactToggle = this._onCompactToggle.bind(this);
      globals().app.on(constants.COMPACT_TOGGLE, this._onCompactToggle);
    }

    this.loadChild();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.compact !== this.state.compact) {
      this._resize();
      // this._lazyLoad();  need to get rid of this, and splice ad in sooner, maybe in componentDidUpdate now?
    }
    if (prevProps.listings !== this.props.listings) {
      this._addListeners();
    }

    if (!this.state.loadingDone) {
      var container = this.getNode();
      var el = React.findDOMNode(this.refs.end);
      if (el) {
        var posData = checkVisibility(el, container);
      }
      if (!el || posData.distanceBelowBottom < 200) {
        this.loadChild();       
      } else {
        this.setState({loadingDone: true});
      }
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

  loadChild() {
    var visibleItems = this.state.visibleItems.slice();

    if (visibleItems.length <= 0) {
      visibleItems.push({listing: this.props.listings[0]})      
    } else {
      var length = visibleItems.length;
      visibleItems.push({listing: this.props.listings[length]});
    }

    visibleItems.map((item, i, list) => {
      if (i === 0) {
        item.ref = 'start';
      } else if (i === list.length - 1 && i !== 0) {
        item.ref = 'end';
      } else {
        item.ref = null;
      }
    });

    this.setState({visibleItems: visibleItems});
  }

  listingsWrapScroll(e) {
    var container = this.getNode();
    var endEl = React.findDOMNode(this.refs.end);
    var startEl = React.findDOMNode(this.refs.start);
    try {
    var startChange = this.getStartElChanges(checkVisibility(startEl, container));  
   } catch(e) {debugger}
    
    if (!startChange) {debugger;}
    var endChange = this.getEndElChanges(checkVisibility(endEl, container));
    this.updateVisibleItems(startChange, endChange);
  }

  updateVisibleItems(startChange, endChange) {
    var visibleItems = this.state.visibleItems.slice();
    var length = visibleItems.length;
    var startIndex = findIndex(visibleItems, 'ref', 'start');
    var endIndex = findIndex(visibleItems, 'ref', 'end');

    switch (startChange.action) {
      case 'remove':
      if (endIndex === this.props.listings.length - 1) {break;}
        visibleItems[startIndex].height = startChange.height;
        visibleItems[startIndex].ref = null;
        visibleItems[startIndex + 1].ref = 'start';
        break;
      case 'add':
        if (startIndex === 0 || !startIndex) {break;}

        visibleItems[startIndex].ref = null;
        var num = 2
        if (!visibleItems[startIndex - 2]) {
          num = 1;
        }
        visibleItems[startIndex - num].ref = 'start';
        break;
    }
    if (!endChange) {debugger;}
    switch (endChange.action) {
      case 'remove':
        if (endIndex === 3) {debugger;}
        visibleItems[endIndex].height = endChange.height;
        visibleItems[endIndex].ref = null;
        if (!visibleItems[endIndex - 1]) {debugger;}
        visibleItems[endIndex - 1].ref = 'end';
        console.log('removed from end')
        break;
      case 'add':
        if (endIndex + 2 === this.props.listings.length - 1) {break;}

        if (visibleItems[endIndex + 1]) {
          visibleItems[endIndex].ref = null;
          visibleItems[endIndex + 1].ref = 'end';
        } else {
          visibleItems[endIndex].ref = null;
          visibleItems.push({
            listing: this.props.listings[endIndex + 1],
            ref: null
          });
          visibleItems.push({
            listing: this.props.listings[endIndex + 2],
            ref: 'end'
          });
        }
        console.log('added to end')  
        break;
    }
    console.log(visibleItems.reduce((prev, item) => {
      prev.push(item.ref);
      return prev;
    }, []));
    this.setState({visibleItems: visibleItems});
  }

  getStartElChanges(posData) {
    if (posData.distanceAboveTop > 400) {
      return { action: 'remove', height: posData.height };
    } else if (posData.distanceAboveTop <= 300) {
      return { action: 'add' };
    } else {
      return {action: 'none'}
    }
  }

  getEndElChanges(posData) {
    if (posData.distanceBelowBottom > 400) {
      return { action: 'remove', height: posData.height };
    } else if (posData.distanceBelowBottom <= 300 ) {
      return { action: 'add' };
    } else {
      return { action: 'none' };
    }
  }

  getNode() {
    return React.findDOMNode(this);
  }

  render() {
    var props = this.props;
    var page = props.firstPage || 0;
    var length = props.listings.length;
    var { compact, visibleItems, loadingDone }  = this.state;
    var before = true;
    var after = false;

    var listings = (
      visibleItems.map((item, i) => {
        var listing = item.listing;

        if (item.ref === 'start') {before = false}
        if (before || after) {return <div style={{height: item.height}}></div>}
        if (item.ref === 'end') {after = true}


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
                ref={item.ref}
                index={index}
                key={'page-listing-' + index}
                listing={listing}
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
      <div
        className='ListingList__scroll-wrap'
        ref='root'
        onScroll={this.listingsWrapScroll}>
        { listings }
      </div>
    );
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
