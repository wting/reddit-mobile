import './styles.less';
import React from 'react';
import { OPT_OUT_XPROMO_INTERSTITIAL } from 'app/constants';

export class OptOutWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.scriptId = 'app_inline_loader';
    this.urlFlag = OPT_OUT_XPROMO_INTERSTITIAL.URL_FLAG;
    this.storageKey = OPT_OUT_XPROMO_INTERSTITIAL.STORE_KEY;
    this.setExperimentEnabled();
  }

  // The first time (when rendering on the server side), we need to store
  // information about whether the experiment is enabled. Let's use the
  // HTML data attribute for this purpose as a temporary storage for the
  // next first rendering on the client side (it must be exactly the same
  // (HTML) as the server).
  setExperimentEnabled() {
    this.isEnabled = this.props.isEnabled;
    if (process.env.ENV === 'client') {
      const el = document.getElementById(this.scriptId);
      if (el) {
        this.isEnabled = el.getAttribute('data-server');
      }
    }
  }

  getScript() {
    // Please take a look at index.test.js (sources),
    // and be careful with '${...}' script-injections.
    return {
      __html : `!function(){var o=false; var i=!!${this.isEnabled},t="${this.urlFlag}";try{if(window.localStorage){var e=window.localStorage.optOuts;void 0!==e&&i&&(o=!JSON.parse(e)["${this.storageKey}"])};var a=window.location.search;a.split(t).length>1&&i&&(o=!!(a.split(t+"=false").length>1)),document.getElementById("${this.scriptId}").className+=o?" xpromo":""}catch(o){}}();`,
    };
  }

  render() {
    return (
      <div
        id={ this.scriptId }
        className="optOutWrapper"
        data-server={ this.isEnabled }
      >
        <script dangerouslySetInnerHTML={ this.getScript() }></script>
        { this.props.children }
      </div>
    );
  }
}
