let is_label = 'is-label';

export function labelWidthFit(dom, maxWidth=0) {
  let labels = [], _maxWidth = find_is_label_dom([dom], labels, 0);
  maxWidth = maxWidth == 0 ? _maxWidth : Math.min(_maxWidth, maxWidth);
  if (maxWidth > 0 && labels.length > 0) {
    labels.forEach(dom => {
      if (dom.scrollWidth > maxWidth) {
        dom.style['text-overflow'] = 'ellipsis';
        dom.style['overflow'] = 'hidden';
        dom.title = dom.innerHTML;
      }
      dom.style.width = maxWidth + 'px';
    })
  }
  return maxWidth;
}

function find_is_label_dom(doms, labels, maxWidth) {
  for (let i=0,len=doms.length,dom; i<len; i++) {
    dom = doms[i];
    if (dom.hasAttribute === undefined) continue;
    if (dom.hasAttribute(is_label)) {
      labels.push(dom);
      maxWidth = Math.max(maxWidth, dom.scrollWidth);
    } else if (dom.childNodes.length > 0) {
      maxWidth = find_is_label_dom(dom.childNodes, labels, maxWidth);
    }
  }
  return maxWidth;
}