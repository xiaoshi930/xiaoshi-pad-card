import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class XiaoshiConsumablesButtonEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _searchTerm: { type: String },
      _filteredEntities: { type: Array },
      _showEntityList: { type: Boolean }
    };
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
        justify-content: space-between;
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

      .selected-entities {
        margin-top: 8px;
      }

      .selected-label {
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 4px;
        color: #333;
      }

      .selected-entity-config {
        margin-bottom: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 8px;
        background: #f9f9f9;
      }

      .selected-entity {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 8px;
        font-size: 12px;
        color: #000;
        justify-content: space-between;
      }

      .attribute-config {
        margin-top: 4px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .attribute-input {
        width: 100%;
        padding: 4px 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 12px;
        box-sizing: border-box;
      }

      .override-config {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 2px;
      }

      .override-checkbox {
        margin-right: 4px;
      }

      .override-input {
        flex: 1;
        padding: 2px 6px;
        border: 1px solid #ddd;
        border-radius: 3px;
        font-size: 11px;
        box-sizing: border-box;
      }

      .override-label {
        font-size: 11px;
        color: #666;
        white-space: nowrap;
      }

      .remove-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        color: #666;
        margin-left: auto;
      }

      .remove-btn:hover {
        color: #f44336;
      }

      /*button新元素 开始*/
      .checkbox-group {
        display: flex;
        align-items: center;
        gap: 0;
        margin: 0;
        padding: 0;
      }

      .checkbox-input {
        margin: 0;
      }

      .checkbox-label {
        font-weight: normal;
        margin: 0;
      }
      /*button新元素 结束*/
    `;
  }

  render() {
    if (!this.hass) return html``;

    return html`
      <div class="form">

      <!-- button新元素 开始-->
        <div class="form-group">
          <label>按钮宽度：默认16vw, 支持像素(px)和百分比(%)</label>
          <input 
            type="text" 
            @change=${this._entityChanged}
            .value=${this.config.button_width !== undefined ? this.config.button_width : '16vw'}
            name="button_width"
            placeholder="默认16vw"
          />
        </div>

        <div class="form-group">
          <label>按钮高度：支持像素(px)、百分比(%)和视窗高度(vh)，默认2.8vh</label>
          <input 
            type="text" 
            @change=${this._entityChanged}
            .value=${this.config.button_height !== undefined ? this.config.button_height : '2.8vh'}
            name="button_height"
            placeholder="默认2.8vh"
            />
        </div>
        
        <div class="form-group">
          <label>按钮文字大小：支持像素(px)，默认1.25vh</label>
          <input 
            type="text" 
            @change=${this._entityChanged}
            .value=${this.config.button_font_size !== undefined ? this.config.button_font_size : '1.25vh'}
            name="button_font_size"
            placeholder="默认1.25vh"
          />
        </div>
        
        <div class="form-group">
          <label>按钮图标大小：支持像素(px)，默认18px</label>
          <input 
            type="text" 
            @change=${this._entityChanged}
            .value=${this.config.button_icon_size !== undefined ? this.config.button_icon_size : '18px'}
            name="button_icon_size"
            placeholder="默认18px"
          />
        </div>

        <div class="form-group">
          <label>配置弹出卡片额外内容（显示在耗材卡片下方）</label>
          <textarea 
            @change=${this._entityChanged}
            .value=${this.config.tap_action || ''}
            name="tap_action"
            placeholder=
'type: vertical-stack
cards:
  - type: custom:xiaoshi-petrochina-card
    entities:
      - sensor.fuel_price_shaanxi
  - type: custom:xiaoshi-button-card
