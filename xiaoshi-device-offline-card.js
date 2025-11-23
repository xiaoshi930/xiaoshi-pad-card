import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class XiaoshiOfflineCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

  static get styles() {
    return css`
      .form {
        display: flex;
        flex-direction: column;
        gap: 10px;
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
    `;
  }

  render() {
    if (!this.hass) return html``;

    return html`
      <div class="form">
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
          <label>排除设备：每行一个设备名称，支持通配符(*)</label>
          <textarea 
            @change=${this._entityChanged}
            .value=${this.config.exclude_devices ? this.config.exclude_devices.join('\n') : ''}
            name="exclude_devices"
            placeholder="例如：&#10;*温度传感器*&#10;客厅*&#10;*测试设备"
          ></textarea>
          <div class="help-text">
            支持通配符匹配，例如 *客厅* 会匹配所有包含"客厅"的设备
          </div>
        </div>

        <div class="form-group">
          <label>过滤实体：每行一个实体ID，支持通配符(*)</label>
          <textarea 
            @change=${this._entityChanged}
            .value=${this.config.exclude_entities ? this.config.exclude_entities.join('\n') : ''}
            name="exclude_entities"
            placeholder="例如：&#10;sensor.*_temperature&#10;switch.guest_*&#10;binary_sensor.*_motion"
          ></textarea>
          <div class="help-text">
            支持通配符匹配，例如 sensor.* 会匹配所有以 sensor. 开头的实体
          </div>
        </div>
      </div>

    `;
  }

  _entityChanged(e) {
    const { name, value } = e.target;
    if (!value && name !== 'theme' && name !== 'width' && name !== 'exclude_entities' && name !== 'exclude_devices' ) return;
    
    let finalValue = value;
    
    // 处理不同字段的默认值
    if (name === 'width') {
      finalValue = value || '100%';
    } else if (name === 'exclude_entities') {
      // 将文本行转换为数组
      finalValue = value ? value.split('\n').filter(line => line.trim()).map(line => line.trim()) : [];
    } else if (name === 'exclude_devices') {
      // 将文本行转换为数组
      finalValue = value ? value.split('\n').filter(line => line.trim()).map(line => line.trim()) : [];
    } 
    
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

  setConfig(config) {
    this.config = config;
  }
} 
customElements.define('xiaoshi-offline-card-editor', XiaoshiOfflineCardEditor);

