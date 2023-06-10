

export function domLeft(dom) {
  let pos = dom.getBoundingClientRect();
  return pos.left;
  // let left = dom.offsetLeft;
  // while (dom = dom.offsetParent) {
  //   left += dom.offsetLeft;
  // }
  // return left;
}

export function domTop(dom) {
  let pos = dom.getBoundingClientRect();
  return pos.bottom - dom.offsetHeight;
  // let top = dom.offsetTop;
  // while (dom = dom.offsetParent) {
  //   top += dom.offsetTop;
  // }
  // return top;
}

export function domLeftTop(dom) {
  let pos = dom.getBoundingClientRect();
  return {left:pos.left, top:pos.bottom - dom.offsetHeight};
  // let left = dom.offsetLeft, top = dom.offsetTop;
  // while (dom = dom.offsetParent) {
  //   left += dom.offsetLeft - dom.scrollLeft;
  //   top += dom.offsetTop - dom.scrollTop;
  // }
  // return {left:left, top:top};
}
export function domPosition(dom) {
  let pos = dom.getBoundingClientRect();
  let windowHeight = document.documentElement.clientHeight;
  let windowWidth = document.documentElement.clientWidth;
  return {left:pos.left, top:pos.bottom - dom.offsetHeight, bottom: windowHeight - pos.bottom, right: windowWidth - pos.right};
}
