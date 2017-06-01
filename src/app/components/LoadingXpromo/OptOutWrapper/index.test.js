import React from 'react';
import createTest from 'platform/createTest';
import indexReducer from 'app/reducers';
import routes from 'app/router';
import { OptOutWrapper } from './index';
import jsdom from 'jsdom';

const optOut = new OptOutWrapper({ isEnabled: true });

let componetnDiv;
document.getElementById = function() {
  return componetnDiv;
};
const appentInitialHTML = () => {
  const div = document.createElement('div');
  div.id = optOut.scriptId;
  componetnDiv = div;
};
const applyInlineScript = (str, window) => {
  this.window = window;
  /*eslint-disable*/
  return eval(str);
  /*eslint-enable*/
};

createTest({ 
  routes,
  reducers: { indexReducer },
},({ shallow, expect }) => {

  describe('optOut wrapper', () => {
    it('Should be rendered well)', () => {
      const props = { isEnabled: true };
      const component = shallow(<OptOutWrapper { ...props }/>);
      expect(component.find('.optOutWrapper').length).to.eql(1);
    });

    it('It has one external param "isEnabled"', () => {
      expect(optOut.props).to.have.property('isEnabled');
    });

    it('And several internals...', () => {
      expect(optOut).to.have.property('scriptId');
      expect(optOut).to.have.property('isEnabled');
    });
  });

  describe('XPromo experiment enabled/disabled (cases)', () => {
    it('OptOut is disabled (regulare)', (done) => {
      const optOut = new OptOutWrapper({ isEnabled: true });
      const script = optOut.getScript().__html;
      appentInitialHTML();
      jsdom.env({
        url: 'http://reddit.ru/', 'html': '',
        onload: function(window) {
          const result = applyInlineScript.call(optOut, script, window);
          expect(result).to.eql(true);
          done();
        },
      });
    });

    it('OptOut is enabled (as URL-flag) ', (done) => {
      const optOut = new OptOutWrapper({ isEnabled: true });
      const script = optOut.getScript().__html;
      appentInitialHTML();
      jsdom.env({
        url: 'http://reddit.ru/?no_xpromo_interstitial=true', 'html': '',
        onload: function(window) {
          applyInlineScript.call(optOut, script, window);
          const div = document.getElementById(optOut.scriptId);
          expect(div.className.trim().length).to.eql(0);
          done();
        },
      });
    });

    // it('OptOut is enabled (as LocalStorage flag) ', () => {
    //   ...
    // });
  });
});
