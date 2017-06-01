import './styles.less';
import React from 'react';
import inlineScript from './script';
import { OPT_OUT_FLAGS } from 'app/constants';

export class OptOutWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.scriptId = 'app_inline_loader';
    this.isEnabled = this.shouldEnableExperiment();
  }

  // The first time (when rendering on the server side), we need to store
  // information about whether the experiment is enabled. Let's use the
  // HTML data attribute for this purpose as a temporary storage for the
  // next first rendering on the client side (it must be exactly the same
  // (HTML) as the server).
  shouldEnableExperiment() {
    if (process.env.ENV === 'client') {
      const el = document.getElementById(this.scriptId);
      if (el) {
        return el.getAttribute('data-server');
      }
    }
    return this.props.isEnabled;
  }

  getScript() {
    const strFlags = JSON.stringify(OPT_OUT_FLAGS);
    const scriptId = JSON.stringify(this.scriptId);
    const args = [this.isEnabled, scriptId, strFlags];
    return {
      __html : `!(${inlineScript})(${args.join(',')});`,
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