'
            style="min-height: 90px; font-family: monospace;"
          ></textarea>
        </div>



        <div class="form-group">

          <label> </label>
          <label>👇👇👇下面是弹出卡片内容👇👇👇</label>
          <label> </label>
        </div>

        <div class="checkbox-group">
          <input 
            type="checkbox" 
            class="checkbox-input"
            @change=${this._entityChanged}
            .checked=${this.config.show_preview !== false}
            name="show_preview"
            id="show_preview"
          />
          <label for="show_preview" class="checkbox-label" style="color: red;"> 弹出卡片预览（正式使用时取消勾选）</label>
        </div>

        <!-- button新元素 结束-->

        <div class="form-group">
          <label>卡片宽度：支持像素(px)和百分比(%)，默认100%</label>
          <input 
            type="text" 
            @change=${this._entityChanged}
            .value=${this.config.width !== undefined ? this.config.width : '100%'}
            name="width"
            placeholder="默认100%"
          />
        </div>
        
        <div class="form-group">
          <label>标题名称：配置卡片显示的标题</label>
          <input 
            type="text" 
            @change=${this._entityChanged}
            .value=${this.config.name !== undefined ? this.config.name : '耗材信息统计'}
            name="name"
            placeholder="默认：耗材信息统计"
          />
        </div>

        <div class="form-group">
          <label>全局预警条件：当任一实体满足此条件时触发预警</label>
          <input 
            type="text" 
            @change=${this._entityChanged}
            .value=${this.config.global_warning || ''}
            name="global_warning"
            placeholder="如: >10, <=5, ==on, ==off, =='hello world'"
          />
          <div class="help-text">
            全局预警条件：当任一实体满足此条件时，该实体显示为红色预警状态<br>
            优先级：明细预警 > 全局预警 > 无预警<br>
            预警基于换算后的结果进行判断（如果配置了换算）
          </div>
        </div>
        
        <div class="form-group">
          <label>列数：明细显示的列数</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.columns !== undefined ? this.config.columns : '2'}
            name="columns"
          >
            <option value="1">1列</option>
            <option value="2">2列（默认）</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>主题</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.theme !== undefined ? this.config.theme : 'on'}
            name="theme"
          >
            <option value="on">浅色主题（白底黑字）</option>
            <option value="off">深色主题（深灰底白字）</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>设备耗材实体：搜索并选择实体</label>
          <div class="entity-selector">
            <input 
              type="text" 
              @input=${this._onEntitySearch}
              @focus=${this._onEntitySearch}
              .value=${this._searchTerm || ''}
              placeholder="搜索实体..."
              class="entity-search-input"
            />
            ${this._showEntityList ? html`
              <div class="entity-dropdown">
                ${this._filteredEntities.map(entity => html`
                  <div 
                    class="entity-option ${this.config.entities && this.config.entities.some(e => e.entity_id === entity.entity_id) ? 'selected' : ''}"
                    @click=${() => this._toggleEntity(entity.entity_id)}
                  >
                    <div class="entity-info">
                      <div class="entity-details">
                        <div class="entity-name">${entity.attributes.friendly_name || entity.entity_id}</div>
                        <div class="entity-id">${entity.entity_id}</div>
                      </div>
                      <ha-icon icon="${entity.attributes.icon || 'mdi:help-circle'}"></ha-icon>
                    </div>
                    ${this.config.entities && this.config.entities.some(e => e.entity_id === entity.entity_id) ? 
                      html`<ha-icon icon="mdi:check" class="check-icon"></ha-icon>` : ''}
                  </div>
                `)}
                ${this._filteredEntities.length === 0 ? html`
                  <div class="no-results">未找到匹配的实体</div>
                ` : ''}
              </div>
            ` : ''}
          </div>
          <div class="selected-entities">
            ${this.config.entities && this.config.entities.length > 0 ? html`
              <div class="selected-label">已选择的实体：</div>
              ${this.config.entities.map((entityConfig, index) => {
                const entity = this.hass.states[entityConfig.entity_id];
                return html`
                  <div class="selected-entity-config">
                    <div class="selected-entity">
                      <span>${entity?.attributes.friendly_name || entityConfig.entity_id}</span>
                      <ha-icon icon="${entity?.attributes.icon || 'mdi:help-circle'}"></ha-icon>
                      <button class="remove-btn" @click=${() => this._removeEntity(index)}>
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                    </div>
                    <div class="attribute-config">
                      <input 
                        type="text" 
                        @change=${(e) => this._updateEntityAttribute(index, e.target.value)}
                        .value=${entityConfig.attribute || ''}
                        placeholder="留空使用实体状态，或输入属性名"
                        class="attribute-input"
                      />
                      
                      <div class="override-config">
                        <input 
                          type="checkbox" 
                          class="override-checkbox"
                          @change=${(e) => this._updateEntityOverride(index, 'icon', e.target.checked)}
                          .checked=${entityConfig.overrides?.icon !== undefined}
                        />
                        <span class="override-label">图标:</span>
                        <input 
                          type="text" 
                          class="override-input"
                          @change=${(e) => this._updateEntityOverrideValue(index, 'icon', e.target.value)}
                          .value=${entityConfig.overrides?.icon || ''}
                          placeholder="mdi:icon-name"
                          ?disabled=${entityConfig.overrides?.icon === undefined}
                        />
                      </div>

                      <div class="override-config">
                        <input 
                          type="checkbox" 
                          class="override-checkbox"
                          @change=${(e) => this._updateEntityOverride(index, 'name', e.target.checked)}
                          .checked=${entityConfig.overrides?.name !== undefined}
                        />
                        <span class="override-label">名称:</span>
                        <input 
                          type="text" 
                          class="override-input"
                          @change=${(e) => this._updateEntityOverrideValue(index, 'name', e.target.value)}
                          .value=${entityConfig.overrides?.name || ''}
                          placeholder="自定义名称"
                          ?disabled=${entityConfig.overrides?.name === undefined}
                        />
                      </div>

                      <div class="override-config">
                        <input 
                          type="checkbox" 
                          class="override-checkbox"
                          @change=${(e) => this._updateEntityOverride(index, 'unit_of_measurement', e.target.checked)}
                          .checked=${entityConfig.overrides?.unit_of_measurement !== undefined}
                        />
                        <span class="override-label">单位:</span>
                        <input 
                          type="text" 
                          class="override-input"
                          @change=${(e) => this._updateEntityOverrideValue(index, 'unit_of_measurement', e.target.value)}
                          .value=${entityConfig.overrides?.unit_of_measurement || ''}
                          placeholder="自定义单位"
                          ?disabled=${entityConfig.overrides?.unit_of_measurement === undefined}
                        />
                      </div>
                      
                      <div class="override-config">
                        <input 
                          type="checkbox" 
                          class="override-checkbox"
                          @change=${(e) => this._updateEntityOverride(index, 'warning', e.target.checked)}
                          .checked=${entityConfig.overrides?.warning !== undefined}
                        />
                        <span class="override-label">预警:</span>
                        <input 
                          type="text" 
                          class="override-input"
                          @change=${(e) => this._updateEntityOverrideValue(index, 'warning', e.target.value)}
                          .value=${entityConfig.overrides?.warning || ''}
                          placeholder='>10, <=5, ==on,=="hello world"'
                          ?disabled=${entityConfig.overrides?.warning === undefined}
                        />
                      </div>

                      <div class="override-config">
                        <input 
                          type="checkbox" 
                          class="override-checkbox"
                          @change=${(e) => this._updateEntityOverride(index, 'conversion', e.target.checked)}
                          .checked=${entityConfig.overrides?.conversion !== undefined}
                        />
                        <span class="override-label">换算:</span>
                        <input 
                          type="text" 
                          class="override-input"
                          @change=${(e) => this._updateEntityOverrideValue(index, 'conversion', e.target.value)}
                          .value=${entityConfig.overrides?.conversion || ''}
                          placeholder="+10, -10, *1.5, /2"
                          ?disabled=${entityConfig.overrides?.conversion === undefined}
                        />
                      </div>

                      <div class="help-text">
                        <strong>预警：</strong>针对单个实体的预警条件，优先级高于全局预警<br>
                        <strong>换算：</strong>对原始数值进行数学运算，支持 +10, -10, *1.5, /2 等格式<br>
                      </div>
                    </div>
                  </div>
                `;
              })}
            ` : ''}
          </div>
          <div class="help-text">
            搜索并选择要显示的设备耗材实体，支持多选。每个实体可以配置：<br>
            • <strong>特殊实体显示：</strong>binary_sensor(off→正常,on→缺少), event(unknown→正常,其他→低电量)<br>
            • 属性名：留空使用实体状态，或输入属性名<br>
            • 名称重定义：勾选后可自定义显示名称<br>
            • 图标重定义：勾选后可自定义图标（如 mdi:phone）<br>
            • 单位重定义：勾选后可自定义单位（如 元、$、kWh 等）<br>
            • 预警条件：勾选后设置预警条件，支持 >10, >=10, <10, <=10, ==10, ==on, ==off, =="hello world" 等<br>
            • 换算：对数值进行数学运算，支持 +10, -10, *1.5, /2 等<br>
            • 未勾选重定义时，将使用实体的原始属性值
          </div>
        </div>
      </div>

    `;
  }

  _entityChanged(e) {

    /*button新按钮方法 开始*/
    const { name, value, type, checked } = e.target;
    
    let finalValue;
    
    // 处理复选框
    if (type === 'checkbox') {
      finalValue = checked;
    } else {
      if (!value && name !== 'theme' && name !== 'button_width' && name !== 'button_height' && name !== 'button_font_size' && name !== 'button_icon_size' && name !== 'width' && name !== 'tap_action') return;
      finalValue = value 
    }
    
    // 处理不同字段的默认值
    if (name === 'button_width') {
      finalValue = value || '16vw';
    } else if (name === 'button_height') {
      finalValue = value || '2.8vh';
    } else if (name === 'button_font_size') {
      finalValue = value || '1.25vh';
    } else if (name === 'button_icon_size') {
      finalValue = value || '18px';
    } else if (name === 'width') {
      finalValue = value || '100%';
    } else if (name === 'tap_action') {
      // 处理tap_action YAML配置
      finalValue = value || '';
      // 只保存原始YAML，不保存解析后的对象到配置中
      // 解析后的对象将在setConfig中处理
    }
    /*button新按钮方法 结束*/

    this.config = {
      ...this.config,
      [name]: finalValue
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
  }

  // 简单的YAML卡片解析函数
  _parseYamlCards(yamlText) {
    try {
      // 这里是一个简化的解析器，实际使用中建议使用js-yaml库
      // 假设用户输入的是这样的格式：
      // cards:
      //   - type: entities
      //     entities:
      //       - entity: sun.sun
      
      // 简单解析：提取cards数组
      const lines = yamlText.split('\n');
      const cards = [];
      let currentCard = null;
      let indentLevel = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        if (trimmed.startsWith('cards:')) {
          continue; // 跳过cards行
        }
        
        if (trimmed.startsWith('- type:')) {
          if (currentCard) {
            cards.push(currentCard);
          }
          currentCard = {
            type: trimmed.replace('- type:', '').trim()
          };
        } else if (currentCard && trimmed && !trimmed.startsWith('#')) {
          const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
          if (match) {
            const [, spaces, key, value] = match;
            if (key.trim() !== 'type') {
              if (!currentCard.properties) {
                currentCard.properties = {};
              }
              currentCard.properties[key.trim()] = value ? value.trim() : '';
            }
          }
        }
      }
      
      if (currentCard) {
        cards.push(currentCard);
      }
      
      return { cards: cards };
    } catch (error) {
      console.error('YAML解析错误:', error);
      return null;
    }
  }

  // 解析tap_action YAML配置 - 支持简化的配置格式
  _parseTapActionYaml(yamlText) {
    try {
  
      
      // 检查是否是简化格式（只包含 type 和 cards，没有action字段）
      const hasAction = yamlText.includes('action:');
      const hasTypeAndCards = yamlText.includes('type:') && yamlText.includes('cards:');
      
      console.log('弹窗调试: hasAction =', hasAction, 'hasTypeAndCards =', hasTypeAndCards);
      
      if (!hasAction && hasTypeAndCards) {
        console.log('弹窗调试: 检测到简化格式');
        
        // 提取type值
        const typeMatch = yamlText.match(/type:\s*(.+)$/m);
        const stackType = typeMatch ? typeMatch[1].trim() : 'vertical-stack';
        console.log('弹窗调试: 解析到的type =', stackType);
        
        // 解析cards部分 - 使用完整的YAML解析逻辑
        const cardsMatch = yamlText.match(/cards:\s*\n((?:\s*-.+\n?)*)/);
        let cards = [];
        
        if (cardsMatch) {
          const cardsText = cardsMatch[1];
          const cardLines = cardsText.split('\n').filter(line => line.trim());
          let currentCard = null;
          let cardIndent = 0;
          
          for (let i = 0; i < cardLines.length; i++) {
            const line = cardLines[i];
            const trimmed = line.trim();
            const indent = line.match(/^(\s*)/)[1].length;
            
            if (trimmed.startsWith('- type:')) {
              // 保存上一个卡片（如果有）
              if (currentCard) {
                cards.push(currentCard);
              }
              
              // 开始新卡片
              const cardType = trimmed.replace('- type:', '').trim();
              currentCard = { type: cardType };
              cardIndent = indent;
              
              // 如果是耗材卡片，自动添加配置参数
              if (cardType === 'custom:xiaoshi-consumables-card') {
                const excludedParams = ['type', 'button_height', 'button_width', 'button_font_size', 'button_icon_size', 'show_preview', 'tap_action'];
                Object.keys(this.config).forEach(key => {
                  if (!excludedParams.includes(key)) {
                    currentCard[key] = this.config[key];
                  }
                });
                console.log('弹窗调试: 为耗材卡片添加参数:', currentCard);
              }
            } else if (currentCard && indent > cardIndent && trimmed && !trimmed.startsWith('#')) {
              // 解析卡片属性
              const match = trimmed.match(/^([^:]+):\s*(.*)$/);
              if (match) {
                const [, key, value] = match;
                // 只排除 type 字段，其他所有字段都传递
                if (key.trim() !== 'type') {
                  // 处理特殊值类型
                  let parsedValue = value ? value.trim() : '';
                  
                  // 处理布尔值
                  if (parsedValue === 'true') parsedValue = true;
                  else if (parsedValue === 'false') parsedValue = false;
                  // 处理数字
                  else if (!isNaN(parsedValue) && parsedValue !== '') parsedValue = Number(parsedValue);
                  
                  currentCard[key.trim()] = parsedValue;
                }
              }
            }
          }
          
          // 保存最后一个卡片
          if (currentCard) {
            cards.push(currentCard);
          }
        }
        
        // 如果没有耗材卡片，自动添加一个
        const hasConsumablesCard = cards.some(card => card.type === 'custom:xiaoshi-consumables-card');
        if (!hasConsumablesCard) {
          const excludedParams = ['type', 'button_height', 'button_width', 'button_font_size', 'button_icon_size', 'show_preview', 'tap_action'];
          const consumablesCard = { 
            type: 'custom:xiaoshi-consumables-card'
          };
          
          Object.keys(this.config).forEach(key => {
            if (!excludedParams.includes(key)) {
              consumablesCard[key] = this.config[key];
            }
          });
          
          cards.unshift(consumablesCard);
          console.log('弹窗调试: 自动添加耗材卡片:', consumablesCard);
        }
        
        // 构建完整样式，包括用户配置和自动添加的宽度
        const fullStyle = this._buildFullPopupStyle();
        
        const result = {
          action: 'fire-dom-event',
          browser_mod: {
            service: 'browser_mod.popup',
            data: {
              style: fullStyle,
              content: {
                type: stackType,
                cards: cards
              }
            }
          }
        };
        
        console.log('弹窗调试: 简化格式解析结果:', JSON.stringify(result, null, 2));
        return result;
      }
      
      // 原有的完整格式解析逻辑
      const lines = yamlText.split('\n');
      const config = {};
      const stack = [config];
      const pathStack = [];
      let multilineValue = null;
      let multilineKey = null;
      let multilineIndent = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

  
        
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        // 处理多行字符串
        if (multilineValue !== null) {
          const currentIndent = line.match(/^(\s*)/)[1].length;
          if (currentIndent > multilineIndent) {
            multilineValue.push(line);
            continue;
          } else {
            // 多行字符串结束
            const current = stack[stack.length - 1];
            current[multilineKey] = multilineValue.join('\n');
            multilineValue = null;
            multilineKey = null;
          }
        }
        
        // 检查是否是多行字符串开始
        if (trimmed === '|') {
          // 获取上一行的键
          for (let j = i - 1; j >= 0; j--) {
            const prevLine = lines[j];
            const prevTrimmed = prevLine.trim();
            if (prevTrimmed && prevTrimmed.includes(':')) {
              const colonIndex = prevTrimmed.indexOf(':');
              multilineKey = prevTrimmed.substring(0, colonIndex).trim();
              break;
            }
          }
          if (multilineKey) {
            multilineValue = [];
            multilineIndent = line.match(/^(\s*)/)[1].length;

            continue;
          }
        }
        
        // 计算缩进级别
        const indent = line.match(/^(\s*)/)[1].length;
        const level = Math.floor(indent / 2);
        
        // 调整栈到正确的层级
        while (stack.length > level + 1) {
          stack.pop();
          pathStack.pop();
        }
        
        const current = stack[stack.length - 1];
        
        if (trimmed.startsWith('- type:')) {
          // 处理数组项
          const cardType = trimmed.replace('- type:', '').trim();
          const card = { type: cardType };
          
          // 如果是耗材卡片，自动添加配置参数
          if (cardType === 'custom:xiaoshi-consumables-card') {
            const excludedParams = ['type', 'button_height', 'button_width', 'button_font_size', 'button_icon_size', 'show_preview', 'tap_action'];
            Object.keys(this.config).forEach(key => {
              if (!excludedParams.includes(key)) {
                card[key] = this.config[key];
              }
            });
            console.log('弹窗调试: 为耗材卡片添加参数:', card);
          }
          
          if (!Array.isArray(current)) {
            // 如果当前不是数组，需要找到父对象并创建数组
            const parentKey = pathStack[pathStack.length - 1];
            const parent = stack[stack.length - 2];
            if (parent && parentKey) {
              parent[parentKey] = [];
              stack[stack.length - 1] = parent[parentKey];
            } else {
              // 如果找不到父对象，创建一个新数组
              const newArray = [card];
              stack[stack.length - 1] = newArray;
              stack.push(card);
              pathStack.push('card');
              continue;
            }
          }
          
          // 确保 current 是数组后再 push
          if (Array.isArray(current)) {
            current.push(card);
            stack.push(card);
            pathStack.push('card');
          }
        } else if (trimmed.startsWith('- ')) {
          // 处理普通数组项（如 - sensor.fuel_price_shaanxi）
          const itemValue = trimmed.substring(2).trim();
          
          if (!Array.isArray(current)) {
            // 如果当前不是数组，需要找到父对象并创建数组
            const parentKey = pathStack[pathStack.length - 1];
            const parent = stack[stack.length - 2];
            if (parent && parentKey) {
              parent[parentKey] = [];
              stack[stack.length - 1] = parent[parentKey];
            } else {
              console.error('弹窗调试: 无法找到父数组');
              continue;
            }
          }
          
          // 确保 current 是数组后再 push
          if (Array.isArray(current)) {
            current.push(itemValue);
          }
        } else if (trimmed.startsWith('- ')) {
          // 处理数组项（非type开头的）
          const itemValue = trimmed.substring(2).trim();
          
          // 确保当前上下文是数组
          if (Array.isArray(current)) {
            current.push(itemValue);

          } else {
            // 如果当前不是数组，查找最近的数组
            for (let j = stack.length - 1; j >= 0; j--) {
              const obj = stack[j];
              for (const key in obj) {
                if (Array.isArray(obj[key])) {
                  obj[key].push(itemValue);

                  break;
                }
              }
              break;
            }
          }
        } else if (trimmed.includes(':')) {
          const colonIndex = trimmed.indexOf(':');
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim();
          
          if (value && value !== '|') {
            // 有值的键值对
            current[key] = value;

          } else if (value !== '|') {
            // 没有值的键，需要判断是创建对象还是数组
            // 检查下一行是否以"  - "开头（表示是数组项）
            const nextLineIndex = i + 1;
            const shouldCreateArray = nextLineIndex < lines.length && 
                                     lines[nextLineIndex].trim().startsWith('- ');
            
            if (shouldCreateArray) {
              current[key] = [];
  
            } else {
              current[key] = {};
  
            }
            stack.push(current[key]);
            pathStack.push(key);
          }
        }
      }
      
      // 处理最后的多行字符串
      if (multilineValue !== null && multilineKey !== null) {
        const current = stack[stack.length - 1];
        current[multilineKey] = multilineValue.join('\n');
      }
      
      // 确保有耗材卡片
      if (config.browser_mod && config.browser_mod.data && config.browser_mod.data.content && config.browser_mod.data.content.cards) {
        const cards = config.browser_mod.data.content.cards;
        const hasConsumablesCard = cards.some(card => card.type === 'custom:xiaoshi-consumables-card');
        
        if (!hasConsumablesCard) {
          const excludedParams = ['type', 'button_height', 'button_width', 'button_font_size', 'button_icon_size', 'show_preview', 'tap_action'];
          const consumablesCard = { 
            type: 'custom:xiaoshi-consumables-card'
          };
          
          Object.keys(this.config).forEach(key => {
            if (!excludedParams.includes(key)) {
              consumablesCard[key] = this.config[key];
            }
          });
          
          cards.unshift(consumablesCard);
          console.log('弹窗调试: 自动添加耗材卡片到完整格式:', consumablesCard);
        }
      }
      

      return config;
    } catch (error) {
      console.error('tap_action YAML解析错误:', error);

      return null;
    }
  }

  // 处理单行YAML
  _processYamlLine(line, config, currentPath) {
    const trimmed = line.trim();
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    
    if (trimmed.includes(':')) {
      const colonIndex = trimmed.indexOf(':');
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      
      // 根据缩进确定路径深度（每2个空格为一级）
      const expectedDepth = Math.floor(indent / 2);
      currentPath = currentPath.slice(0, expectedDepth);
      currentPath.push(key);
      
      if (value) {
        this._setNestedValue(config, currentPath, value);
        currentPath = currentPath.slice(0, -1);
      }
    } else if (trimmed.startsWith('- type:')) {
      // 处理数组项
      const expectedDepth = Math.floor((indent - 2) / 2);
      currentPath = currentPath.slice(0, expectedDepth);
      
      // 确保父路径存在且是数组
      if (currentPath.length === 0) {
        console.error('数组项没有父级路径');
        return;
      }
      
      const parentPath = currentPath.slice(0, -1);
      const arrayKey = currentPath[currentPath.length - 1];
      
      let parent = config;
      for (const pathKey of parentPath) {
        if (!parent[pathKey]) parent[pathKey] = {};
        parent = parent[pathKey];
      }
      
      if (!parent[arrayKey]) parent[arrayKey] = [];
      
      const cardType = trimmed.replace('- type:', '').trim();
      parent[arrayKey].push({ type: cardType });
    }
  }

  // 设置嵌套值
  _setNestedValue(obj, path, value) {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  }



  _onEntitySearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    this._searchTerm = searchTerm;
    this._showEntityList = true;
    
    if (!this.hass) return;
    
    const allEntities = Object.values(this.hass.states);
    
    this._filteredEntities = allEntities.filter(entity => {
      const entityId = entity.entity_id.toLowerCase();
      const friendlyName = (entity.attributes.friendly_name || '').toLowerCase();
      
      return entityId.includes(searchTerm) || friendlyName.includes(searchTerm);
    }).slice(0, 50);
    
    this.requestUpdate();
  }

  _toggleEntity(entityId) {
    const currentEntities = this.config.entities || [];
    let newEntities;
    
    if (currentEntities.some(e => e.entity_id === entityId)) {
      newEntities = currentEntities.filter(e => e.entity_id !== entityId);
    } else {
      newEntities = [...currentEntities, { 
        entity_id: entityId, 
        overrides: undefined
      }];
    }
    
    this.config = {
      ...this.config,
      entities: newEntities
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
    
    this.requestUpdate();
  }

  _removeEntity(index) {
    const currentEntities = this.config.entities || [];
    const newEntities = currentEntities.filter((_, i) => i !== index);
    
    this.config = {
      ...this.config,
      entities: newEntities
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
    
    this.requestUpdate();
  }

  _updateEntityAttribute(index, attributeValue) {
    const currentEntities = this.config.entities || [];
    const newEntities = [...currentEntities];
    
    if (newEntities[index]) {
      const trimmedValue = attributeValue.trim();
      if (trimmedValue === '') {
        // 如果属性为空，则从配置中移除 attribute 字段
        const { attribute, ...entityWithoutAttribute } = newEntities[index];
        newEntities[index] = entityWithoutAttribute;
      } else {
        // 如果属性不为空，则设置属性值
        newEntities[index] = {
          ...newEntities[index],
          attribute: trimmedValue
        };
      }
    }
    
    this.config = {
      ...this.config,
      entities: newEntities
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
    
    this.requestUpdate();
  }

  _updateEntityOverride(index, overrideType, enabled) {
    const currentEntities = this.config.entities || [];
    const newEntities = [...currentEntities];
    
    if (newEntities[index]) {
      const overrides = { ...newEntities[index].overrides };
      
      if (enabled) {
        overrides[overrideType] = '';
      } else {
        delete overrides[overrideType];
      }
      
      newEntities[index] = {
        ...newEntities[index],
        overrides: Object.keys(overrides).length > 0 ? overrides : undefined
      };
    }
    
    this.config = {
      ...this.config,
      entities: newEntities
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
    
    this.requestUpdate();
  }

  _updateEntityOverrideValue(index, overrideType, value) {
    const currentEntities = this.config.entities || [];
    const newEntities = [...currentEntities];
    
    if (newEntities[index] && newEntities[index].overrides && newEntities[index].overrides[overrideType] !== undefined) {
      const overrides = { ...newEntities[index].overrides };
      overrides[overrideType] = value.trim();
      
      newEntities[index] = {
        ...newEntities[index],
        overrides: overrides
      };
    }
    
    this.config = {
      ...this.config,
      entities: newEntities
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
    
    this.requestUpdate();
  }

  firstUpdated() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.entity-selector')) {
        this._showEntityList = false;
        this.requestUpdate();
      }
    });
  }

  constructor() {
    super();
    this._searchTerm = '';
    this._filteredEntities = [];
    this._showEntityList = false;
  }

  setConfig(config) {
    this.config = config;
    
    // 如果有tap_action配置，自动解析为内部使用的_tap_action_config
    // 不保存到配置中，只作为内部属性使用
    if (config.tap_action && config.tap_action.trim() && config.tap_action !== 'none') {
      try {
        this._tap_action_config = this._parseTapActionYaml(config.tap_action);
      } catch (error) {
        console.error('tap_action解析失败:', error);
        this._tap_action_config = null;
      }
    } else {
      this._tap_action_config = null;
    }
  }
} 
customElements.define('xiaoshi-consumables-button-editor', XiaoshiConsumablesButtonEditor);

class XiaoshiConsumablesButton extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
      _oilPriceData: Array,
      _loading: Boolean,
      _refreshInterval: Number,
      theme: { type: String }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: var(--card-width, 100%);
      }

      /*button新元素 开始*/
      .consumables-status {
        width: var(--button-width, 16vw);
        height: var(--button-height, 2.8vh);
        padding: 0;
        margin: 0;
        background: var(--bg-color, #fff);
        color: var(--fg-color, #000);
        border-radius: 10px;
        font-size: var(--button-font-size, 14px);
        font-weight: 500;
        text-align: center;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
      }

      .status-icon {
        --mdc-icon-size: var(--button-icon-size, 18px);
        color: var(--fg-color, #000);
      }
      /*button新元素 结束*/

      ha-card {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--bg-color, #fff);
        border-radius: 12px;
      }

      /*标题容器*/
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: var(--bg-color, #fff);
        border-radius: 12px;
      }

      /*标题红色圆点*/
      .offline-indicator {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;
      }

      /*标题红色圆点动画*/
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }

      /*标题*/
      .card-title {
        font-size: 20px;
        font-weight: 500;
        color: var(--fg-color, #000);
        height: 30px;
        line-height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        

      }

      /*标题统计数字*/
      .device-count {
        color: var(--fg-color, #000);
        border-radius: 8px;
        font-size: 13px;
        width: 30px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        font-weight: bold;
        padding: 0px;
      }
      
      .device-count.non-zero {
        background: rgba(255, 0, 0, 0.7);
        color: #fff;
      }
      
      .device-count.zero {
        background: rgba(0, 205, 0, 0.7);
        color: #fff;
      }

      /*标题刷新按钮*/
      .refresh-btn {
        color: var(--fg-color, #fff);
        border: none;
        border-radius: 8px;
        padding: 5px;
        cursor: pointer;
        font-size: 13px;
        width: 50px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        font-weight: bold;
        padding: 0px;
      }

      /*2级标题*/
      .section-divider {
        margin: 0 0 8px 0;
        padding: 8px 8px;
        background: var(--bg-color, #fff);
        font-weight: 500;
        color: var(--fg-color, #000);
        border-top: 1px solid rgb(150,150,150,0.5);
        border-bottom: 1px solid rgb(150,150,150,0.5);
        margin: 0 16px 0 16px;

      }
      
      /*2级标题字体*/
      .section-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--fg-color, #000);
        font-size: 13px;
      }

      /*2级标题,统计数量字体*/
      .section-count {
        background: rgb(255,0,0,0.5);
        color: var(--fg-color, #000);
        border-radius: 12px;
        width: 15px;
        height: 15px;
        text-align: center;
        line-height: 15px;
        padding: 3px;
        font-size: 12px;
        font-weight: bold;
      }

      /*设备、实体明细*/
      .device-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0px 16px;
        padding: 0;
        border-bottom: 1px solid rgb(150,150,150,0.5);
        cursor: pointer;
        transition: background-color 0.2s;
        min-height: 30px;
        max-height: 30px;
      }

      .device-item:first-child {
        border-top: 1px solid rgb(150,150,150,0.5);
      }

      .device-item:hover {
        background-color: rgba(150,150,150,0.1);
      }

      /*设备、实体明细背景*/
      .devices-list {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        padding: 0 0 8px 0;
      }

      /*2列布局容器*/
      .devices-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 0 15px;
        padding: 0px 16px;
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }

      /*强制每列等宽*/
      .devices-grid > * {
        min-width: 0;
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }

      /*2列布局中的设备项*/
      .devices-grid .device-item {
        margin: 0.5px 0;
        padding: 0;
        background: var(--bg-color, #fff);
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: background-color 0.2s;
        min-height: 30px;
        max-height: 30px;
        border-bottom: none;
        border-right: none;
        border-left: none;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow: hidden;
        border-bottom: 1px solid rgb(150,150,150,0.5);
      }

      .devices-grid .device-item:hover {
        background-color: rgba(150,150,150,0.1);
      }

      /*2列布局中的第一行顶部边框*/
      .devices-grid .device-item:nth-child(1),
      .devices-grid .device-item:nth-child(2) {
        border-top: 1px solid rgb(150,150,150,0.5);
      }

      /*1列布局保持原有样式*/
      .devices-list.single-column {
        padding: 0 0 8px 0;
      }

      .device-left {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        overflow: hidden;
      }

      .device-icon {
        margin-right: 8px;
        color: var(--fg-color, #000);
        flex-shrink: 0;
        font-size: 10px;
        width: 12px;
        height: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .device-name {
        color: var(--fg-color, #000);
        font-size: 9px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        min-width: 0;
      }

      .device-value {
        color: var(--fg-color, #000);
        font-size: 9px;
        flex-shrink: 0;
        font-weight: bold;
        max-width: 45%;
        text-align: right;
        overflow: hidden;
        white-space: nowrap;
      }

      .device-value.warning {
        color: #F44336;
      }

      .device-unit {
        font-size: 9px;
        color: var(--fg-color, #000);
        margin-left: 0.5px;
        font-weight: bold;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .device-unit.warning {
        color: #F44336;
      }

      .no-devices {
        text-align: center;
        padding: 10px 0;
        color: var(--fg-color, #000);
      }

      .loading {
        text-align: center;
        padding: 10px 0;
        color: var(--fg-color, #000);
      }
    `;
  }

  constructor() {
    super();
    this._oilPriceData = [];
    this._loading = false;
    this._refreshInterval = null;
    this.theme = 'on';
  }

  static getConfigElement() {
    return document.createElement("xiaoshi-consumables-button-editor");
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadOilPriceData();
    
    // 设置主题属性
    this.setAttribute('theme', this._evaluateTheme());
    
    // 每300秒刷新一次数据，减少频繁刷新
    this._refreshInterval = setInterval(() => {
      this._loadOilPriceData();
    }, 300000);
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

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
    }
  }

  async _loadOilPriceData() {
    if (!this.hass) return;
    
    this._loading = true;
    this.requestUpdate();

    try {
      const entities = this.config.entities || [];
      const consumablesData = [];

      for (const entityConfig of entities) {
        const entityId = entityConfig.entity_id;
        const attributeName = entityConfig.attribute;
        const entity = this.hass.states[entityId];
        if (!entity) continue;

        const attributes = entity.attributes;
        let value = entity.state;
        let unit = '元';

        // 如果指定了属性，则使用属性值
        if (attributeName && attributes[attributeName] !== undefined) {
          value = attributes[attributeName];
        }

        // 特殊实体类型的数值显示逻辑
        if (!attributeName) {
          // binary_sensor 实体：off显示正常，on显示缺少
          if (entityId.startsWith('binary_sensor.')) {
            if (value === 'off') {
              value = '正常';
            } else if (value === 'on') {
              value = '缺少';
            }
          }
          // event 实体：unknown显示正常，非unknown或不可用时显示低电量
          else if (entityId.startsWith('event.')) {
            if (value === 'unknown') {
              value = '正常';
            } else if (value !== 'unknown' && value !== 'unavailable') {
              value = '低电量';
            }
          }
        }

        // 尝试从属性中获取单位
        if (attributes.unit_of_measurement) {
          unit = attributes.unit_of_measurement;
        } else {
          // 如果实体没有单位，则不显示单位
          unit = '';
        }

        // 应用属性重定义
        let friendlyName = attributes.friendly_name || entityId;
        let icon = attributes.icon || 'mdi:help-circle';
        let warningThreshold = undefined;
        let conversion = undefined;
        
        // 应用用户自定义的重定义
        if (entityConfig.overrides) {
          if (entityConfig.overrides.name !== undefined && entityConfig.overrides.name !== '') {
            friendlyName = entityConfig.overrides.name;
          }
          if (entityConfig.overrides.icon !== undefined && entityConfig.overrides.icon !== '') {
            icon = entityConfig.overrides.icon;
          }
          if (entityConfig.overrides.unit_of_measurement !== undefined && entityConfig.overrides.unit_of_measurement !== '') {
            unit = entityConfig.overrides.unit_of_measurement;
          }
          if (entityConfig.overrides.warning !== undefined && entityConfig.overrides.warning !== '') {
            warningThreshold = entityConfig.overrides.warning; // 保持原始字符串
          }
          if (entityConfig.overrides.conversion !== undefined && entityConfig.overrides.conversion !== '') {
            conversion = entityConfig.overrides.conversion; // 换算表达式
          }
        }

        // 应用换算（只对数值进行换算，不对文本状态进行换算）
        let originalValue = value;
        if (conversion && !isNaN(parseFloat(value))) {
          value = this._applyConversion(value, conversion);
        } else if (conversion && isNaN(parseFloat(value))) {
        }

        consumablesData.push({
          entity_id: entityId,
          friendly_name: friendlyName,
          value: value,
          original_value: originalValue,
          unit: unit,
          icon: icon,
          warning_threshold: warningThreshold,
          conversion: conversion
        });
      }

      this._oilPriceData = consumablesData;
    } catch (error) {
      console.error('加载设备耗材数据失败:', error);
      this._oilPriceData = [];
    }

    this._loading = false;
  }

  _handleRefresh() {
    this._loadOilPriceData();
    navigator.vibrate(50);
  }

  _handleEntityClick(entity) {
    navigator.vibrate(50);
    // 点击实体时打开实体详情页
    if (entity.entity_id) {
      const evt = new Event('hass-more-info', { composed: true });
      evt.detail = { entityId: entity.entity_id };
      this.dispatchEvent(evt);
    }
  }
  /*button新元素 开始*/
  
  // 获取默认弹出样式
  _getDefaultPopupStyle() {
    return '--mdc-theme-surface: rgba(0,0,0,0)\n--dialog-backdrop-filter: blur(10px) brightness(1);';
  }
  
  // 构建完整的弹出样式
  _buildFullPopupStyle() {
    const baseStyle = this._getDefaultPopupStyle();
    const popupMinWidth = this.config.width || '100%';
    return baseStyle + `\n--popup-min-width: ${popupMinWidth}`;
  }
  
  _handleButtonClick() {
    // 默认 tap_action 行为：弹出耗材卡片
    const excludedParams = ['type', 'button_height', 'button_width', 'button_font_size', 'button_icon_size', 'show_preview', 'tap_action'];
    const cardConfig = {};
    
    Object.keys(this.config).forEach(key => {
      if (!excludedParams.includes(key)) {
        cardConfig[key] = this.config[key];
      }
    });



    // 检查是否配置了自定义的 tap_action
    if (this._tap_action_config) {

      // 使用用户配置的自定义tap_action
      const actionConfig = this._tap_action_config;
      
      // 如果是简化格式（没有action字段），需要包装成browser_mod格式
      if (!actionConfig.action && actionConfig.type) {

        
        // 创建新的配置对象，避免循环引用
        const originalContent = { ...actionConfig };
        
        // 清空原对象并重新赋值
        Object.keys(actionConfig).forEach(key => delete actionConfig[key]);
        
        // 设置新的browser_mod格式
        actionConfig.action = 'fire-dom-event';
        actionConfig.browser_mod = {
          service: 'popup',
          data: {
            content: originalContent,
            style: this._buildFullPopupStyle()
          }
        };
        

      }
      
      // 如果配置中有content且是vertical-stack，则插入耗材卡片
      if (actionConfig.browser_mod && actionConfig.browser_mod.data && 
          actionConfig.browser_mod.data.content) {
        
        let content = actionConfig.browser_mod.data.content;

        
        // 如果content是字符串，尝试解析为JSON
        if (typeof content === 'string') {
          try {
            content = JSON.parse(content);

          } catch (e) {
            console.error('解析content失败:', e);
            content = {};
          }
        }
        
        // 如果是vertical-stack且有cards数组，插入耗材卡片
        if (content.type === 'vertical-stack' && Array.isArray(content.cards)) {
          // 先移除已存在的耗材卡片，避免重复插入
          content.cards = content.cards.filter(card => 
            card.type !== 'custom:xiaoshi-consumables-card'
          );
          
          const consumablesCard = {
            type: 'custom:xiaoshi-consumables-card',
            ...cardConfig
          };
          
          content.cards.unshift(consumablesCard);
          actionConfig.browser_mod.data.content = content;
        }
      }
      
      // 执行配置的动作
      if (actionConfig.action === 'fire-dom-event' && window.browser_mod) {

        
        // 使用用户配置的完整content
        try {

          const popupData = {
            ...actionConfig.browser_mod.data
          };
          
          // 构建完整的样式，包括用户配置和自动添加的宽度
          const fullStyle = this._buildFullPopupStyle();
          
          // 如果没有style，使用构建的完整style
          if (!popupData.style && !popupData['--mdc-theme-surface']) {
            popupData.style = fullStyle;
          } else if (popupData.style) {
            // 如果已有style，追加宽度配置
            popupData.style += `\n--popup-min-width: ${this.config.width || '100%'}`;
          }
          
          window.browser_mod.service('popup', popupData);
        } catch (error) {
          console.error('用户配置弹窗失败，使用备用方案:', error);
          
          // 备用方案：使用默认耗材卡片
          const consumablesContent = {
            type: 'custom:xiaoshi-consumables-card',
            ...cardConfig
          };
          
          window.browser_mod.service('popup', {
            style: this._buildFullPopupStyle(),
            content: consumablesContent
          });
        }
      } else {

      }
    } else {

      // 默认行为：只显示耗材卡片
      const popupStyle = this._buildFullPopupStyle();
      
      if (window.browser_mod) {
        // 使用之前工作的简单方式
        const simplePopupContent = {
          type: 'custom:xiaoshi-consumables-card',
          ...cardConfig
        };
        
        window.browser_mod.service('popup', { 
          style: popupStyle,
          content: simplePopupContent
        });
      }
    }
    navigator.vibrate(50);
  }
  
  // 备选的弹出方案
  _showDefaultPopup(content) {
    try {
      const event = new Event('hass-more-info', { 
        composed: true, 
        bubbles: true 
      });
      event.detail = { 
        entityId: 'none',
        content: content
      };
      this.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to show default popup:', error);
    }
  }
  /*button新元素 结束*/
  
  _renderDeviceItem(consumablesData) {
    let isWarning = false;
    
    // 特殊实体类型的默认预警逻辑
    if (consumablesData.entity_id.startsWith('binary_sensor.') && !consumablesData.warning_threshold) {
      // binary_sensor: "缺少"状态时预警
      isWarning = consumablesData.value === '缺少';
    } else if (consumablesData.entity_id.startsWith('event.') && !consumablesData.warning_threshold) {
      // event: "低电量"状态时预警
      isWarning = consumablesData.value === '低电量';
    } else {
      // 使用配置的预警条件
      if (consumablesData.warning_threshold && consumablesData.warning_threshold.trim() !== '') {
        isWarning = this._evaluateWarningCondition(consumablesData.value, consumablesData.warning_threshold);
      } else {
        if (this.config.global_warning && this.config.global_warning.trim() !== '') {
          isWarning = this._evaluateWarningCondition(consumablesData.value, this.config.global_warning);
        }
      }
    }
    
    return html`
      <div class="device-item" @click=${() => this._handleEntityClick(consumablesData)}>
        <div class="device-left">
          <ha-icon class="device-icon" icon="${consumablesData.icon}"></ha-icon>
          <div class="device-name">${consumablesData.friendly_name}</div>
        </div>
        <div class="device-value ${isWarning ? 'warning' : ''}">
          ${consumablesData.value}
          <span class="device-unit ${isWarning ? 'warning' : ''}">${consumablesData.unit}</span>
        </div>
      </div>
    `;
  }

  _applyConversion(value, conversion) {
    if (!conversion || !value) return value;
    
    try {
      // 提取数值部分
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        console.warn(`无法将值 "${value}" 转换为数字进行换算`);
        return value;
      }
      
      // 解析换算表达式
      const match = conversion.match(/^([+\-*/])(\d+(?:\.\d+)?)$/);
      if (!match) {
        console.warn(`无效的换算表达式: "${conversion}"，支持的格式: +10, -10, *1.5, /2`);
        return value;
      }
      
      const operator = match[1];
      const operand = parseFloat(match[2]);
      
      let result;
      switch (operator) {
        case '+':
          result = numericValue + operand;
          break;
        case '-':
          result = numericValue - operand;
          break;
        case '*':
          result = numericValue * operand;
          break;
        case '/':
          result = numericValue / operand;
          break;
        default:
          return value;
      }
      
      // 返回结果，保留适当的小数位数
      return Number.isInteger(result) ? result.toString() : result.toFixed(2).toString();
      
    } catch (error) {
      console.error(`换算时出错: ${error.message}`);
      return value;
    }
  }

  _evaluateWarningCondition(value, condition) {
    if (!condition) return false;
    
    const match = condition.match(/^(>=|<=|>|<|==|!=)\s*(.+)$/);
    if (!match) return false;
    
    const operator = match[1];
    let compareValue = match[2].trim();
    
    if ((compareValue.startsWith('"') && compareValue.endsWith('"')) || 
        (compareValue.startsWith("'") && compareValue.endsWith("'"))) {
      compareValue = compareValue.slice(1, -1);
    }
    
    const numericValue = parseFloat(value);
    const numericCompare = parseFloat(compareValue);
    
    if (!isNaN(numericValue) && !isNaN(numericCompare)) {
      switch (operator) {
        case '>': return numericValue > numericCompare;
        case '>=': return numericValue >= numericCompare;
        case '<': return numericValue < numericCompare;
        case '<=': return numericValue <= numericCompare;
        case '==': return numericValue === numericCompare;
        case '!=': return numericValue !== numericCompare;
      }
    }
    
    const stringValue = String(value);
    const stringCompare = compareValue;
    
    switch (operator) {
      case '==': return stringValue === stringCompare;
      case '!=': return stringValue !== stringCompare;
      case '>': return stringValue > stringCompare;
      case '>=': return stringValue >= stringCompare;
      case '<': return stringValue < stringCompare;
      case '<=': return stringValue <= stringCompare;
    }
    
    return false;
  }

  // 解析tap_action YAML配置
  _parseTapActionYaml(yamlText) {
    try {
  
      const lines = yamlText.split('\n');
      const config = {};
      const stack = [config];
      const pathStack = [];
      let multilineValue = null;
      let multilineKey = null;
      let multilineIndent = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

      
        
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        // 处理多行字符串
        if (multilineValue !== null) {
          const currentIndent = line.match(/^(\s*)/)[1].length;
          if (currentIndent > multilineIndent) {
            multilineValue.push(line);
            continue;
          } else {
            // 多行字符串结束
            const current = stack[stack.length - 1];
            current[multilineKey] = multilineValue.join('\n');
            multilineValue = null;
            multilineKey = null;
          }
        }
        
        // 检查是否是多行字符串开始
        if (trimmed === '|') {
          // 获取上一行的键
          for (let j = i - 1; j >= 0; j--) {
            const prevLine = lines[j];
            const prevTrimmed = prevLine.trim();
            if (prevTrimmed && prevTrimmed.includes(':')) {
              const colonIndex = prevTrimmed.indexOf(':');
              multilineKey = prevTrimmed.substring(0, colonIndex).trim();
              break;
            }
          }
          if (multilineKey) {
            multilineValue = [];
            multilineIndent = line.match(/^(\s*)/)[1].length;

            continue;
          }
        }
        
        // 计算缩进级别
        const indent = line.match(/^(\s*)/)[1].length;
        const level = Math.floor(indent / 2);
        
        // 调整栈到正确的层级
        while (stack.length > level + 1) {
          stack.pop();
          pathStack.pop();
        }
        
        const current = stack[stack.length - 1];
        
        if (trimmed.startsWith('- type:')) {
          // 处理数组项
          const cardType = trimmed.replace('- type:', '').trim();
          const card = { type: cardType };
          
          // 找到父对象和键名
          let parent = null;
          let parentKey = null;
          
          // 从当前栈中找到合适的父对象
          for (let j = stack.length - 1; j >= 0; j--) {
            const obj = stack[j];
            const keys = Object.keys(obj);
            for (const key of keys) {
              if (Array.isArray(obj[key])) {
                parent = obj;
                parentKey = key;
                break;
              }
            }
            if (parent) break;
          }
          
          // 如果没找到父数组，检查pathStack中的最后一个键是否对应数组
          if (!parent && pathStack.length > 0) {
            const lastKey = pathStack[pathStack.length - 1];
            const potentialParent = stack[stack.length - 2];
            if (potentialParent && potentialParent[lastKey]) {
              if (Array.isArray(potentialParent[lastKey])) {
                parent = potentialParent;
                parentKey = lastKey;
              } else if (typeof potentialParent[lastKey] === 'object' && Object.keys(potentialParent[lastKey]).length === 0) {
                // 将空对象转换为数组
                potentialParent[lastKey] = [];
                parent = potentialParent;
                parentKey = lastKey;
              }
            }
          }
          
          if (parent && parentKey) {
            // 将卡片添加到现有数组
            parent[parentKey].push(card);
            stack.push(card);
            pathStack.push('card');

          } else {
            // 创建新数组或处理特殊情况
            const current = stack[stack.length - 1];
            if (Array.isArray(current)) {
              current.push(card);
              stack.push(card);
              pathStack.push('card');

            } else {
              // 查找最近的cards键
              let foundCards = false;
              for (let j = stack.length - 1; j >= 0; j--) {
                const obj = stack[j];
                if (obj.cards !== undefined) {
                  if (!Array.isArray(obj.cards)) {
                    obj.cards = [];
                  }
                  obj.cards.push(card);
                  stack.push(card);
                  pathStack.push('card');
                  foundCards = true;

                  break;
                }
              }
              if (!foundCards) {

                config.cards = [card];
                stack.push(card);
                pathStack.push('card');
              }
            }
          }
        } else if (trimmed.startsWith('- ')) {
          // 处理数组项（非type开头的）
          const itemValue = trimmed.substring(2).trim();
          
          // 确保当前上下文是数组
          if (Array.isArray(current)) {
            current.push(itemValue);

          } else {
            // 如果当前不是数组，查找最近的数组
            for (let j = stack.length - 1; j >= 0; j--) {
              const obj = stack[j];
              for (const key in obj) {
                if (Array.isArray(obj[key])) {
                  obj[key].push(itemValue);

                  break;
                }
              }
              break;
            }
          }
        } else if (trimmed.includes(':')) {
          const colonIndex = trimmed.indexOf(':');
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim();
          
          if (value && value !== '|') {
            // 有值的键值对
            current[key] = value;

          } else if (value !== '|') {
            // 没有值的键，需要判断是创建对象还是数组
            // 检查下一行是否以"  - "开头（表示是数组项）
            const nextLineIndex = i + 1;
            const shouldCreateArray = nextLineIndex < lines.length && 
                                     lines[nextLineIndex].trim().startsWith('- ');
            
            if (shouldCreateArray) {
              current[key] = [];
  
            } else {
              current[key] = {};
  
            }
            stack.push(current[key]);
            pathStack.push(key);
          }
        }
      }
      
      // 处理最后的多行字符串
      if (multilineValue !== null && multilineKey !== null) {
        const current = stack[stack.length - 1];
        current[multilineKey] = multilineValue.join('\n');
      }
      

      return config;
    } catch (error) {
      console.error('tap_action YAML解析错误:', error);

      return null;
    }
  }


  render() {
    if (!this.hass) {
      return html`<div class="loading">等待Home Assistant连接...</div>`;
    }

    const theme = this._evaluateTheme();
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = theme === 'on' ? 'rgb(255, 255, 255)' : 'rgb(50, 50, 50)';
    
    const warningCount = this._oilPriceData.filter(consumablesData => {
      let isWarning = false;
      
      // 对于 binary_sensor 和 event，使用默认预警逻辑
      if (consumablesData.entity_id.startsWith('binary_sensor.') && !consumablesData.warning_threshold) {
        // binary_sensor: "缺少"状态时预警
        isWarning = consumablesData.value === '缺少';
      } else if (consumablesData.entity_id.startsWith('event.') && !consumablesData.warning_threshold) {
        // event: "低电量"状态时预警
        isWarning = consumablesData.value === '低电量';
      } else {
        // 使用配置的预警条件
        if (consumablesData.warning_threshold && consumablesData.warning_threshold.trim() !== '') {
          isWarning = this._evaluateWarningCondition(consumablesData.value, consumablesData.warning_threshold);
        } else {
          if (this.config.global_warning && this.config.global_warning.trim() !== '') {
            isWarning = this._evaluateWarningCondition(consumablesData.value, this.config.global_warning);
          }
        }
      }
      
      return isWarning;
    }).length;

    /*button新元素 前9行和最后1行开始*/
    const showPreview = this.config.show_preview !== false;
    
    return html`
      <div class="consumables-status" style="--fg-color: ${fgColor}; --bg-color: ${bgColor};" @click=${this._handleButtonClick}>
        <ha-icon class="status-icon" icon="mdi:battery-sync"></ha-icon>
        耗材: ${warningCount === 0 ? 0 : warningCount}
      </div>
      ${showPreview ? html`
      <div class="form-group">
        <label>👇👇👇下面是弹出卡片内容👇👇👇</label>
      </div>

      <ha-card style="--fg-color: ${fgColor}; --bg-color: ${bgColor};">
        <div class="card-header">
          <div class="card-title">
            <span class="offline-indicator" style="background: ${warningCount === 0 ? 'rgb(0,255,0)' : 'rgb(255,0,0)'}; animation: pulse 2s infinite"></span>
            ${this.config.name || '耗材信息统计'}
          </div>
          <div class="device-count ${warningCount > 0 ? 'non-zero' : 'zero'}">
            ${warningCount}
          </div>
        </div>
        
        ${this._loading ? 
          html`<div class="loading">加载中...</div>` :
          
          this._oilPriceData.length === 0 ? 
            html`<div class="no-devices">请配置耗材实体</div>` :
            this.config.columns === '1' ? html`
              <div class="devices-list single-column">
                ${this._oilPriceData.map(consumablesData => this._renderDeviceItem(consumablesData))}
              </div>
            ` : html`
              <div class="devices-grid">
                ${this._oilPriceData.map(consumablesData => this._renderDeviceItem(consumablesData))}
              </div>
            `
        }
      </ha-card>
      ` : html``}
    `;
     /*button新元素 结束*/
  }

  setConfig(config) {
    this.config = config;
    
    // 如果有tap_action配置，自动解析为内部使用的_tap_action_config
    // 不保存到配置中，只作为内部属性使用
    if (config.tap_action && config.tap_action.trim() && config.tap_action !== 'none') {
      try {
        this._tap_action_config = this._parseTapActionYaml(config.tap_action);
      } catch (error) {
        console.error('tap_action解析失败:', error);
        this._tap_action_config = null;
      }
    } else {
      this._tap_action_config = null;
    }
    
    /*button新元素 开始*/
    if (config.button_width) {
      this.style.setProperty('--button-width', config.button_width);
    } else {
      this.style.setProperty('--button-width', '16vw');
    }
    
    // 设置按钮高度（只控制 consumables-status）
    if (config.button_height) {
      this.style.setProperty('--button-height', config.button_height);
    } else {
      this.style.setProperty('--button-height', '2.8vh');
    }
    
    // 设置按钮文字大小（只控制 consumables-status）
    if (config.button_font_size) {
      this.style.setProperty('--button-font-size', config.button_font_size);
    } else {
      this.style.setProperty('--button-font-size', '14px');
    }
    
    // 设置按钮图标大小（只控制 consumables-status）
    if (config.button_icon_size) {
      this.style.setProperty('--button-icon-size', config.button_icon_size);
    } else {
      this.style.setProperty('--button-icon-size', '18px');
    }
    
    // 设置卡片宽度（控制原来的 UI）
    if (config.width) {
      this.style.setProperty('--card-width', config.width);
    } else {
      this.style.setProperty('--card-width', '100%');
    }
    /*button新元素 结束*/

    if (config.theme) {
      this.setAttribute('theme', config.theme);
    }
  }

  getCardSize() {
    const baseSize = 3;
    const entitySize = Math.max(0, Math.min(this._oilPriceData.length * 2, 10));
    return baseSize + entitySize;
  }
}
customElements.define('xiaoshi-consumables-button', XiaoshiConsumablesButton);
