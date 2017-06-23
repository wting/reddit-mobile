import chai from 'chai';
import set from 'lodash/set';
import sinonChai from 'sinon-chai';
import { getUserCtxCookie } from '../../src/lib/eventUtils';
import {
  SESSION_COOKIE_KEY,
  extractSessionID,
  parseServerSideCookies,
} from '../../src/lib/getSessionIdFromCookie';

const expect = chai.expect;

chai.use(sinonChai);

describe('lib: parseServerSideCookies', () => {
  it('is a string', () => {
    expect(SESSION_COOKIE_KEY).to.be.a('string');
  });
  it('is a functions', () => {
    expect(extractSessionID).to.be.a('function');
    expect(parseServerSideCookies).to.be.a('function');
  });

  describe('getting SessionID from cookies', () => {
    const sessionId = 'FkKR4iIEsVZsGKuRT0';
    const sessionTrackerId = sessionId+'.0.1498252888697.Z0FBQUFBQlpUWVpZS3F1MlNYTi1CZG8wU2twOXJjUmh3c0FxT2YyNkY2SGpWZDMtVmR5aEVXdEtwTThUdnpjZllOZFhZcFItMUNnVTNqMFR0NzlGMHU5RFBlWVowTGhrcXVFcDR0Y3RBYUQtNVZLUUNEUGVvTzU2WVRIODBFa3VkTVMyc3owcWd4clI';
    const sessionTrackerCookie = 'session_tracker='+sessionTrackerId+'; Domain=reddit.com; Max-Age=7199; Path=/; expires=Fri, 23-Jun-2017 23:21:28 GMT; secure';

    let ctxCookie = undefined;

    beforeEach(function() {
        process.env.ENV = 'server';

        const sampleState = {};

        set(
          sampleState,
          'user.name',
          'userName'
        );
        set(
          sampleState,
          'accountRequests.userName.meta.set-cookie',
          [sessionTrackerCookie]
        );

        ctxCookie = getUserCtxCookie(sampleState);
    });

    it('is ctxCookie array', () => {
      expect(ctxCookie).to.be.a('array');
      expect(ctxCookie).to.include(sessionTrackerCookie);
    });

    it('is parseServerSideCookies return sessionTracker', () => {
      const sessionTrackerStr = parseServerSideCookies(ctxCookie);
      expect(sessionTrackerStr).to.be.a('string');
      expect(sessionTrackerStr).to.equal(sessionTrackerId);
    });

    it('is extractSessionID get sessionId from sessionTrackerId', () => {
      const sessionIdStr = extractSessionID(sessionTrackerId);
      expect(sessionIdStr).to.be.a('string');
      expect(sessionIdStr).to.equal(sessionId);
    });
  });
});
