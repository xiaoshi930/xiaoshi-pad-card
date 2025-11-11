import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

export class XiaoshiPadSliderCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
      _value: Number,
      _min: Number,
      _max: Number,
      _dragging: Boolean
    };
  }

  static get styles() {
    return css`
      .slider-root {
        position: relative;
        width: var(--slider-width, 100%);
        height: var(--slider-height, 30px);
        touch-action: none;
      }
      .slider-track {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 100%;
        height: var(--track-height, 5px);
        background: var(--track-color, rgba(255,255,255,0.3));
        border-radius: var(--track-radius, 2px);
      }
      .slider-fill {
        position: absolute;
        height: 100%;
        background: var(--slider-color, #f00);
        border-radius: inherit;
      }
      .slider-thumb {
        position: absolute;
        top: 50%;
        width: var(--thumb-size, 15px);
        height: var(--thumb-size, 15px);
        background: var(--thumb-color, #fff);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
    `;
  }

  constructor() {
    super();
    this._value = 0;
    this._min = 0;
    this._max = 100;
    this._dragging = false;
    this._startX = 0;
    this._startValue = 0;
    this._moveHandler = (e) => this._handleDrag(e);
    this._endHandler = () => this._endDrag();
  }

  setConfig(config) {
    if (!config.entity) throw new Error('必须指定实体');
    this.config = config;
    if (config.style) {
      Object.keys(config.style).forEach(key => {
        this.style.setProperty(`--${key}`, config.style[key]);
      });
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      const state = this.hass.states[this.config.entity];
      if (state) {
        this._value = Number(state.state);
        this._min = Number(state.attributes.min || 0);
        this._max = Number(state.attributes.max || 100);
      }
    }
  }

  render() {
    const percent = Math.max(0, Math.min(100, (this._value - this._min) / (this._max - this._min) * 100));
    return html`
      <div class="slider-root"\n
           @mousedown=${this._startDrag}\n
           @touchstart=${this._startDrag}>
        <div class="slider-track">
          <div class="slider-fill"\nstyle="width: ${percent}%"></div>
          <div class="slider-thumb"\nstyle="left: ${percent}%"></div>
        </div>
      </div>
    `;
  }

  _startDrag(e) {
    e.preventDefault();
    this._dragging = true;
    const slider = this.shadowRoot.querySelector('.slider-track');
    const rect = slider.getBoundingClientRect();
    this._sliderLeft = rect.left;
    this._sliderWidth = rect.width;
    window.addEventListener('mousemove', this._moveHandler);
    window.addEventListener('touchmove', this._moveHandler, { passive: false });
    window.addEventListener('mouseup', this._endHandler);
    window.addEventListener('touchend', this._endHandler);
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    this._updateValue((clientX - this._sliderLeft) / this._sliderWidth);
  }

  _endDrag() {
    if (!this._dragging) return;
    this._dragging = false;
    this._removeEventListeners();
  }

  _handleDrag(e) {
    if (!this._dragging) return;
    e.preventDefault();
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    this._updateValue((clientX - this._sliderLeft) / this._sliderWidth);
  }

  _removeEventListeners() {
    window.removeEventListener('mousemove', this._moveHandler);
    window.removeEventListener('touchmove', this._moveHandler);
    window.removeEventListener('mouseup', this._endHandler);
    window.removeEventListener('touchend', this._endHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }
  
  _updateValue(ratio) {
    const safeRatio = Math.max(0, Math.min(1, ratio));
    const newValue = this._min + safeRatio * (this._max - this._min);
    const roundedValue = Math.round(newValue);
    if (roundedValue !== this._value) {
      this._value = roundedValue;
      this._debouncedSetValue(roundedValue);
    }
  }

  _debouncedSetValue(value) {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this._callService(value);
    }, 50);
  }

  _callService(value) {
    const service = this.config.entity.split('.')[0];
    this.hass.callService(service, 'set_value', {
      entity_id: this.config.entity,
      value: value
    });
  }
}
customElements.define('xiaoshi-pad-slider-card', XiaoshiPadSliderCard);