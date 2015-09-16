
function checkVisibility(el, container) {
	
  var rect = el.getBoundingClientRect();
  var containmentRect;

  if (container) {
    containmentRect = container.getBoundingClientRect();
  } else {
    containmentRect = {
      top: 0,
      left: 0,
      bottom: window.innerHeight || document.documentElement.clientHeight,
      right: window.innerWidth || document.documentElement.clientWidth
    };
  }

  // var visibilityRect = {
  //   top: rect.top >= containmentRect.top,
  //   left: rect.left >= containmentRect.left,
  //   bottom: rect.bottom <= containmentRect.bottom,
  //   right: rect.right <= containmentRect.right
  // };

  // var fullVisible = (
  //     visibilityRect.top &&
  //     visibilityRect.left &&
  //     visibilityRect.bottom &&
  //     visibilityRect.right
  // );

  // return fullVisible;

  var partialVisible =
      (rect.top >= containmentRect.top && rect.top <= containmentRect.bottom)
   || (rect.bottom >= containmentRect.top && rect.bottom <= containmentRect.bottom);

  // var partialHorizontal =
  //     (rect.left >= containmentRect.left && rect.left <= containmentRect.right)
  //  || (rect.right >= containmentRect.left && rect.right <= containmentRect.right);

  // var partialVisible = partialVertical && partialHorizontal;

  var distanceAboveTop = -(rect.bottom - containmentRect.top);
  var distanceBelowBottom = rect.top - containmentRect.bottom;
  var height = rect.height;


  return { partialVisible, distanceBelowBottom, distanceAboveTop, height};

}


export default checkVisibility;