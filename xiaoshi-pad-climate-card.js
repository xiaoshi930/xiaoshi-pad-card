import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class XiaoshiPadClimateCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _searchTerm: { type: String },
      _filteredEntities: { type: Array },
      _showEntityList: { type: Boolean },
      _temperatureSearchTerm: { type: String },
      _filteredTemperatureEntities: { type: Array },
      _showTemperatureList: { type: Boolean },
      _timerSearchTerm: { type: String },
      _filteredTimerEntities: { type: Array },
      _showTimerList: { type: Boolean },
      _buttonSearchTerms: { type: Object },
      _filteredButtonEntities: { type: Object },
      _showButtonLists: { type: Object },
      _button2SearchTerms: { type: Object },
      _filteredButton2Entities: { type: Object },
      _showButton2Lists: { type: Object },
      _availableModes: { type: Object }
    };
  }

  setConfig(config) {
    this.config = config || {};

    // 如果已经有选择的实体，则自动识别其可用模式
    if (this.config.entity && this.hass && this.hass.states[this.config.entity]) {
      this._detectAvailableModes(this.config.entity);
    }

    // 如果没有选择实体且有 hass 数据，自动选择第一个实体
    if (!this.config.entity && this.hass) {
      this._autoSelectFirstEntity();
    }
  }

  _autoSelectFirstEntity() {
    if (!this.hass) return;

    const allEntities = Object.values(this.hass.states);
    const firstEntity = allEntities.find(entity => {
      const entityId = entity.entity_id;
      return entityId.startsWith('climate.') || entityId.startsWith('water_heater.');
    });

    if (firstEntity) {
      this._selectMainEntity(firstEntity.entity_id);
    }
  }

  firstUpdated() {
    // 点击外部关闭下拉列表
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.entity-selector')) {
        this._showEntityList = false;
        this._showTemperatureList = false;
        this._showTimerList = false;

        // 关闭所有按钮的下拉列表
        if (this._showButtonLists) {
          Object.keys(this._showButtonLists).forEach(key => {
            this._showButtonLists[key] = false;
          });
        }
        if (this._showButton2Lists) {
          Object.keys(this._showButton2Lists).forEach(key => {
            this._showButton2Lists[key] = false;
          });
        }

        this.requestUpdate();
      }
    });
  }

  _onMainEntitySearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    this._searchTerm = searchTerm;
    this._showEntityList = true;

    if (!this.hass) return;

    // 获取所有实体
    const allEntities = Object.values(this.hass.states);

    // 过滤实体，只显示 climate 和 water_heater 开头的实体
    this._filteredEntities = allEntities.filter(entity => {
      const entityId = entity.entity_id.toLowerCase();
      const friendlyName = (entity.attributes.friendly_name || '').toLowerCase();

      // 只显示 climate. 和 water_heater. 开头的实体
      const isClimateEntity = entityId.startsWith('climate.') || entityId.startsWith('water_heater.');
      const matchesSearch = entityId.includes(searchTerm) || friendlyName.includes(searchTerm);

      return isClimateEntity && matchesSearch;
    }).slice(0, 50); // 限制显示数量

    // 如果没有选择实体且搜索为空且有过滤结果，自动选择第一个
    if (!this.config.entity && searchTerm === '' && this._filteredEntities.length > 0) {
      this._selectMainEntity(this._filteredEntities[0].entity_id);
      return;
    }

    this.requestUpdate();
  }

  _selectMainEntity(entityId) {
    this.config = {
      ...this.config,
      entity: entityId
    };

    this._searchTerm = ''; // 清空搜索词
    this._showEntityList = false; // 关闭下拉列表

    // 自动识别实体的可用模式
    this._detectAvailableModes(entityId);

    this._fireEvent();
    this.requestUpdate();
  }

  _detectAvailableModes(entityId) {
    if (!this.hass || !this.hass.states[entityId]) return;

    const attrs = this.hass.states[entityId].attributes;
    this._availableModes = {
      hasHvacModes: attrs.hvac_modes && attrs.hvac_modes.length > 0,
      hasFanModes: attrs.fan_modes && attrs.fan_modes.length > 0,
      hasSwingModes: attrs.swing_modes && attrs.swing_modes.length > 0,
      hasPresetModes: attrs.preset_modes && attrs.preset_modes.length > 0,
      hasWaterModes: attrs.operation_list && attrs.operation_list.length > 0
    };

    // 如果用户没有手动配置显示选项，则根据自动识别结果设置默认值
    if (this.config.show_hvac_modes === undefined) {
      this.config.show_hvac_modes = this._availableModes.hasHvacModes;
    }
    if (this.config.show_fan_modes === undefined) {
      this.config.show_fan_modes = this._availableModes.hasFanModes;
    }
    if (this.config.show_swing_modes === undefined) {
      this.config.show_swing_modes = this._availableModes.hasSwingModes;
    }
    if (this.config.show_preset_modes === undefined) {
      this.config.show_preset_modes = this._availableModes.hasPresetModes;
    }
    if (this.config.show_water_modes === undefined) {
      this.config.show_water_modes = this._availableModes.hasWaterModes;
    }
  }

  _onTemperatureSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    this._temperatureSearchTerm = searchTerm;
    this._showTemperatureList = true;

    if (!this.hass) return;

    // 获取所有实体
    const allEntities = Object.values(this.hass.states);

    // 过滤实体，只显示 sensor 开头的实体
    this._filteredTemperatureEntities = allEntities.filter(entity => {
      const entityId = entity.entity_id.toLowerCase();
      const friendlyName = (entity.attributes.friendly_name || '').toLowerCase();

      // 只显示 sensor. 开头的实体
      const isSensorEntity = entityId.startsWith('sensor.');
      const matchesSearch = entityId.includes(searchTerm) || friendlyName.includes(searchTerm);

      return isSensorEntity && matchesSearch;
    }).slice(0, 50); // 限制显示数量

    this.requestUpdate();
  }

  _selectTemperature(entityId) {
    this.config = {
      ...this.config,
      temperature: entityId
    };

    this._temperatureSearchTerm = ''; // 清空搜索词
    this._showTemperatureList = false; // 关闭下拉列表

    this._fireEvent();
    this.requestUpdate();
  }

  _onTimerSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    this._timerSearchTerm = searchTerm;
    this._showTimerList = true;

    if (!this.hass) return;

    // 获取所有实体
    const allEntities = Object.values(this.hass.states);

    // 过滤实体，只显示 timer 开头的实体
    this._filteredTimerEntities = allEntities.filter(entity => {
      const entityId = entity.entity_id.toLowerCase();
      const friendlyName = (entity.attributes.friendly_name || '').toLowerCase();

      // 只显示 timer. 开头的实体
      const isTimerEntity = entityId.startsWith('timer.');
      const matchesSearch = entityId.includes(searchTerm) || friendlyName.includes(searchTerm);

      return isTimerEntity && matchesSearch;
    }).slice(0, 50); // 限制显示数量

    this.requestUpdate();
  }

  _selectTimer(entityId) {
    this.config = {
      ...this.config,
      timer: entityId
    };

    this._timerSearchTerm = ''; // 清空搜索词
    this._showTimerList = false; // 关闭下拉列表

    this._fireEvent();
    this.requestUpdate();
  }

  _onButtonSearch(e, index) {
    const searchTerm = e.target.value.toLowerCase();

    if (!this._buttonSearchTerms) this._buttonSearchTerms = {};
    if (!this._filteredButtonEntities) this._filteredButtonEntities = {};
    if (!this._showButtonLists) this._showButtonLists = {};

    this._buttonSearchTerms[index] = searchTerm;
    this._showButtonLists[index] = true;

    if (!this.hass) return;

    const allEntities = Object.values(this.hass.states);

    this._filteredButtonEntities[index] = allEntities.filter(entity => {
      const entityId = entity.entity_id.toLowerCase();
      const friendlyName = (entity.attributes.friendly_name || '').toLowerCase();

      // 支持多种实体类型
      const isButtonType = entityId.startsWith('switch.') ||
                          entityId.startsWith('light.') ||
                          entityId.startsWith('button.') ||
                          entityId.startsWith('sensor.') ||
                          entityId.startsWith('select.') ||
                          entityId.startsWith('input_button.') ||
                          entityId.startsWith('script.');
      const matchesSearch = entityId.includes(searchTerm) || friendlyName.includes(searchTerm);

      return isButtonType && matchesSearch;
    }).slice(0, 50);

    this.requestUpdate();
  }

  _selectButton(entityId, index) {
    const buttons = [...(this.config.buttons || [])];
    buttons[index] = entityId;

    this.config = {
      ...this.config,
      buttons
    };

    if (!this._buttonSearchTerms) this._buttonSearchTerms = {};
    if (!this._showButtonLists) this._showButtonLists = {};

    this._buttonSearchTerms[index] = '';
    this._showButtonLists[index] = false;

    this._fireEvent();
    this.requestUpdate();
  }

  _onButton2Search(e, index2) {
    const searchTerm = e.target.value.toLowerCase();

    if (!this._button2SearchTerms) this._button2SearchTerms = {};
    if (!this._filteredButton2Entities) this._filteredButton2Entities = {};
    if (!this._showButton2Lists) this._showButton2Lists = {};

    this._button2SearchTerms[index2] = searchTerm;
    this._showButton2Lists[index2] = true;

    if (!this.hass) return;

    const allEntities = Object.values(this.hass.states);

    this._filteredButton2Entities[index2] = allEntities.filter(entity => {
      const entityId = entity.entity_id.toLowerCase();
      const friendlyName = (entity.attributes.friendly_name || '').toLowerCase();

      // 支持多种实体类型
      const isButtonType = entityId.startsWith('switch.') ||
                          entityId.startsWith('light.') ||
                          entityId.startsWith('button.') ||
                          entityId.startsWith('sensor.') ||
                          entityId.startsWith('select.') ||
                          entityId.startsWith('input_button.') ||
                          entityId.startsWith('script.');
      const matchesSearch = entityId.includes(searchTerm) || friendlyName.includes(searchTerm);

      return isButtonType && matchesSearch;
    }).slice(0, 50);

    this.requestUpdate();
  }

  _selectButton2(entityId, index2) {
    const buttons2 = [...(this.config.buttons2 || [])];
    buttons2[index2] = entityId;

    this.config = {
      ...this.config,
      buttons2
    };

    if (!this._button2SearchTerms) this._button2SearchTerms = {};
    if (!this._showButton2Lists) this._showButton2Lists = {};

    this._button2SearchTerms[index2] = '';
    this._showButton2Lists[index2] = false;

    this._fireEvent();
    this.requestUpdate();
  }

  static get styles() {
    return css`
      .form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 500px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      label {
        font-weight: bold;
      }
      select, input, textarea {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      textarea {
        min-height: 80px;
        resize: vertical;
      }
      .help-text {
        font-size: 0.85em;
        color: #666;
        margin-top: 4px;
      }

      .entity-selector {
        position: relative;
      }

      .entity-search-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
      }

      .entity-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        height: 300px;
        overflow-y: auto;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
        margin-top: 2px;
      }

      .entity-option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
      }

      .entity-option:hover {
        background: #f5f5f5;
      }

      .entity-option.selected {
        background: #e3f2fd;
      }

      .entity-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .entity-details {
        flex: 1;
      }

      .entity-name {
        font-weight: 500;
        font-size: 14px;
        color: #000;
      }

      .entity-id {
        font-size: 12px;
        color: #000;
        font-family: monospace;
      }

      .check-icon {
        color: #4CAF50;
      }

      .no-results {
        padding: 12px;
        text-align: center;
        color: #666;
        font-style: italic;
      }

      .entity-selector-with-remove {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 8px;
      }

      .entity-selector-with-remove .entity-selector {
        flex: 1;
      }

      .remove-button {
        background: #f44336;
        color: white;
        border: none;
        border-radius: 4px;
        width: 30px;
        height: 30px;
        min-width: 30px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        margin-top: 0;
      }

      .remove-button:hover {
        background: #d32f2f;
      }

      .remove-button ha-icon {
        --mdc-icon-size: 20px;
      }

      .buttons-row {
        display: flex;
        align-items: center;
        margin-top: 8px;
      }
      .add-button {
        margin-left: 8px;
        border: 1px solid red;
        border-radius: 4px;
        padding: 8px;
        transition: all 0.2s ease;
      }
      .add-button:hover {
        background-color: rgba(255, 0, 0, 0.1);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(255, 0, 0, 0.2);
      }
      .hint {
        font-size: 0.85em;
        color: #888;
        margin-top: 4px;
      }

      .refresh-button {
        transition: all 0.2s ease;
      }

      .refresh-button:hover {
        background-color: rgba(33, 150, 243, 0.1);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(33, 150, 243, 0.2);
      }

      .mode-indicator {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 8px;
      }

      .mode-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
      }

      .mode-badge.has-mode {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      .mode-badge.no-mode {
        background-color: #ffebee;
        color: #c62828;
      }
    `;
  }

  render() {
    if (!this.hass) return html``;

    return html`
      <div class="form">
        <!-- 主实体选择 -->
        <div class="form-group">
          <label>空调/水暖毯/热水器实体 (必选)</label>
          <div class="entity-selector">
            <input
              type="text"
              @input=${this._onMainEntitySearch}
              @focus=${this._onMainEntitySearch}
              .value=${this._searchTerm || this.config?.entity || ''}
              placeholder="搜索实体..."
              class="entity-search-input"
            />
            ${this._showEntityList ? html`
              <div class="entity-dropdown">
                ${this._filteredEntities.map(entity => html`
                  <div
                    class="entity-option ${this.config?.entity === entity.entity_id ? 'selected' : ''}"
                    @click=${() => this._selectMainEntity(entity.entity_id)}
                  >
                    <div class="entity-info">
                      <ha-icon icon="${entity.attributes.icon || 'mdi:help-circle'}"></ha-icon>
                      <div class="entity-details">
                        <div class="entity-name">${entity.attributes.friendly_name || entity.entity_id}</div>
                        <div class="entity-id">${entity.entity_id}</div>
                      </div>
                    </div>
                    ${this.config?.entity === entity.entity_id ?
                      html`<ha-icon icon="mdi:check" class="check-icon"></ha-icon>` : ''}
                  </div>
                `)}
                ${this._filteredEntities.length === 0 ? html`
                  <div class="no-results">未找到匹配的实体</div>
                ` : ''}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- 模式显示选项 -->
        ${this.config.entity ? html`
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label>模式显示控制</label>
              <mwc-button
                @click=${() => this._detectAvailableModes(this.config.entity)}
                outlined
                class="refresh-button"
                style="font-size: 11px; padding: 4px 8px;"
              >
                刷新检测
              </mwc-button>
            </div>
            <div class="mode-indicator">
              ${this._availableModes?.hasHvacModes ?
                html`<div class="mode-badge has-mode">✓ 模式(hvac_modes)</div>` :
                html`<div class="mode-badge no-mode">✗ 模式(hvac_modes)</div>`}
              ${this._availableModes?.hasFanModes ?
                html`<div class="mode-badge has-mode">✓ 风速(fan_modes)</div>` :
                html`<div class="mode-badge no-mode">✗ 风速(fan_modes)</div>`}
              ${this._availableModes?.hasSwingModes ?
                html`<div class="mode-badge has-mode">✓ 风向(swing_modes)</div>` :
                html`<div class="mode-badge no-mode">✗ 风向(swing_modes)</div>`}
              ${this._availableModes?.hasPresetModes ?
                html`<div class="mode-badge has-mode">✓ 水暖毯模式(preset_modes)</div>` :
                html`<div class="mode-badge no-mode">✗ 水暖毯模式(preset_modes)</div>`}
              ${this._availableModes?.hasWaterModes ?
                html`<div class="mode-badge has-mode">✓ 热水器模式(operation_list)</div>` :
                html`<div class="mode-badge no-mode">✗ 热水器模式(operation_list)</div>`}
            </div>
            ${Object.keys(this._availableModes).length === 0 ? html`
              <div style="color: #666; font-size: 12px; margin-bottom: 8px;">
                点击"刷新检测"按钮来识别实体支持的模式
              </div>
            ` : ''}
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
              ${this._availableModes?.hasHvacModes ? html`
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ha-switch
                    .checked=${this.config.show_hvac_modes !== false}
                    @change=${this._showHvacModesChanged}
                  ></ha-switch>
                  <span>显示模式按钮</span>
                </div>
              ` : ''}
              ${this._availableModes?.hasFanModes ? html`
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ha-switch
                    .checked=${this.config.show_fan_modes !== false}
                    @change=${this._showFanModesChanged}
                  ></ha-switch>
                  <span>显示风速按钮</span>
                </div>
              ` : ''}
              ${this._availableModes?.hasSwingModes ? html`
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ha-switch
                    .checked=${this.config.show_swing_modes !== false}
                    @change=${this._showSwingModesChanged}
                  ></ha-switch>
                  <span>显示风向按钮</span>
                </div>
              ` : ''}
              ${this._availableModes?.hasPresetModes ? html`
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ha-switch
                    .checked=${this.config.show_preset_modes !== false}
                    @change=${this._showPresetModesChanged}
                  ></ha-switch>
                  <span>显示水暖毯模式按钮</span>
                </div>
              ` : ''}
              ${this._availableModes?.hasWaterModes ? html`
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ha-switch
                    .checked=${this.config.show_water_modes !== false}
                    @change=${this._showWaterModesChanged}
                  ></ha-switch>
                  <span>显示热水器模式按钮</span>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- 主题选择 -->
        <div class="form-group">
          <label>主题</label>
          <select
            @change=${this._themeSelectChanged}
            .value=${this.config.theme !== undefined ? this.config.theme : 'on'}
            name="theme"
          >
            <option value="on">浅色主题（白底黑字）</option>
            <option value="off">深色主题（深灰底白字）</option>
          </select>
        </div>
        
        <!-- 温度传感器 -->
        <div class="form-group">
          <label>温度传感器 (可选)</label>
          <div class="entity-selector-with-remove">
            <div class="entity-selector">
              <input
                type="text"
                @input=${this._onTemperatureSearch}
                @focus=${this._onTemperatureSearch}
                .value=${this._temperatureSearchTerm || this.config.temperature || ''}
                placeholder="搜索传感器..."
                class="entity-search-input"
              />
              ${this._showTemperatureList ? html`
                <div class="entity-dropdown">
                  ${this._filteredTemperatureEntities.map(entity => html`
                    <div
                      class="entity-option ${this.config.temperature === entity.entity_id ? 'selected' : ''}"
                      @click=${() => this._selectTemperature(entity.entity_id)}
                    >
                      <div class="entity-info">
                        <ha-icon icon="${entity.attributes.icon || 'mdi:help-circle'}"></ha-icon>
                        <div class="entity-details">
                          <div class="entity-name">${entity.attributes.friendly_name || entity.entity_id}</div>
                          <div class="entity-id">${entity.entity_id}</div>
                        </div>
                      </div>
                      ${this.config.temperature === entity.entity_id ?
                        html`<ha-icon icon="mdi:check" class="check-icon"></ha-icon>` : ''}
                    </div>
                  `)}
                  ${this._filteredTemperatureEntities.length === 0 ? html`
                    <div class="no-results">未找到匹配的实体</div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
            <button class="remove-button" @click=${this._removeTemperature} title="移除温度传感器">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
        </div>

        <!-- 定时器位置 -->
        ${this.config.timer ? html`
          <div class="form-group">
            <label>定时器位置</label>
            <select
              @change=${this._timerPositionChanged}
              .value=${this.config.timer_position !== undefined ? this.config.timer_position : 'left'}
              name="timer_position"
            >
              <option value="left">左</option>
              <option value="right">右</option>
            </select>
          </div>
        ` : ''}
        
        <!-- 定时器 -->
        <div class="form-group">
          <label>定时器实体 (可选)</label>
          <div class="entity-selector-with-remove">
            <div class="entity-selector">
              <input
                type="text"
                @input=${this._onTimerSearch}
                @focus=${this._onTimerSearch}
                .value=${this._timerSearchTerm || this.config.timer || ''}
                placeholder="搜索定时器..."
                class="entity-search-input"
              />
              ${this._showTimerList ? html`
                <div class="entity-dropdown">
                  ${this._filteredTimerEntities.map(entity => html`
                    <div
                      class="entity-option ${this.config.timer === entity.entity_id ? 'selected' : ''}"
                      @click=${() => this._selectTimer(entity.entity_id)}
                    >
                      <div class="entity-info">
                        <ha-icon icon="${entity.attributes.icon || 'mdi:help-circle'}"></ha-icon>
                        <div class="entity-details">
                          <div class="entity-name">${entity.attributes.friendly_name || entity.entity_id}</div>
                          <div class="entity-id">${entity.entity_id}</div>
                        </div>
                      </div>
                      ${this.config.timer === entity.entity_id ?
                        html`<ha-icon icon="mdi:check" class="check-icon"></ha-icon>` : ''}
                    </div>
                  `)}
                  ${this._filteredTimerEntities.length === 0 ? html`
                    <div class="no-results">未找到匹配的实体</div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
            <button class="remove-button" @click=${this._removeTimer} title="移除定时器">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
        </div>

        <!-- 附加按钮位置 -->
        ${(this.config.buttons && this.config.buttons.length > 0) ? html`
          <div class="form-group">
            <label>附加按钮位置</label>
            <select
              @change=${this._buttonPositionChanged}
              .value=${this.config.button_position !== undefined ? this.config.button_position : 'left'}
              name="button_position"
            >
              <option value="left">左</option>
              <option value="right">右</option>
            </select>
          </div>
        ` : ''}

        <!-- 附加按钮2位置 -->
        ${(this.config.buttons2 && this.config.buttons2.length > 0) ? html`
          <div class="form-group">
            <label>附加按钮(第2排)位置</label>
            <select
              @change=${this._button2PositionChanged}
              .value=${this.config.button2_position !== undefined ? this.config.button2_position : 'left'}
              name="button2_position"
            >
              <option value="left">左</option>
              <option value="right">右</option>
            </select>
          </div>
        ` : ''}

        <!-- 附加按钮 -->
        <div class="form-group">
          <label>附加按钮 (最多7个)</label>
          ${(this.config.buttons || []).map((button, index) => html`
            <div class="entity-selector-with-remove">
              <div class="entity-selector">
                <input
                  type="text"
                  @input=${(e) => this._onButtonSearch(e, index)}
                  @focus=${(e) => this._onButtonSearch(e, index)}
                  .value=${this._buttonSearchTerms?.[index] || button || ''}
                  placeholder="搜索实体..."
                  class="entity-search-input"
                />
                ${this._showButtonLists?.[index] ? html`
                  <div class="entity-dropdown">
                    ${this._filteredButtonEntities?.[index]?.map(entity => html`
                      <div
                        class="entity-option ${button === entity.entity_id ? 'selected' : ''}"
                        @click=${() => this._selectButton(entity.entity_id, index)}
                      >
                        <div class="entity-info">
                          <ha-icon icon="${entity.attributes.icon || 'mdi:help-circle'}"></ha-icon>
                          <div class="entity-details">
                            <div class="entity-name">${entity.attributes.friendly_name || entity.entity_id}</div>
                            <div class="entity-id">${entity.entity_id}</div>
                          </div>
                        </div>
                        ${button === entity.entity_id ?
                          html`<ha-icon icon="mdi:check" class="check-icon"></ha-icon>` : ''}
                      </div>
                    `)}
                    ${this._filteredButtonEntities?.[index]?.length === 0 ? html`
                      <div class="no-results">未找到匹配的实体</div>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
              <button class="remove-button" @click=${() => this._removeButton(index)} title="移除此按钮">
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
            </div>
          `)}
          ${(!this.config.buttons || this.config.buttons.length < 7) ? html`
            <div class="buttons-row">
              <mwc-button
                class="add-button"
                @click=${this._addButton}
                outlined
              >
                添加按钮
              </mwc-button>
            </div>
          ` : ''}
          <div class="help-text">
            添加按钮实体，支持 switch、light、button、sensor、select 类型
          </div>
        </div>

        <!-- 附加按钮2 -->
        <div class="form-group">
          <label>附加按钮(第2排) (最多7个)</label>
          ${(this.config.buttons2 || []).map((button2, index2) => html`
            <div class="entity-selector-with-remove">
              <div class="entity-selector">
                <input
                  type="text"
                  @input=${(e) => this._onButton2Search(e, index2)}
                  @focus=${(e) => this._onButton2Search(e, index2)}
                  .value=${this._button2SearchTerms?.[index2] || button2 || ''}
                  placeholder="搜索实体..."
                  class="entity-search-input"
                />
                ${this._showButton2Lists?.[index2] ? html`
                  <div class="entity-dropdown">
                    ${this._filteredButton2Entities?.[index2]?.map(entity => html`
                      <div
                        class="entity-option ${button2 === entity.entity_id ? 'selected' : ''}"
                        @click=${() => this._selectButton2(entity.entity_id, index2)}
                      >
                        <div class="entity-info">
                          <ha-icon icon="${entity.attributes.icon || 'mdi:help-circle'}"></ha-icon>
                          <div class="entity-details">
                            <div class="entity-name">${entity.attributes.friendly_name || entity.entity_id}</div>
                            <div class="entity-id">${entity.entity_id}</div>
                          </div>
                        </div>
                        ${button2 === entity.entity_id ?
                          html`<ha-icon icon="mdi:check" class="check-icon"></ha-icon>` : ''}
                      </div>
                    `)}
                    ${this._filteredButton2Entities?.[index2]?.length === 0 ? html`
                      <div class="no-results">未找到匹配的实体</div>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
              <button class="remove-button" @click=${() => this._removeButton2(index2)} title="移除此按钮">
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
            </div>
          `)}
          ${(!this.config.buttons2 || this.config.buttons2.length < 7) ? html`
            <div class="buttons-row">
              <mwc-button
                class="add-button"
                @click=${this._addButton2}
                outlined
              >
                添加按钮(第2排)
              </mwc-button>
            </div>
          ` : ''}
          <div class="help-text">
            第二排按钮，最多支持7个
          </div>
        </div>

        <!-- 宽度设置 -->
        <div class="form-group">
          <label>卡片主体宽度</label>
          <input
            type="text"
            @change=${this._widthChanged}
            .value=${this.config.width !== undefined ? this.config.width : '300px'}
            name="width"
          />
        </div>

      </div>
    `;
  }

	_valueChanged(ev) {
		if (!this.config) return;  // 移除了 !ev.detail.value 检查，允许空值
		const configValue = ev.target.configValue;
		const value = ev.detail.value;
		
		// 如果值为空，则删除该配置项
		if (!value) {
			const newConfig = { ...this.config };
			delete newConfig[configValue];
			this.config = newConfig;
		} else {
			this.config = { 
				...this.config,
				[configValue]: value 
			};
		}
		this._fireEvent();
	}

	_buttonChanged(ev, index) {
		// 此方法已弃用，改用 _selectButton 方法
		if (!this.config) return;
		const buttons = [...(this.config.buttons || [])];

		// 如果值为空，则删除该按钮
		if (!ev.detail.value) {
			buttons.splice(index, 1);
		} else {
			buttons[index] = ev.detail.value;
		}

		this.config = {
			...this.config,
			buttons: buttons.length > 0 ? buttons : undefined
		};
		this._fireEvent();
	}

	_buttonChanged2(ev2, index2) {
		// 此方法已弃用，改用 _selectButton2 方法
		if (!this.config) return;
		const buttons2 = [...(this.config.buttons2 || [])];

		// 如果值为空，则删除该按钮
		if (!ev2.detail.value) {
			buttons2.splice(index2, 1);
		} else {
			buttons2[index2] = ev2.detail.value;
		}

		this.config = {
			...this.config,
			buttons2: buttons2.length > 0 ? buttons2 : undefined
		};
		this._fireEvent();
	}

	_addButton() {
		const buttons = [...(this.config.buttons || [])];
		if (buttons.length >= 7) return;
		buttons.push('');

		// 重置该按钮的搜索状态
		const newIndex = buttons.length - 1;
		if (!this._buttonSearchTerms) this._buttonSearchTerms = {};
		if (!this._filteredButtonEntities) this._filteredButtonEntities = {};
		if (!this._showButtonLists) this._showButtonLists = {};

		this._buttonSearchTerms[newIndex] = '';
		this._filteredButtonEntities[newIndex] = [];
		this._showButtonLists[newIndex] = false;

		this.config = {
			...this.config,
			buttons
		};
		this._fireEvent();
	}

	_addButton2() {
		const buttons2 = [...(this.config.buttons2 || [])];
		if (buttons2.length >= 7) return;
		buttons2.push('');

		// 重置该按钮的搜索状态
		const newIndex = buttons2.length - 1;
		if (!this._button2SearchTerms) this._button2SearchTerms = {};
		if (!this._filteredButton2Entities) this._filteredButton2Entities = {};
		if (!this._showButton2Lists) this._showButton2Lists = {};

		this._button2SearchTerms[newIndex] = '';
		this._filteredButton2Entities[newIndex] = [];
		this._showButton2Lists[newIndex] = false;

		this.config = {
			...this.config,
			buttons2
		};
		this._fireEvent();
	}

  _removeButton(index) {
    const buttons = [...(this.config.buttons || [])];
    buttons.splice(index, 1);

    // 清理该按钮的搜索状态
    if (this._buttonSearchTerms) {
      delete this._buttonSearchTerms[index];
    }
    if (this._filteredButtonEntities) {
      delete this._filteredButtonEntities[index];
    }
    if (this._showButtonLists) {
      delete this._showButtonLists[index];
    }

    this.config = {
      ...this.config,
      buttons: buttons.length > 0 ? buttons : undefined
    };
    this._fireEvent();
    this.requestUpdate();
  }

  _removeButton2(index2) {
    const buttons2 = [...(this.config.buttons2 || [])];
    buttons2.splice(index2, 1);

    // 清理该按钮的搜索状态
    if (this._button2SearchTerms) {
      delete this._button2SearchTerms[index2];
    }
    if (this._filteredButton2Entities) {
      delete this._filteredButton2Entities[index2];
    }
    if (this._showButton2Lists) {
      delete this._showButton2Lists[index2];
    }

    this.config = {
      ...this.config,
      buttons2: buttons2.length > 0 ? buttons2 : undefined
    };
    this._fireEvent();
    this.requestUpdate();
  }

  _removeTemperature() {
    if (!this.config) return;

    this._temperatureSearchTerm = '';
    this._showTemperatureList = false;
    this._filteredTemperatureEntities = [];

    this.config = {
      ...this.config,
      temperature: undefined
    };
    this._fireEvent();
    this.requestUpdate();
  }

  _removeTimer() {
    if (!this.config) return;

    this._timerSearchTerm = '';
    this._showTimerList = false;
    this._filteredTimerEntities = [];

    this.config = {
      ...this.config,
      timer: undefined
    };
    this._fireEvent();
    this.requestUpdate();
  }

  _themeSelectChanged(e) {
    if (!this.config) return;
    const theme = e.target.value;

    this.config = {
      ...this.config,
      theme
    };
    this._fireEvent();
  }

  _themeSwitchChanged(ev) {
    if (!this.config) return;
    const theme = ev.target.checked ? 'on' : 'off';

    this.config = {
      ...this.config,
      theme
    };
    this._fireEvent();
  }

  _widthChanged(e) {
    if (!this.config) return;
    const { name, value } = e.target;

    let finalValue = value;

    // 处理默认值
    if (name === 'width') {
      finalValue = value || '300px';
    }

    this.config = {
      ...this.config,
      [name]: finalValue
    };
    this._fireEvent();
  }

  _heightChanged(e) {
    if (!this.config) return;
    const { name, value } = e.target;

    let finalValue = value;

    // 处理默认值
    if (name === 'height') {
      finalValue = value || '300px';
    }

    this.config = {
      ...this.config,
      [name]: finalValue
    };
    this._fireEvent();
  }

  _showHvacModesChanged(ev) {
    if (!this.config) return;
    this.config = {
      ...this.config,
      show_hvac_modes: ev.target.checked
    };
    this._fireEvent();
  }

  _showFanModesChanged(ev) {
    if (!this.config) return;
    this.config = {
      ...this.config,
      show_fan_modes: ev.target.checked
    };
    this._fireEvent();
  }

  _showSwingModesChanged(ev) {
    if (!this.config) return;
    this.config = {
      ...this.config,
      show_swing_modes: ev.target.checked
    };
    this._fireEvent();
  }

  _showPresetModesChanged(ev) {
    if (!this.config) return;
    this.config = {
      ...this.config,
      show_preset_modes: ev.target.checked
    };
    this._fireEvent();
  }

  _showWaterModesChanged(ev) {
    if (!this.config) return;
    this.config = {
      ...this.config,
      show_water_modes: ev.target.checked
    };
    this._fireEvent();
  }

  _buttonPositionChanged(e) {
    if (!this.config) return;
    const buttonPosition = e.target.value;
    this.config = {
      ...this.config,
      button_position: buttonPosition
    };
    this._fireEvent();
  }

  _button2PositionChanged(e) {
    if (!this.config) return;
    const button2Position = e.target.value;
    this.config = {
      ...this.config,
      button2_position: button2Position
    };
    this._fireEvent();
  }

  _timerPositionChanged(e) {
    if (!this.config) return;
    const timerPosition = e.target.value;
    this.config = {
      ...this.config,
      timer_position: timerPosition
    };
    this._fireEvent();
  }

  _fireEvent() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }

  constructor() {
    super();
    this._searchTerm = '';
    this._filteredEntities = [];
    this._showEntityList = false;
    this._temperatureSearchTerm = '';
    this._filteredTemperatureEntities = [];
    this._showTemperatureList = false;
    this._timerSearchTerm = '';
    this._filteredTimerEntities = [];
    this._showTimerList = false;
    this._buttonSearchTerms = {};
    this._filteredButtonEntities = {};
    this._showButtonLists = {};
    this._button2SearchTerms = {};
    this._filteredButton2Entities = {};
    this._showButton2Lists = {};
    this._availableModes = {};
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    // 当 hass 第一次加载时，如果没有配置实体，自动选择第一个
    if (changedProperties.has('hass') && this.hass && !this.config.entity) {
      this._autoSelectFirstEntity();
    }
  }
}
customElements.define('xiaoshi-pad-climate-card-editor', XiaoshiPadClimateCardEditor);

class XiaoshiPadClimateCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      width: { type: String, attribute: true },
      config: { type: Object },
      buttons: { type: Array },
      theme: { type: String },
      _timerInterval: { state: true },
      temperatureData: { type: Array },
      _externalTempSensor: { type: String },
      entity: { type: Object },
      _variables: { type: Object }
    };
  }

  static getConfigElement() {
    return document.createElement("xiaoshi-pad-climate-card-editor");
  }

  static getStubConfig() {
    return {
      entity: 'climate.demo_ac',  // 使用 Home Assistant 的演示实体
      theme: 'on'
    };
  }

  setConfig(config) {
    this.config = config;
    this.buttons = config.buttons || [];
    this.buttons2 = config.buttons2 || [];
    this._externalTempSensor = config.temperature || null;
    if (config.width !== undefined) this.width = config.width;
    this.requestUpdate();
  }

  static get styles() {
    return css`
      :host {
        display: flex;
        align-items: stretch;
        gap: 8px;
      }

      .main-card {
        display: block;
        position: relative;
        background-color: var(--bg-color);
        border-radius: 15px;
        width: var(--card-width, 300px);
      }

      .side-button-wrapper {
        display: flex;
      }

      .side-button-bar {
        width: 60px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        border-radius: 15px;
      }

      .thermostat-card {
        position: relative;
        width: var(--card-width, 300px);
        height: 265px;
        display: flex;
        flex-direction: column;
      }

      .thermostat-container {
        flex: 1;
        width: var(--card-width, 300px);
        height: 265px;
        position: relative;
      }

      .error {
        padding: 16px;
        color: #dc2626;
        text-align: center;
      }

      .theme-on {
        --ha-card-background: rgb(255,255,255,0);          /*背景色*/
        --primary-text-color:rgb(0,0,0);                 /*文字颜色*/
        --disabled-color: rgb(150,150,150);              /*圆环背景色*/
        --_icon-color: rgb(0,0,0);                       /*图标颜色*/
        --secondary-text-color: rgb(0,0,0);              /*图标边框颜色*/
        --area-bg: rgb(230,230,230);                     /*按钮区域背景色*/
      }
      .theme-off {
        --ha-card-background: rgb(50,50,50,0);
        --primary-text-color:rgb(255,255,255);
        --disabled-color: rgb(220,220,220);
        --_icon-color: rgb(255,255,255);
        --secondary-text-color: rgb(255,255,255);
        --area-bg: rgb(80,80,80);                        /*按钮区域背景色*/
      }

      .modes-area, .fan-area, .preset-area, .swing-area, .water-area {
        display: flex;
        flex-wrap: nowrap;
        gap: 2px;
      }

      .mode-button {
        flex: 1;
        min-width: auto;
        height: 40px;
        border: none;
        border-radius: 10px;
        background: rgb(0,0,0,0);
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        --mdc-icon-size: 20px;
      }

      .mode-button .icon {
        width: 20px;
        height: 20px;
        color: var(--fg-color);
      }

      .mode-button.active-mode {
        background: var(--active-color);
      }

      .fan-button, .swing-button, .preset-button, .water-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0px;
        width: 100%;
        height: 100%;
        color: var(--fg-color);
        position: relative;
        --mdc-icon-size: 18px;
      }

      .swing-text, .preset-text, .water-text {
        font-size: 12px; 
        color: var(--fg-color);
      }

      .fan-text {
        font-size: 10px; 
        color: var(--fg-color);
        position: absolute;
        bottom: 6px;
        right: 6px;
        transform: translate(25%, 25%);
      }

      .area-bg-wrapper {
        background: var(--area-bg);
        border-radius: 10px;
        width: calc(100% - 20px);
        margin: 0px 10px;
        margin-bottom: 8px;
        box-sizing: border-box;
      }

      .side-extra-button {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 8px;
        background: var(--bg-color);
        cursor: pointer;
        padding: 0px;
        margin: 0px 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
      }

      .side-extra-button.active-extra {
      }

      .side-extra-button .side-icon {
        width: 16px;
        height: 16px;
        --mdc-icon-size: 16px;
      }

      .side-extra-button .side-text {
        font-size: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

    `;
  }

  constructor() {
    super();
    this.hass = {};
    this.config = {};
    this.buttons = [];
    this.buttons2 = [];
    this.theme = 'on';
    this.width = '300px';
    this._timerInterval = null;
    this.temperatureData = [];
    this.canvas = null;
    this.ctx = null;
    this._variables = {};
  }

  _evaluateTheme() {
    try {
      if (!this.config || !this.config.theme) return 'on';
      if (typeof this.config.theme === 'function') {
          return this.config.theme();
      }
      if (typeof this.config.theme === 'string' && 
              (this.config.theme.includes('return') || this.config.theme.includes('=>'))) {
          return (new Function(`return ${this.config.theme}`))();
      }
      return this.config.theme;
    } catch(e) {
      console.error('计算主题时出错:', e);
      return 'on';
    }
  }

  firstUpdated() {
    super.firstUpdated();
    this._loadOfficialThermostat();
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    // 当 hass 第一次加载时，如果没有配置实体或配置的实体不存在，自动选择第一个
    if (changedProperties.has('hass') && this.hass) {
      if (!this.config.entity || !this.hass.states[this.config.entity]) {
        const firstEntity = this._findFirstEntity();
        if (firstEntity) {
          this.config.entity = firstEntity;
          this.requestUpdate();
        }
      }
    }

    // 每次组件更新后，确保 thermostat-card 也更新
    this.updateFromHass();
  }

  _findFirstEntity() {
    if (!this.hass) return null;
    const allEntities = Object.values(this.hass.states);
    const firstEntity = allEntities.find(entity => {
      const entityId = entity.entity_id;
      return entityId.startsWith('climate.') || entityId.startsWith('water_heater.');
    });
    return firstEntity ? firstEntity.entity_id : null;
  }

  _loadOfficialThermostat() {
    this.updateComplete;

    const container = this.shadowRoot?.querySelector('#thermostatContainer');
    if (!container) return;

    // 创建 hui-thermostat-card 元素
    const thermostatCard = document.createElement('hui-thermostat-card');
    thermostatCard.hass = this.hass;
    thermostatCard.setConfig({
      type: 'thermostat',
      entity: this.config.entity
    });

    // 清空容器并添加元素
    container.innerHTML = '';
    container.appendChild(thermostatCard);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  connectedCallback() {
    super.connectedCallback();
    this.updateFromHass();
  }

  updateFromHass() {
    if (this.hass && this.config?.entity) {
      this.entity = this.hass.states[this.config.entity];
    }
    // 更新 thermostat-card 的 hass
    const container = this.shadowRoot?.querySelector('#thermostatContainer');
    if (container?.firstChild) {
      container.firstChild.hass = this.hass;
      // 强制触发 thermostat-card 的更新
      if (container.firstChild.requestUpdate) {
        container.firstChild.requestUpdate();
      }
    }
  }

  render() {
    if (!this.hass || !this.config.entity) {
        return html``;
    }

    if (!this.entity) {
      return html`<div class="error">实体未找到: ${this.config.entity}</div>`;
    }

    const entity = this.hass.states[this.config.entity];
    if (!entity) {
        return html`<div>实体未找到: ${this.config.entity}</div>`;
    }
    const state = entity.state;

    const attrs = entity.attributes;

    let current_temperature = '';
    if (this._externalTempSensor) {
      const tempEntity = this.hass.states[this._externalTempSensor];
      if (tempEntity && !isNaN(parseFloat(tempEntity.state))) {
        current_temperature = `室温: ${parseFloat(tempEntity.state).toFixed(1)}°C`;
      }
    } else if (typeof entity.attributes.current_temperature === 'number') {
      current_temperature = `室温: ${entity.attributes.current_temperature.toFixed(1)}°C`;
    }


    const theme = this._evaluateTheme();
    const themeClass = theme === 'on' ? 'theme-on' : 'theme-off';

    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = theme === 'on' ? 'rgb(255, 255, 255)' : 'rgb(50, 50, 50)';
    const buttonBg = theme === 'on' ? 'rgb(50,50,50)' : 'rgb(120,120,120)';
    const buttonFg = 'rgb(250,250,250)';

    let statusColor = 'rgb(250,250,250)';
    if (state === 'cool') statusColor = 'rgb(33,150,243)';
    else if (state === 'heat') statusColor = 'rgb(254,111,33)';
    else if (state === '自定义') statusColor = 'rgb(254,111,33)';
    else if (state === 'AI控温') statusColor = 'rgb(254,111,33)';
    else if (state === '婴童洗') statusColor = 'rgb(254,111,33)';
    else if (state === '舒适洗') statusColor = 'rgb(254,111,33)';
    else if (state === '宠物洗') statusColor = 'rgb(254,111,33)';
    else if (state === '厨房用') statusColor = 'rgb(254,111,33)';
    else if (state === 'dry') statusColor = 'rgb(255,151,0)';
    else if (state === 'fan' || state === 'fan_only') statusColor = 'rgb(0,188,213)';
    else if (state === 'auto') statusColor = 'rgb(147,112,219)'
    else if (state === 'off') statusColor = 'rgb(250,250,250)';

    const hasHvacModes = attrs.hvac_modes && attrs.hvac_modes.length > 0;
    const hasFanModes = attrs.fan_modes && attrs.fan_modes.length > 0;
    const hasSwingModes = attrs.swing_modes && attrs.swing_modes.length > 0;
    const hasPresetModes = attrs.preset_modes && attrs.preset_modes.length > 0;
    const hasWaterModes = attrs.operation_list && attrs.operation_list.length > 0;

    // 使用配置中的显示选项（如果存在），否则使用自动识别结果
    const showHvacModes = this.config.show_hvac_modes !== false && hasHvacModes;
    const showFanModes = this.config.show_fan_modes !== false && hasFanModes;
    const showSwingModes = this.config.show_swing_modes !== false && hasSwingModes;
    const showPresetModes = this.config.show_preset_modes !== false && hasPresetModes;
    const showWaterModes = this.config.show_water_modes !== false && hasWaterModes;

    const fanModes = attrs.fan_modes || [];
    const modeCount = fanModes.length;
    const currentFanMode = attrs.fan_mode;
    let fanSpeed = '2s'; 
    
    if (modeCount > 0 && currentFanMode) {
        const minSpeed = 2;
        const maxSpeed = 0.5;
        const speedStep = modeCount > 1 ? (minSpeed - maxSpeed) / (modeCount - 1) : 0;
        const currentIndex = fanModes.indexOf(currentFanMode);
        if (currentIndex >= 0) {
            fanSpeed = (minSpeed - (currentIndex * speedStep)).toFixed(1) + 's';
        }
    }

    // 动态计算总高度：基础高度310px（包含thermostat容器265px），每个启用模式区域增加48px
    const activeModeCount = (showHvacModes ? 1 : 0) +
                           (showFanModes ? 1 : 0) +
                           (showPresetModes ? 1 : 0) +
                           (showSwingModes ? 1 : 0) +
                           (showWaterModes ? 1 : 0);
    const cardHeight = 300 + (activeModeCount * 48);

    // 判断是否有定时器和附加按钮
    const hasTimer = this.config.timer;
    const hasButtons = this.buttons && this.buttons.length > 0;
    const hasButtons2 = this.buttons2 && this.buttons2.length > 0;
    const timerPosition = this.config.timer_position || 'left';
    const buttonPosition = this.config.button_position || 'left';
    const button2Position = this.config.button2_position || 'left';

    return html`
        ${hasTimer && timerPosition === 'left' ? html`
          <div class="side-button-wrapper">
            <div class="side-button-bar side-button-bar-left" style="background-color: ${bgColor}; height: ${cardHeight}px;">
              ${this._renderTimerButton()}
            </div>
          </div>
        ` : ''}

        ${hasButtons2 && button2Position === 'left' ? html`
          <div class="side-button-wrapper">
            <div class="side-button-bar side-button-bar-left" style="background-color: ${bgColor}; height: ${cardHeight}px;">
              ${this._renderExtraButtons(2)}
            </div>
          </div>
        ` : ''}

        ${hasButtons && buttonPosition === 'left' ? html`
          <div class="side-button-wrapper">
            <div class="side-button-bar side-button-bar-left" style="background-color: ${bgColor}; height: ${cardHeight}px;">
              ${this._renderExtraButtons(1)}
            </div>
          </div>
        ` : ''}

        <div class="main-card" style="--bg-color: ${bgColor}; --fg-color: ${fgColor}; --card-width: ${this.config.width || '300px'};">
          <div class="thermostat-card ${themeClass}" style="height: ${cardHeight}px; --card-height: ${cardHeight}px;">
            <div class="thermostat-container" id="thermostatContainer"></div>

            ${showHvacModes ? html`
                <div class="area-bg-wrapper">
                    <div class="modes-area">
                        ${this._renderModeButtons(attrs.hvac_modes, state)}
                    </div>
                </div>
            ` : ''}

            ${showFanModes ? html`
                <div class="area-bg-wrapper">
                    <div class="fan-area">
                        ${this._renderFanButtons(attrs.fan_modes, attrs.fan_mode)}
                    </div>
                </div>
            ` : ''}

            ${showPresetModes ? html`
                <div class="area-bg-wrapper">
                    <div class="preset-area">
                        ${this._renderPresetButtons(attrs.preset_modes, attrs.preset_mode)}
                    </div>
                </div>
            ` : ''}

            ${showSwingModes ? html`
                <div class="area-bg-wrapper">
                    <div class="swing-area">
                        ${this._renderSwingButtons(attrs.swing_modes, attrs.swing_mode)}
                    </div>
                </div>
            ` : ''}

            ${showWaterModes ? html`
                <div class="area-bg-wrapper">
                    <div class="water-area">
                        ${this._renderWaterButtons(attrs.operation_list, attrs.operation_mode)}
                    </div>
                </div>
            ` : ''}
          </div>
        </div>

        ${hasButtons && buttonPosition === 'right' ? html`
          <div class="side-button-wrapper">
            <div class="side-button-bar side-button-bar-right" style="background-color: ${bgColor}; height: ${cardHeight}px;">
              ${this._renderExtraButtons(1)}
            </div>
          </div>
        ` : ''}

        ${hasButtons2 && button2Position === 'right' ? html`
          <div class="side-button-wrapper">
            <div class="side-button-bar side-button-bar-right" style="background-color: ${bgColor}; height: ${cardHeight}px;">
              ${this._renderExtraButtons(2)}
            </div>
          </div>
        ` : ''}

        ${hasTimer && timerPosition === 'right' ? html`
          <div class="side-button-wrapper">
            <div class="side-button-bar side-button-bar-right" style="background-color: ${bgColor}; height: ${cardHeight}px;">
              ${this._renderTimerButton()}
            </div>
          </div>
        ` : ''}
    `;
  }

  _renderTimerButton() {
    const timerEntity = this.hass.states[this.config.timer];
    if (!timerEntity) return html``;

    const now = new Date();
    const finishesAt = new Date(timerEntity.attributes.finishes_at || 0);
    let remainingSeconds = Math.max(0, Math.floor((finishesAt - now) / 1000));

    const state = timerEntity.state;
    if (state !== 'active') {
      remainingSeconds = 0;
    }

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);

    const theme = this._evaluateTheme();
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = theme === 'on' ? 'rgb(230, 230, 230)' : 'rgb(80, 80, 80)';

    const climateEntity = this.hass.states[this.config.entity];
    const climateState = climateEntity ? climateEntity.state : 'off';
    
    let activeColor = bgColor;
    if (remainingSeconds > 0) {
      if (climateState === 'cool') activeColor = 'rgb(33,150,243)';
      else if (climateState === 'heat') activeColor = 'rgb(254,111,33)';
      else if (climateState === '自定义' || climateState === 'AI控温' ||
               climateState === '婴童洗' || climateState === '舒适洗' ||
               climateState === '宠物洗' || climateState === '厨房用') activeColor = 'rgb(254,111,33)';
      else if (climateState === 'dry') activeColor = 'rgb(255,151,0)';
      else if (climateState === 'fan' || climateState === 'fan_only') activeColor = 'rgb(0,188,213)';
      else if (climateState === 'auto') activeColor = 'rgb(147,112,219)';
    }

    return html`
      <button class="side-extra-button" style="cursor: pointer; background: ${bgColor};" @click=${this._cancelTimer}>
        <ha-icon class="side-icon" icon="mdi:close" style="color: ${fgColor}"></ha-icon>
        <span class="side-text" style="color: ${fgColor}">取消</span>
      </button>
      <button class="side-extra-button" style="cursor: pointer; background: ${bgColor};" @click=${() => this._adjustTimer(-1, remainingSeconds)}>
        <ha-icon class="side-icon" icon="mdi:minus" style="color: ${fgColor}"></ha-icon>
        <span class="side-text" style="color: ${fgColor}"></span>
      </button>
      <button class="side-extra-button" style="cursor: default; background: ${activeColor};">
        <span class="side-text" style="color: ${fgColor}; font-size: 12px; font-weight: bold;">${hours > 0 ? hours + 'h' : minutes + 'm'}</span>
      </button>
      <button class="side-extra-button" style="cursor: pointer; background: ${bgColor};" @click=${() => this._adjustTimer(1, remainingSeconds)}>
        <ha-icon class="side-icon" icon="mdi:plus" style="color: ${fgColor}"></ha-icon>
        <span class="side-text" style="color: ${fgColor}"></span>
      </button>
      <button class="side-extra-button" style="cursor: pointer; background: ${bgColor};" @click=${() => this._setTimer(60 * 60)}>
        <span class="side-text" style="color: ${fgColor}">1h</span>
      </button>
      <button class="side-extra-button" style="cursor: pointer; background: ${bgColor};" @click=${() => this._setTimer(3 * 60 * 60)}>
        <span class="side-text" style="color: ${fgColor}">3h</span>
      </button>
      <button class="side-extra-button" style="cursor: pointer; background: ${bgColor};" @click=${() => this._setTimer(8 * 60 * 60)}>
        <span class="side-text" style="color: ${fgColor}">8h</span>
      </button>
    `;
  } 

   _handleClick() {
     navigator.vibrate(50);
  }
  
  _formatSeconds(totalSeconds) {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  _getTimerAdjustAmount(currentSeconds, direction) {
      const currentMinutes = Math.ceil(currentSeconds / 60);
      
      if (direction === -1) {
          if (currentMinutes > 30) return '30分';
          if (currentMinutes > 10) return '10分';
          return '取消';
      } else {
          if (currentSeconds === 0) return '10分';
          if (currentMinutes < 30) return '10分';
          if (currentMinutes < 180) return '30分';
          return '1小时';
      }
  }

  _adjustTimer(direction, currentSeconds) {
      if (!this.config.timer) return;
      
      const currentMinutes = Math.ceil(currentSeconds / 60);
      let newSeconds = 0;
      
      if (direction === -1) {
          if (currentMinutes > 30) {
              newSeconds = currentSeconds - (30 * 60);
          } else if (currentMinutes > 10) {
              newSeconds = currentSeconds - (10 * 60);
          } else {
              this._cancelTimer();
              return;
          }
      } else {
          if (currentSeconds === 0) {
              newSeconds = 10 * 60;
          } else if (currentMinutes < 30) {
              newSeconds = currentSeconds + (10 * 60);
          } else if (currentMinutes < 180) {
              newSeconds = currentSeconds + (30 * 60);
          } else {
              newSeconds = currentSeconds + (60 * 60);
          }
      }
      
      this._setTimer(newSeconds);
  }

  _cancelTimer() {
      if (!this.config.timer) return;
      this._callService('timer', 'cancel', {
          entity_id: this.config.timer
      });
  }

  _setTimer(totalSeconds) {
      if (!this.config.timer) return;
      const now = new Date();
      const finishesAt = new Date(now.getTime() + totalSeconds * 1000);
      if (this.hass.states[this.config.timer].state === 'active') {
          this._callService('timer', 'cancel', {
              entity_id: this.config.timer
          });
      }
      this._callService('timer', 'start', {
          entity_id: this.config.timer,
          duration: this._formatSeconds(totalSeconds)
      });
  }


_renderExtraButtons(buttonType = 1) {
    const buttonArray = buttonType === 1 ? this.buttons : this.buttons2;
    if (!buttonArray || buttonArray.length === 0) return html``;

    const buttonsToShow = buttonArray.slice(0, 7);
    const entity = this.hass.states[this.config.entity];
    if (!entity) {
        return html`<div>实体未找到: ${this.config.entity}</div>`;
    }

    const state = entity?.state || 'off';
    const theme = this._evaluateTheme();
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = theme === 'on' ? 'rgb(230, 230, 230)' : 'rgb(80, 80, 80)';
    let activeColor = theme === 'on' ? 'rgba(0, 188, 213)' : 'rgba(0, 188, 213)';
    if (state === 'cool') activeColor = 'rgb(33,150,243)';
    else if (state === 'heat') activeColor = 'rgb(254,111,33)';
    else if (state === '自定义' || state === 'AI控温' || state === '婴童洗' || state === '舒适洗' || state === '宠物洗' || state === '厨房用') activeColor = 'rgb(254,111,33)';
    else if (state === 'dry') activeColor = 'rgb(255,151,0)';
    else if (state === 'fan' || state === 'fan_only') activeColor = 'rgb(0,188,213)';
    else if (state === 'auto') activeColor = 'rgb(147,112,219)';

    return buttonsToShow.map(buttonEntityId => {
        const entity = this.hass.states[buttonEntityId];
        if (!entity) return html``;

        const domain = buttonEntityId.split('.')[0];
        const friendlyName = entity.attributes.friendly_name || '';
        const displayName = friendlyName.slice(0, 4);
        const displayValueColor = entity.state.includes('低') || entity.state.includes('少') || entity.state.includes('缺') ? 'red' : fgColor;

        // 根据名称自定义图标
        const _getCustomIcon = (name, isActive) => {
            if (name.includes('辅热')) return 'mdi:heating-coil';
            if (name.includes('干燥')) return 'mdi:heat-wave';
            if (name.includes('节能')) return isActive ? 'mdi:leaf' : 'mdi:leaf-off';
            if (name.includes('睡眠')) return isActive ? 'mdi:sleep' : 'mdi:sleep-off';
            if (name.includes('指示灯')) return isActive ? 'mdi:lightbulb-on' : 'mdi:lightbulb-off';
            if (name.includes('提示音')) return isActive ? 'mdi:volume-high' : 'mdi:volume-mute';
            if (name.includes('防冻')) return isActive ? 'mdi:snowflake' : 'mdi:snowflake-off';
            if (name.includes('防烫伤')) return isActive ? 'mdi:fire' : 'mdi:fire-off';
            if (name.includes('按键锁')) return isActive ? 'mdi:lock-open' : 'mdi:lock-open-variant';
            return null;
        };

        switch(domain) {
            case 'switch':
            case 'light':
                const isActive = entity.state === 'on';
                const customIcon = _getCustomIcon(friendlyName, isActive);
                const icon = customIcon || (isActive ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off');
                const buttonColor = isActive ? activeColor : fgColor;

                return html`
                    <button
                        class="side-extra-button ${isActive ? 'active-extra' : ''}"
                        @click=${() => this._handleExtraButtonClick(buttonEntityId, domain)}
                        style="--active-color: ${buttonColor}; --bg-color: ${bgColor};"
                        title="${friendlyName}"
                    >
                        <ha-icon class="side-icon" icon="${icon}" style="color: ${buttonColor}"></ha-icon>
                        <span class="side-text" style="color: ${buttonColor}">${displayName}</span>
                    </button>
                `;

            case 'sensor':
                const unit = entity.attributes.unit_of_measurement || '';
                const displayValue = `${entity.state}${unit}`.slice(0, 4);

                return html`
                    <div class="side-extra-button" style="cursor: default; --bg-color: ${bgColor};">
                        <div class="side-value" style="color: ${displayValueColor}; font-size: 11px; font-weight: bold; white-space: nowrap">${displayValue}</div>
                        <span class="side-text" style="color: ${fgColor};">${displayName}</span>
                    </div>
                `;

            case 'button':
                const buttonIcon = 'mdi:button-pointer';

                return html`
                    <button class="side-extra-button"
                            @click=${() => this._handleExtraButtonClick(buttonEntityId, domain)}
                            style="color: ${fgColor}; --bg-color: ${bgColor};">
                        <ha-icon class="side-icon" icon="${buttonIcon}" style="color: ${fgColor}"></ha-icon>
                        <span class="side-text" style="color: ${fgColor};">${displayName}</span>
                    </button>
                `;

            case 'select':
                const state = entity.state || '';
                const selectDisplayValue = state.slice(0, 4);

                return html`
                    <div class="side-extra-button"
                            @click=${() => this._handleExtraButtonClick(buttonEntityId, domain)}
                            style="cursor: default; --bg-color: ${bgColor};">
                        <div class="side-value" style="color: ${fgColor}; font-size: 11px; font-weight: bold; white-space: nowrap">${selectDisplayValue}</div>
                        <span class="side-text" style="color: ${fgColor};">${displayName}</span>
                    </div>
                `;

            default:
                return html``;
        }
    });
}
    
  _handleExtraButtonClick(entityId, domain) {
      const entity = this.hass.states[entityId];
      if (!entity) return;
      
      switch(domain) {
          case 'switch':
          case 'light':
              const service = entity.state === 'on' ? 'turn_off' : 'turn_on';
              this._callService(domain, service, { entity_id: entityId });
              break;
              
          case 'button':
              this._callService('button', 'press', { entity_id: entityId });
              break;
              
          case 'select':
              this._callService('select', 'select_next', { entity_id: entityId });
              break;
      }
      
      this._handleClick();
  }

  _getSwingIcon(mode) {
      const swingIcons = {
          'off': 'mdi:arrow-oscillating-off',
          'vertical': 'mdi:arrow-up-down',
          'horizontal': 'mdi:arrow-left-right',
          'both': 'mdi:arrow-all',
          '🔄': 'mdi:autorenew',
          '⬅️': 'mdi:arrow-left',
          '⬆️': 'mdi:arrow-up',
          '➡️': 'mdi:arrow-right',
          '⬇️': 'mdi:arrow-down',
          '↖️': 'mdi:arrow-top-left',
          '↗️': 'mdi:arrow-top-right',
          '↘️': 'mdi:arrow-bottom-right',
          '↙️': 'mdi:arrow-bottom-left',
          '↔️': 'mdi:arrow-left-right',
          '↕️': 'mdi:arrow-up-down',
          '←': 'mdi:arrow-left',
          '↑': 'mdi:arrow-up',
          '→': 'mdi:arrow-right',
          '↓': 'mdi:arrow-down',
          '↖': 'mdi:arrow-top-left',
          '↗': 'mdi:arrow-top-right',
          '↘': 'mdi:arrow-bottom-right',
          '↙': 'mdi:arrow-bottom-left',
          '↔': 'mdi:arrow-left-right',
          '↕': 'mdi:arrow-up-down'
      };
      return swingIcons[mode] || '';
  }

  _getPresetIcon(mode) {
      const presetIcons = {
          '普通': 'mdi:radiator',
          '除螨': 'mdi:radiator',
          'none': 'mdi:thermostat',
          'comfort': 'mdi:home-heart',
          'eco': 'mdi:leaf',
          'boost': 'mdi:rocket',
          'sleep': 'mdi:power-sleep',
          'away': 'mdi:home-export-outline'
      };
      return presetIcons[mode] || '';
  }

  _getWaterIcon(mode) {
    const waterIcons = {
        '自定义': 'mdi:pencil',
        'AI控温': 'mdi:water-boiler-auto',
        '婴童洗': 'mdi:human-baby-changing-table',
        '舒适洗': 'mdi:hand-heart',
        '宠物洗': 'mdi:cat',
        '厨房用': 'mdi:countertop'
    };
    return '';
  }

  _renderModeButtons(modes, currentMode) {
      if (!modes) return html``;

      const entity = this.hass.states[this.config.entity];
      const state = entity ? entity.state : 'off';
      const theme = this._evaluateTheme();

      const modeIcons = {
          'auto': 'mdi:thermostat-auto',
          'heat': 'mdi:fire',
          'cool': 'mdi:snowflake',
          'dry': 'mdi:water-percent',
          'fan_only': 'mdi:fan',
          'fan': 'mdi:fan',
          'off': 'mdi:power'
      };

      return modes.map(mode => {
          const isActive = mode === currentMode;
          let bgColor = 'rgb(0,0,0,0)';
          const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
          if (isActive) {
              if (state === 'cool' && mode === 'cool') bgColor = 'rgb(33,150,243)';
              else if (state === 'heat' && mode === 'heat') bgColor = 'rgb(254,111,33)';
              else if (state === 'dry' && mode === 'dry') bgColor = 'rgb(255,151,0)';
              else if (state === 'fan_only' && mode === 'fan_only') bgColor = 'rgb(0,188,213)';
              else if (state === 'off' && mode === 'off') bgColor = theme === 'on' ? 'rgb(180,180,180)' : 'rgb(150,150,150)';
          }

          return html`
              <button
                  class="mode-button ${isActive ? 'active-mode' : ''}"
                  @click=${() => this._setHvacMode(mode)}
                  style="--active-color: ${bgColor}; background: ${isActive ? bgColor : 'rgb(0,0,0,0)'}"
                  title="${this._translateMode(mode)}"
              >
                  <ha-icon class="icon" icon="${modeIcons[mode] || 'mdi:thermostat'}" style="color: ${isActive ? (theme === 'on' ? 'rgb(0,0,0)' : 'rgb(255,255,255)') : ''}"></ha-icon>
              </button>
          `;
      });
  }

  _renderFanButtons(fanModes, currentFanMode) {
    if (!fanModes || fanModes.length === 0) return html``;

    const entity = this.hass.states[this.config.entity];
    const state = entity ? entity.state : 'off';
    const theme = this._evaluateTheme();

    return fanModes.map((mode, index) => {
        const isActive = mode === currentFanMode;
        let bgColor = 'rgb(0,0,0)';

        if (isActive) {
            if (state === 'cool') bgColor = 'rgb(33,150,243)';
            else if (state === 'heat') bgColor = 'rgb(254,111,33)';
            else if (state === 'dry') bgColor = 'rgb(255,151,0)';
            else if (state === 'fan_only') bgColor = 'rgb(0,188,213)';
            else if (state === 'auto') bgColor = 'rgb(147,112,219)';
            else if (state === 'off') bgColor = theme === 'on' ? 'rgb(180,180,180)' : 'rgb(150,150,150)';
        }

        return html`
            <button
                class="mode-button ${isActive ? 'active-mode' : ''}"
                @click=${() => this._setFanMode(mode)}
                style="--active-color: ${bgColor}; background: ${isActive ? bgColor : 'rgb(0,0,0,0)'}"
            >
                <div class="fan-button">
                    <ha-icon
                        class="fan-button-icon ${isActive ? 'active-fan-button-icon' : ''}"
                        icon="mdi:fan"
                        style="color: ${isActive ? (theme === 'on' ? 'rgb(0,0,0)' : 'rgb(255,255,255)') : ''}"
                    ></ha-icon>
                    <span class="fan-text">${this._translateFanMode(mode)}</span>
                </div>
            </button>
        `;
    });
  }
  
  _renderSwingButtons(swingModes, currentSwingMode) {
      if (!swingModes) return html``;

      const entity = this.hass.states[this.config.entity];
      const state = entity ? entity.state : 'off';
      const theme = this._evaluateTheme();

      return swingModes.map(mode => {
          const isActive = mode === currentSwingMode;
          let bgColor = 'rgb(0,0,0,0)';

          if (isActive) {
              if (state === 'cool') bgColor = 'rgb(33,150,243)';
              else if (state === 'heat') bgColor = 'rgb(254,111,33)';
              else if (state === 'dry') bgColor = 'rgb(255,151,0)';
              else if (state === 'fan_only') bgColor = 'rgb(0,188,213)';
              else if (state === 'off') bgColor = theme === 'on' ? 'rgb(180,180,180)' : 'rgb(150,150,150)';
          }

          return html`
              <button
                  class="mode-button ${isActive ? 'active-mode' : ''}"
                  @click=${() => this._setSwingMode(mode)}
                  style="--active-color: ${bgColor}; background: ${isActive ? bgColor : 'rgb(0,0,0,0)'}"
              >
                  <div class="swing-button">
                      <ha-icon class="icon" icon="${this._getSwingIcon(mode)}" style="color: ${isActive ? (theme === 'on' ? 'rgb(0,0,0)' : 'rgb(255,255,255)') : ''}"></ha-icon>
                      <span class="swing-text">${this._translateSwingMode(mode)}</span>
                  </div>
              </button>
          `;
      });
  }
  
  _renderPresetButtons(presetModes, currentPresetMode) {
      if (!presetModes) return html``;

      const entity = this.hass.states[this.config.entity];
      const state = entity ? entity.state : 'off';
      const theme = this._evaluateTheme();

      return presetModes.map(mode => {
          const isActive = mode === currentPresetMode;
          let bgColor = 'rgb(0,0,0,0)';

          if (isActive) {
              if (state === 'cool') bgColor = 'rgb(33,150,243)';
              else if (state === 'heat') bgColor = 'rgb(254,111,33)';
              else if (state === 'dry') bgColor = 'rgb(255,151,0)';
              else if (state === 'fan_only') bgColor = 'rgb(0,188,213)';
              else if (state === 'off') bgColor = theme === 'on' ? 'rgb(180,180,180)' : 'rgb(150,150,150)';
          }

          return html`
              <button
                  class="mode-button ${isActive ? 'active-mode' : ''}"
                  @click=${() => this._setPresetMode(mode)}
                  style="--active-color: ${bgColor}; background: ${isActive ? bgColor : 'rgb(0,0,0,0)'}"
              >
                  <div class="preset-button">
                      <ha-icon class="icon" icon="${this._getPresetIcon(mode)}" style="color: ${isActive ? (theme === 'on' ? 'rgb(0,0,0)' : 'rgb(255,255,255)') : ''}"></ha-icon>
                      <span class="preset-text">${this._translatePresetMode(mode)}</span>
                  </div>
              </button>
          `;
      });
  }
  
  _renderWaterButtons(operation_list, operation_mode) {
    if (!operation_list) return html``;

    const entity = this.hass.states[this.config.entity];
    const state = entity ? entity.state : 'off';
    const theme = this._evaluateTheme();

    return operation_list.map(mode => {
        const isActive = mode === operation_mode;
        let bgColor = 'rgb(0,0,0,0)';

        if (isActive) {
            if (state === 'cool') bgColor = 'rgb(33,150,243)';
            else if (state === 'heat') bgColor = 'rgb(254,111,33)';
            else if (state === 'dry') bgColor = 'rgb(255,151,0)';
            else if (state === 'fan_only') bgColor = 'rgb(0,188,213)';
            else if (state === 'off') bgColor = theme === 'on' ? 'rgb(180,180,180)' : 'rgb(150,150,150)';
        }

        return html`
            <button
                class="mode-button ${isActive ? 'active-mode' : ''}"
                @click=${() => this._setWaterMode(mode)}
                style="--active-color: ${bgColor}; background: ${isActive ? bgColor : 'rgb(0,0,0,0)'}"
            >
                <div class="water-button">
                    <span class="water-text">${mode}</span>
                </div>
            </button>
        `;
    });
  }

  _translateMode(mode) {
      const translations = {
          'cool': '制冷',
          'heat': '制热',
          'dry': '除湿',
          'fan_only': '吹风',
          'fan': '吹风',
          'auto': '自动',
          'off': '关闭'
      };
      return translations[mode] || mode;
  }

  _translateFanMode(mode) {
      if (mode.includes('自动') || mode.includes('auto')) return 'A';
      if (mode.includes('一') || mode.includes('1')) return '1';
      if (mode.includes('二') || mode.includes('2')) return '2';
      if (mode.includes('三') || mode.includes('3')) return '3';
      if (mode.includes('四') || mode.includes('4')) return '4';
      if (mode.includes('五') || mode.includes('5')) return '5';
      if (mode.includes('六') || mode.includes('6')) return '6';
      if (mode.includes('七') || mode.includes('7')) return '7';
      if (mode.includes('silent') || mode.includes('静')) return '静';
      if (mode.includes('low') || mode.includes('低')) return '低';
      if (mode.includes('稍弱')) return '弱';
      if (mode.includes('稍强')) return '强';
      if (mode.includes('medium') || mode.includes('中')) return '中';
      if (mode.includes('high') || mode.includes('高')) return '高';
      if (mode.includes('full') || mode.includes('全')) return '全';
      if (mode.includes('最大') || mode.includes('max')|| mode.includes('Max')) return 'M';
      return mode;
  }

  _translateSwingMode(mode) {
    const arrowSymbols = new Set([
      '🔄', '⬅️', '⬆️', '➡️', '⬇️','↔️','↕️','↖️', '↗️', '↘️', '↙️',
      '←', '↑', '→', '↓', '↔', '↕','↖', '↗', '↘', '↙'
    ]);
    if (arrowSymbols.has(mode)) return '';

    const translations = {
        'off': '\u00A0\u00A0关闭',
        'vertical': '\u00A0\u00A0垂直',
        'horizontal': '\u00A0\u00A0水平',
        'both': '\u00A0\u00A0立体',
    };
    return translations[mode] || mode;
  }

  _translatePresetMode(mode) {
    const translations = {
        '普通': '\u00A0\u00A0普通',
        '除螨': '\u00A0\u00A0除螨',
        'none': '\u00A0基础',
        'comfort': '\u00A0舒适',
        'eco': '\u00A0节能',
        'boost': '\u00A0强力',
        'sleep': '\u00A0睡眠',
        'away': '\u00A0离家',
    };
    return translations[mode] || mode;
  }

  _setHvacMode(mode) {
      this._callService('climate', 'set_hvac_mode', {
          entity_id: this.config.entity,
          hvac_mode: mode
      });
      this._handleClick();
  }

  _setFanMode(mode) {
      this._callService('climate', 'set_fan_mode', {
          entity_id: this.config.entity,
          fan_mode: mode
      });
      this._handleClick();
  }

  _setSwingMode(mode) {
      this._callService('climate', 'set_swing_mode', {
          entity_id: this.config.entity,
          swing_mode: mode
      });
      this._handleClick();
  }

  _setPresetMode(mode) {
      this._callService('climate', 'set_preset_mode', {
          entity_id: this.config.entity,
          preset_mode: mode
      });
      this._handleClick();
  }

  _setWaterMode(mode) {
    this._callService('water_heater', 'set_operation_mode', {
        entity_id: this.config.entity,
        operation_mode: mode
    });
    this._handleClick();
  }

  _callService(domain, service, data) {
      this.hass.callService(domain, service, data);
      this._handleClick();
  }
}

customElements.define('xiaoshi-pad-climate-card', XiaoshiPadClimateCard);
