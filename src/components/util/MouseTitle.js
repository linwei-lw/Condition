

export default function MouseTitle(title, hoverDom, pointer=true) {
  this.hoverDom = hoverDom;
  this._onMouseEnter = this.onMouseEnter.bind(this);
  this._onMouseLeave = this.onMouseLeave.bind(this);
  this._onMouseMove = this.onMouseMove.bind(this);

  this.pointer = pointer;
  pointer && (hoverDom.style.cursor = 'pointer');

  this.enter = false;
  this.hoverDom.addEventListener('mousemove', this._onMouseEnter);

  this.dom = document.createElement("div");
  this.dom.innerHTML = title;
  this.dom.style.position = 'fixed';
  this.dom.style.border = '1px solid ' + $_theme.border_color_dark;
  this.dom.style['background-color'] = $_theme.list_hover_color;
  this.dom.style.padding = '2px 5px';
  this.dom.style['white-space'] = 'nowrap';
  this.dom.style.display = 'none';
  this.dom.style['z-index'] = 9999;
  document.body.appendChild(this.dom);
}

MouseTitle.prototype = {
  onMouseEnter: function(event) {
    this.enter = true;
    this.hoverDom.removeEventListener('mousemove', this._onMouseEnter);
    this.hoverDom.addEventListener('mouseleave', this._onMouseLeave);
    document.addEventListener("mousemove", this._onMouseMove);
    this.dom.style.display = 'inline-block';
    this.onMouseMove(event);
  },
  onMouseLeave: function() {
    this.enter = false;
    this.dom.style.display = 'none';
    document.removeEventListener("mousemove", this._onMouseMove);
    this.hoverDom.addEventListener('mousemove', this._onMouseEnter);
  },
  onMouseMove: function(event) {
    this.dom.style.left = event.clientX + 15 + "px";
    this.dom.style.top = event.clientY + "px";
  },
  setTitle: function(title) {
    this.dom.innerHTML = title;
  },
  destroy: function() {
    document.body.removeChild(this.dom);
    this.pointer && (this.hoverDom.style.cursor = null);
    !this.enter && this.hoverDom.removeEventListener('mousemove', this._onMouseEnter);
    this.enter && this.hoverDom.removeEventListener('mouseleave', this._onMouseLeave);
    this.enter && document.removeEventListener('mousemove', this._onMouseMove);
  }
}