import React from 'react';
import process from 'reddit-text-js';

import BaseComponent from './BaseComponent';

import constants from '../../constants';

const PropTypes = React.PropTypes;

const EU_COOKIE_MESSAGE = 'Cookies help us deliver our Services. By ' +
  'using our Services, you agree to our use of cookies. ' +
  '[Learn More](https://www.reddit.com/help/privacypolicy)';

class InfoBar extends BaseComponent {
  constructor(props) {
    super(props);

    this.state.messages = props.messages || [];

    this.close = this.close.bind(this);
    this.incrementCookieNoticeSeen = this.incrementCookieNoticeSeen.bind(this);
    this.handleNewMessage = this.handleNewMessage.bind(this);
    this.removeEUCookieMessage = this.removeEUCookieMessage.bind(this);
  }

  componentDidMount() {
    let { app, messages } = this.props;
    let hasEUCookie = this.checkForEUCookie(messages);

    app.on(constants.NEW_INFOBAR_MESSAGE, this.handleNewMessage);

    if (hasEUCookie) {
      app.on('route:start', this.incrementCookieNoticeSeen);
    }
  }

  componentWillUnmount() {
    let { app } = this.props;
    app.off('route:start', this.incrementCookieNoticeSeen);
    app.off(constants.NEW_INFOBAR_MESSAGE, this.handleNewMessage);
  }

  componentWillReceiveProps(nextProps) {
    this.removeEUCookieMessage(nextProps);
  }

  incrementCookieNoticeSeen() {
    let { app } = this.props;
    app.emit(constants.EU_COOKIE_NOTICE_SEEN, 1);
  }

  checkForEUCookie(messages) {
    return messages.reduce((prev, message) => {
      return message.type === constants.messageTypes.EU_COOKIE;
    }, false);
  }

  removeEUCookieMessage(nextProps) {
    if (!nextProps.showEUCookieMessage && this.props.showEUCookieMessage) {
      let messages = this.state.messages.map((message) => {
        if (message.type !== constants.messageTypes.EU_COOKIE ) {
          return message;
        }
      });
      this.setState({ messages });
    }
  }

  handleNewMessage(message) {
    let messages = this.state.messages.slice();
    messages.push(message);
    this.setState({ messages });
  }

  close() {
    let { app } = this.props;
    let message = this.state.messages[0];

    if (message.type === constants.messageTypes.GLOBAL) {
      app.emit(constants.HIDE_GLOBAL_MESSAGE, message);
    } else if (message.type === constants.messageTypes.EU_COOKIE) {
      app.emit(constants.EU_COOKIE_NOTICE_SEEN, constants.EU_COOKIE_HIDE_AFTER_VIEWS);
    }

    let messages = this.state.messages.slice(1);
    this.setState({ messages });
  }

  render() {
    const message = this.state.messages[0];
    let content;

    if (message) {
      if (message.type === constants.messageTypes.EU_COOKIE) {
        message.text = EU_COOKIE_MESSAGE;
      }

      if (message.text) {
        content = (
          <div
            className='infobar-html'
            dangerouslySetInnerHTML={{__html: process(message.text)}}
          />
        );
      } else if (message.plainText) {
        content = (
          <p className='infobar-text'>{ message.text }</p>
        );
      }

      return (
        <div className='infobar-wrap'>
          <article className='infobar'>
            <button
              type='button'
              className='close'
              onClick={ this.close }
              aria-label='Close'
            >
              <span aria-hidden='true'>&times;</span>
            </button>
            { content }
          </article>
        </div>
      );
    } else {
      return (
        <div className='infobar-placeholder'></div>
      );
    }
  }

  static propTypes = {
    messages: PropTypes.array.isRequired,
    app: PropTypes.object.isRequired,
    showEUCookieMessage: PropTypes.bool.isRequired,
  }
}

export default InfoBar;