export class XiaoshiOfflineCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
      _offlineDevices: Array,
      _offlineEntities: Array,
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
        background: rgb(255, 0, 0, 0.5);
      }
      
      .device-count.zero {
        background: rgb(0, 205, 0);
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
        padding: 0px;
        border-bottom: 1px solid rgb(150,150,150,0.2);
        margin: 0 32px 8px 32px;
      }

      /*设备、实体明细背景*/
      .devices-list {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        padding: 0 0 8px  0;
      }

      .device-icon {
        margin-right: 12px;
        color: var(--error-color);
      }

      .device-info {
        flex-grow: 1;
      }

      .device-name {
        font-weight: 500;
        color: var(--fg-color, #000);
        margin-bottom: 4px;
      }

      .device-entity {
        font-size: 10px;
        color: var(--fg-color, #000);
        font-family: monospace;
      }

      .device-details {
        font-size: 10px;
        color: var(--fg-color, #000);
        margin-top: 4px;
      }

      .device-last-seen {
        font-size: 10px;
        color: var(--fg-color, #000);
        margin-left: auto;
      }

      .no-devices {
        text-align: center;
        padding: 0px;
        color: var(--fg-color, #000);
      }

      .loading {
        text-align: center;
        padding: 0px;
        color: var(--fg-color, #000);
      }
    `;
  }

  constructor() {
    super();
    this._offlineDevices = [];
    this._offlineEntities = [];
    this._loading = false;
    this._refreshInterval = null;
    this.theme = 'on';
  }

  static getConfigElement() {
    return document.createElement("xiaoshi-offline-card-editor");
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadOfflineDevices();
    
    // 设置主题属性
    this.setAttribute('theme', this._evaluateTheme());
    
    // 每300秒刷新一次数据，减少频繁刷新
    this._refreshInterval = setInterval(() => {
      this._loadOfflineDevices();
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

  async _loadOfflineDevices() {
    if (!this.hass) return;
    
    this._loading = true;
    this.requestUpdate();

    try {
      // 并行获取所有需要的数据
      const [devices, allEntityRegs] = await Promise.all([
        this.hass.callWS({
          type: 'config/device_registry/list'
        }),
        this.hass.callWS({
          type: 'config/entity_registry/list'
        })
      ]);

      // 获取当前实体状态
      const entities = Object.values(this.hass.states);
      const entityMap = {};
      entities.forEach(entity => {
        entityMap[entity.entity_id] = entity;
      });

      // 按设备ID分组实体
      const entitiesByDevice = {};
      allEntityRegs.forEach(entity => {
        if (entity.device_id) {
          if (!entitiesByDevice[entity.device_id]) {
            entitiesByDevice[entity.device_id] = [];
          }
          entitiesByDevice[entity.device_id].push(entity);
        }
      });

      const offlineDevices = [];

      // 并行检查所有设备
      const deviceChecks = devices.map(device => {
        const deviceEntities = entitiesByDevice[device.id] || [];
        return {
          device,
          deviceEntities,
          isOffline: this._checkDeviceAvailabilitySync(device, deviceEntities, entityMap)
        };
      });

      // 获取设备排除模式
      const excludeDevicePatterns = this.config.exclude_devices || [];
      
      // 记录被排除的设备ID集合
      const excludedDeviceIds = new Set();
      
      // 过滤离线设备并构建数据
      deviceChecks.forEach(({ device, deviceEntities, isOffline }) => {
        if (isOffline) {
          const deviceName = device.name_by_user || device.name || `设备 ${device.id.slice(0, 8)}`;
          
          // 检查设备名称是否匹配排除模式
          if (this._matchesExcludePattern(deviceName, excludeDevicePatterns)) {
            // 记录被排除的设备ID，以便后续排除其下属实体
            excludedDeviceIds.add(device.id);
            return; // 跳过匹配排除模式的设备
          }
          
          offlineDevices.push({
            device_id: device.id,
            name: deviceName,
            model: device.model,
            manufacturer: device.manufacturer,
            area_id: device.area_id,
            entities: deviceEntities,
            last_seen: this._getDeviceLastSeen(deviceEntities, entityMap),
            icon: this._getDeviceIcon(device, deviceEntities)
          });
        }
      });

      // 按最后看到时间排序
      offlineDevices.sort((a, b) => 
        new Date(b.last_seen || 0) - new Date(a.last_seen || 0)
      );

      // 获取离线设备的所有实体ID
      const offlineDeviceEntityIds = new Set();
      offlineDevices.forEach(device => {
        device.entities.forEach(entity => {
          offlineDeviceEntityIds.add(entity.entity_id);
        });
      });

      // 获取排除模式
      const excludePatterns = this.config.exclude_entities || [];
      
      // 获取独立的离线实体（不属于离线设备的实体）
      const offlineEntities = [];
      allEntityRegs.forEach(entityReg => {
        if (entityReg.disabled_by) return; // 跳过被禁用的实体
        
        const entity = entityMap[entityReg.entity_id];
        if (!entity) return;

        // 检查是否匹配排除模式
        if (this._matchesExcludePattern(entityReg.entity_id, excludePatterns)) {
          return; // 跳过匹配排除模式的实体
        }

        // 检查实体是否属于被排除的设备
        if (entityReg.device_id && excludedDeviceIds.has(entityReg.device_id)) {
          return; // 跳过属于被排除设备的实体
        }

        // 检查实体是否离线
        const isEntityOffline = entity.state === 'unavailable' ;
        
        // 只处理离线且不属于离线设备的实体
        if (isEntityOffline && !offlineDeviceEntityIds.has(entityReg.entity_id)) {
          offlineEntities.push({
            entity_id: entityReg.entity_id,
            friendly_name: entity.attributes.friendly_name || entityReg.entity_id,
            state: entity.state,
            last_changed: entity.last_changed,
            last_updated: entity.last_updated,
            icon: entity.attributes.icon || this._getDefaultIcon(entityReg.entity_id),
            device_class: entity.attributes.device_class,
            unit_of_measurement: entity.attributes.unit_of_measurement,
            device_id: entityReg.device_id,
            platform: entityReg.platform
          });
        }
      });

      // 按最后更新时间排序
      offlineEntities.sort((a, b) => 
        new Date(b.last_updated) - new Date(a.last_updated)
      );

      this._offlineDevices = offlineDevices;
      this._offlineEntities = offlineEntities;
    } catch (error) {
      console.error('加载离线设备失败:', error);
      this._offlineDevices = [];
    }

    this._loading = false;
  }

  _checkDeviceAvailabilitySync(device, deviceEntities, entityMap) {
    if (!deviceEntities || deviceEntities.length === 0) {
      return true; // 没有实体的设备视为离线
    }

    // 检查设备的可用性状态
    if (device.disabled_by) {
      return false; // 被禁用的设备不算离线
    }

    let hasAvailableEntity = false;
    let hasUnavailableEntity = false;

    for (const entityReg of deviceEntities) {
      const entity = entityMap[entityReg.entity_id];
      if (!entity) continue;

      // 跳过被禁用的实体
      if (entityReg.disabled_by) continue;

      if (entity.state !== 'unavailable' ) {
        hasAvailableEntity = true;
        break; // 找到一个可用实体就可以停止检查
      } else {
        hasUnavailableEntity = true;
      }
    }

    // 如果设备有实体但所有实体都不可用，则设备离线
    return hasUnavailableEntity && !hasAvailableEntity;
  }

  _getDeviceLastSeen(deviceEntities, entityMap) {
    let lastSeen = null;

    for (const entityReg of deviceEntities) {
      const entity = entityMap[entityReg.entity_id];
      if (!entity) continue;

      const entityTime = new Date(entity.last_updated);
      if (!lastSeen || entityTime > lastSeen) {
        lastSeen = entityTime;
      }
    }

    return lastSeen;
  }

  _getDeviceIcon(device, deviceEntities) {
    // 优先使用设备图标
    if (device.icon) {
      return device.icon;
    }

    // 根据设备类型推断图标
    if (device.model) {
      const model = device.model.toLowerCase();
      if (model.includes('light') || model.includes('bulb')) return 'mdi:lightbulb';
      if (model.includes('switch') || model.includes('plug')) return 'mdi:power';
      if (model.includes('sensor')) return 'mdi:eye';
      if (model.includes('camera')) return 'mdi:camera';
      if (model.includes('fan')) return 'mdi:fan';
      if (model.includes('tv')) return 'mdi:multimedia'; 
      if (model.includes('button')) return 'mdi:button-pointer'; 
      if (model.includes('thermostat') || model.includes('climate')) return 'mdi:thermostat';
    }

    // 根据制造商推断图标
    if (device.manufacturer) {
      const manufacturer = device.manufacturer.toLowerCase();
      if (manufacturer.includes('xiaomi') || manufacturer.includes('aqara')) return 'mdi:home-automation';
      if (manufacturer.includes('philips')) return 'mdi:lightbulb';
      if (manufacturer.includes('tp-link')) return 'mdi:network';
    }

    // 根据第一个实体的类型推断图标
    if (deviceEntities && deviceEntities.length > 0) {
      const firstEntityId = deviceEntities[0].entity_id;
      return this._getDefaultIcon(firstEntityId);
    }

    return 'mdi:device-hub';
  }

  _getDefaultIcon(entityId) {
    if (entityId.startsWith('light.')) return 'mdi:lightbulb';
    if (entityId.startsWith('switch.')) return 'mdi:power';
    if (entityId.startsWith('sensor.')) return 'mdi:eye';
    if (entityId.startsWith('binary_sensor.')) return 'mdi:eye';
    if (entityId.startsWith('device_tracker.')) return 'mdi:cellphone';
    if (entityId.startsWith('media_player.')) return 'mdi:speaker';
    if (entityId.startsWith('climate.')) return 'mdi:thermostat';
    if (entityId.startsWith('cover.')) return 'mdi:window-shutter';
    if (entityId.startsWith('weather.')) return 'mdi:weather-cloudy';
    return 'mdi:help-circle';
  }

  _formatLastSeen(timestamp) {
    if (!timestamp) return '未知';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN');
  }

  _handleRefresh() {
    this._loadOfflineDevices();
    navigator.vibrate(50);
  }

  _handleDeviceClick(device) {
    navigator.vibrate(50);
    // 点击设备时跳转到设备详情页
    if (device.device_id) {
      // 先关闭当前弹窗/界面
      this._closeCurrentDialog();
      
      // 延迟执行导航，确保当前界面已关闭
      setTimeout(() => {
        const deviceUrl = `/config/devices/device/${device.device_id}`;
        
        // 尝试在Home Assistant环境中导航
        try {
          // 在Home Assistant环境中导航
          window.history.pushState(null, '', deviceUrl);
          window.dispatchEvent(new CustomEvent('location-changed'));
        } catch (e) {
          // 如果导航失败，在新标签页中打开，确保在最上层
          window.open(deviceUrl, '_blank', 'noopener,noreferrer');
        }
      }, 300); // 短暂延迟确保当前界面已关闭
    }
  }
  
  _handleEntityClick(entity) {
    navigator.vibrate(50);
    // 点击实体时打开实体详情页
    if (entity.entity_id) {
      // 使用您建议的第一种方式
      const evt = new Event('hass-more-info', { composed: true });
      evt.detail = { entityId: entity.entity_id };
      this.dispatchEvent(evt);
    }
  }
  
  _closeCurrentDialog() {
    // 查找并关闭当前可能的弹窗或对话框
    const dialogs = document.querySelectorAll('ha-dialog, .mdc-dialog, paper-dialog, vaadin-dialog');
    dialogs.forEach(dialog => {
      if (dialog && dialog.open) {
        dialog.close();
      }
    });
    
    // 尝试关闭更多UI的弹窗
    const moreUIs = document.querySelectorAll('ha-more-info-dialog, .ha-more-info-dialog');
    moreUIs.forEach(ui => {
      if (ui && ui.close) {
        ui.close();
      }
    });
    
    // 如果是在卡片详情页面，尝试返回上一页
    if (window.history.length > 1) {
      window.history.back();
    }
  }
  
  _matchesExcludePattern(entityId, patterns) {
    if (!patterns || patterns.length === 0) {
      return false;
    }

    for (const pattern of patterns) {
      if (this._matchPattern(entityId, pattern)) {
        return true;
      }
    }
    return false;
  }

  _matchPattern(str, pattern) {
    // 将通配符模式转换为正则表达式
    const regexPattern = pattern
      .replace(/\./g, '\\.')  // 转义点号
      .replace(/\*/g, '.*');   // 将 * 转换为 .*
    
    const regex = new RegExp(`^${regexPattern}$`, 'i'); // 不区分大小写
    return regex.test(str);
  }

  render() {
    if (!this.hass) {
      return html`<div class="loading">等待Home Assistant连接...</div>`;
    }
    // 获取主题和颜色
    const theme = this._evaluateTheme();
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = theme === 'on' ? 'rgb(255, 255, 255)' : 'rgb(50, 50, 50)';
    
    return html`
      <ha-card style="--fg-color: ${fgColor}; --bg-color: ${bgColor};">
        <div class="card-header">
          <div class="card-title">
            <span class="offline-indicator" style="background: ${this._offlineDevices.length + this._offlineEntities.length === 0 ? 'rgb(0,205,0)' : 'rgb(255,20,0)'}; animation: ${this._offlineDevices.length + this._offlineEntities.length === 0 ? 'none' : 'pulse 1s infinite'}"></span>
            HA离线设备监控
          </div>
          <div style="display: flex; align-items: center; gap: 8px; ">
              <span class="device-count ${this._offlineDevices.length + this._offlineEntities.length > 0 ? 'non-zero' : 'zero'}">
                ${this._offlineDevices.length + this._offlineEntities.length}
              </span>
            <button class="refresh-btn" style="background: ${this._offlineDevices.length + this._offlineEntities.length > 0 ? 'rgb(255,0,0,0.5)' : 'rgb(0,205,0)'}" @click=${this._handleRefresh}>
              刷新
            </button>
          </div>
        </div>
        
        <div class="devices-list">
          ${this._loading ? 
            html`<div class="loading">加载中...</div>` :
            
            (this._offlineDevices.length === 0 && this._offlineEntities.length === 0) ? 
              html`<div class="no-devices">✅ 所有设备和实体都在线</div>` :
              html`
                ${this._offlineDevices.length > 0 ? html`
                  <div class="section-divider">
                    <div class="section-title">
                      <span> • 离线设备</span>
                      <span class="section-count">${this._offlineDevices.length}</span>
                    </div>
                  </div>
                  ${this._offlineDevices.map(device => html`
                    <div class="device-item" @click=${() => this._handleDeviceClick(device)}>
                      <div class="device-icon">
                        <ha-icon icon="${device.icon}"></ha-icon>
                      </div>
                      <div class="device-info">
                        <div class="device-name">${device.name}</div>
                        <div class="device-details">
                          ${device.manufacturer && device.model ? 
                            `${device.manufacturer} ${device.model}` : 
                            device.manufacturer || device.model || '未知设备'}
                          ${device.entities ? `• ${device.entities.length} 个实体` : ''}
                        </div>
                      </div>
                      <div class="device-last-seen">
                        ${this._formatLastSeen(device.last_seen)}
                      </div>
                    </div>
                  `)}\n                ` : ''}

                ${this._offlineEntities.length > 0 ? html`
                  <div class="section-divider">
                    <div class="section-title">
                      <span> • 离线实体</span>
                      <span class="section-count">${this._offlineEntities.length}</span>
                    </div>
                  </div>
                  ${this._offlineEntities.map(entity => html`
                    <div class="device-item" @click=${() => this._handleEntityClick(entity)}>
                      <div class="device-icon">
                        <ha-icon icon="${entity.icon}"></ha-icon>
                      </div>
                      <div class="device-info">
                        <div class="device-name">${entity.friendly_name}</div>
                        <div class="device-details">
                          ${entity.entity_id}
                          ${entity.platform ? `• ${entity.platform}` : ''}
                          ${entity.unit_of_measurement ? `• ${entity.unit_of_measurement}` : ''}
                        </div>
                      </div>
                      <div class="device-last-seen">
                        ${this._formatLastSeen(entity.last_updated)}
                      </div>
                    </div>
                  `)}\n                ` : ''}
              `
          }
        </div>
      </ha-card>
    `;
  }

  setConfig(config) {
    this.config = config;
    
    // 设置CSS变量来控制卡片的宽度和高度
    if (config.width) {
      this.style.setProperty('--card-width', config.width);
    }
    
    // 设置主题
    if (config.theme) {
      this.setAttribute('theme', config.theme);
    }
  }

  getCardSize() {
    // 根据离线设备和实体数量动态计算卡片大小
    const baseSize = 4;
    const deviceSize = Math.max(0, Math.min(this._offlineDevices.length, 6));
    const entitySize = Math.max(0, Math.min(this._offlineEntities.length, 8));
    return baseSize + deviceSize + entitySize;
  }
}
customElements.define('xiaoshi-offline-card', XiaoshiOfflineCard);




