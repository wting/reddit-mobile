/**
 * This function controls the display of the XPromo preloader VS regular one.
 *
 * @param {boolean} isEnabled — is XPromo experiment is enabled
 * @param {string} elementID — div container ID (for css class manipulation)
 * @param {array} optOutFlags — array of optOuts flags
 * @returns {boolean} showXpromo, for testing preposes;
 */
export default function(isEnabled, elementID, optOutFlags) {
  const lsTrueFlags = [];
  let showXpromo = false; 
  try {
    if (window && isEnabled && elementID && Array.isArray(optOutFlags)) {

      // Check LS
      if (window.localStorage) {
        showXpromo = true;
        const lsOptOutStr = (window.localStorage.optOuts || null);
        const lsOptOutFlags = JSON.parse(lsOptOutStr);
        if (lsOptOutFlags instanceof Object) {
          const isSomeOptOutFlagOn = optOutFlags.reduce((prev, flag) => {
            if (lsOptOutFlags[flag.STORE_KEY]) {lsTrueFlags.push(flag.URL_FLAG);}
            return (lsOptOutFlags[flag.STORE_KEY] || prev);
          }, false);
          showXpromo = !isSomeOptOutFlagOn;
        }
      }

      // Check URL
      // Note: this check has priority N1.
      // If url-flag is set on, we should apply it first
      // Cases:
      //  (1) url (window.location.search) is empty —> OFF
      //  (2) url-flag do NOT fit to any of constants flags -> OFF
      //  (3) url-flag is false
      // otherwise —> optOut is ON (showXpromo — false)
      const search = window.location.search || null;
      if (!search) {return;} // (1)

      const validPairs = search.substring(search.indexOf('?') + 1).split('&')
        .filter(c => c)       // clean empty
        .filter(urlflag => {  // compare and get only compared with optOutFlags
          return optOutFlags.some(i => (i.URL_FLAG === urlflag.split('=')[0]));
        });
      if (!validPairs.length) {return;} // (2)

      const isSomeURLFlagOn = validPairs.reduce((prev, curr) => {
        return (!curr.includes('=false') && !prev) ? true : prev;
      }, false);
      showXpromo = !isSomeURLFlagOn; // (3)

      // Case where
      // URL: http://localhost:4444/?no_xpromo_interstitial=false
      // LS: {"xpromoInterstitialMenu":true}
      if (showXpromo && lsTrueFlags.length) { // (4)
        const isTryToDismissDiffLsAndUrlFlags = lsTrueFlags.some((lsFlag) => {
          const isEqual = validPairs.some((urlFlag) => ((`${lsFlag}=false`) === urlFlag));
          return !isEqual;
        });
        showXpromo = !isTryToDismissDiffLsAndUrlFlags;
      }
    }
    // Toggling loaders display
    document.getElementById(elementID).className += (showXpromo?' xpromo':'');
  } catch (e) { console.warn(e); }
  return showXpromo;
}
