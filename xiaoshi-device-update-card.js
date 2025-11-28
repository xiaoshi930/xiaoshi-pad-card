import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class XiaoshiUpdateCardEditor extends LitElement {
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
          <label>
            <input 
              type="checkbox" 
              @change=${this._entityChanged}
              .checked=${this.config.skip_updates !== false}
              name="skip_updates"
            />
            包含已跳过的更新
          </label>
          <div class="help-text">如果勾选，将包含标记为跳过的版本更新</div>
        </div>
        

      </div>

    `;
  }

  _entityChanged(e) {
    const { name, value, type, checked } = e.target;
    
    let finalValue;
    
    // 处理复选框
    if (type === 'checkbox') {
      finalValue = checked;
    } else {
      if (!value && name !== 'theme' && name !== 'width') return;
      finalValue = value;
    }
    
    // 处理不同字段的默认值
    if (name === 'width') {
      finalValue = value || '100%';
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
customElements.define('xiaoshi-update-card-editor', XiaoshiUpdateCardEditor);

export class XiaoshiUpdateCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
      _haUpdates: Array,
      _otherUpdates: Array,
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
        margin: 0 32px 4px 32px;
        padding: 4px 0 0 0;
      }

      /*设备、实体明细背景*/
      .devices-list {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        padding: 4px 0;
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
        margin: 2px 0;
      }

      .device-entity {
        font-size: 10px;
        color: var(--fg-color, #000);
        font-family: monospace;
      }

      .device-details {
        font-size: 10px;
        color: var(--fg-color, #000);
      }

      .device-last-seen { 
        font-size: 10px; 
        color: var(--fg-color, #000); 
        padding: 5px; 
        background: rgb(255, 0, 0, 0.1); 
        border: 1px solid rgb(255, 0, 0, 0.3); 
        border-radius: 4px; 
        cursor: pointer; 
        white-space: nowrap;
        transition: background-color 0.2s; 
      }

      .device-last-seen:hover {
        background: rgb(255, 0, 0, 0.2);
      }

      .no-devices {
        text-align: center;
        padding: 8px 0;
        color: var(--fg-color, #000);
      }

      .loading {
        text-align: center;
        padding: 10px 0px;
        color: var(--fg-color, #000);
      }

      /* HA版本信息样式 */
      .ha-version-info {
        padding: 4px 0 4px 16px;
        margin: 0 16px 0 30px;
        display: grid;
        grid-template-columns: auto auto auto;
        gap: 4px;
        align-items: center;
      }

      .version-label {
        font-size: 10px;
        color: var(--fg-color, #000);
        text-align: left;
      }

      .current-version {
        color: var(--fg-color, #000);
        font-size: 10px;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .current-version.outdated {
        color: rgb(255,20,0);
      }

      .latest-version {
        color: var(--fg-color, #000);
        font-size: 10px;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      

      .warning-message {
        color: #ff6b6b;
        font-size: 10px;
        font-style: italic;
      }

      /* 备份信息样式 */
      .backup-label {
        font-size: 10px;
        color: var(--fg-color, #000);
        text-align: left;
      }

      .backup-time, .backup-relative {
        color: var(--fg-color, #000);
        font-size: 10px;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .backup-separator {
        grid-column: 1 / -1;
        height: 1px;
        background: rgb(150,150,150,0.2);
        margin: 0px 0px;
      }

      /* 备份信息独立容器 */
      .backup-info {
        padding: 4px 0 4px 16px;
        margin: 0 32px 8px 32px;
        display: grid;
        grid-template-columns: auto auto auto;
        gap: 4px;
        align-items: center;
        border-bottom: 1px solid rgb(150,150,150,0.2);
      }
    `;
  }

  constructor() {
    super();
    this._haUpdates = [];
    this._otherUpdates = [];
    this._loading = false;
    this._refreshInterval = null;
    this.theme = 'on';
  }

  static getConfigElement() {
    return document.createElement("xiaoshi-update-card-editor");
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadUpdateData();
    
    // 设置主题属性
    this.setAttribute('theme', this._evaluateTheme());
    
    // 每300秒刷新一次数据，减少频繁刷新
    this._refreshInterval = setInterval(() => {
      this._loadUpdateData();
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

  _handleEntityClick(entity) {
    this._handleClick();
    // 点击实体时打开实体详情页
    if (entity.entity_id) {
      // 使用您建议的第一种方式
      const evt = new Event('hass-more-info', { composed: true });
      evt.detail = { entityId: entity.entity_id };
      this.dispatchEvent(evt);
    }
  }

  _handleClick(){
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    else if (navigator.webkitVibrate) {
        navigator.webkitVibrate(50); 
    }
    else {
    }
  }

  async _loadUpdateData() {
    if (!this.hass) return;
    
    this._loading = true;
    this.requestUpdate();

    try {
      const haUpdates = [];
      const otherUpdates = [];

      // 获取update.开头的实体更新信息
      try {
        const entities = Object.values(this.hass.states);
        const skipUpdates = this.config.skip_updates !== false; // 默认为true
        
        entities.forEach(entity => {
          // 筛选以update.开头的实体
          if (entity.entity_id.startsWith('update.') && entity.state !== 'unavailable') {
            const attributes = entity.attributes;
            
            // 检查是否有更新可用
            if (attributes.in_progress === false && 
                attributes.latest_version && 
                attributes.installed_version &&
                attributes.latest_version !== attributes.installed_version) {
              
              // 如果不跳过更新，检查skipped_version属性
              if (!skipUpdates) {
                const skippedVersion = attributes.skipped_version;
                // 如果skipped_version不为null且等于latest_version，则跳过此更新
                if (skippedVersion !== null && skippedVersion === attributes.latest_version) {
                  return; // 跳过此更新
                }
              }
              
              const updateData = {
                name: attributes.friendly_name || entity.entity_id.replace('update.', ''),
                current_version: attributes.installed_version,
                latest_version: attributes.latest_version,
                update_type: 'entity_update',
                icon: attributes.icon || 'mdi:update',
                entity_id: entity.entity_id,
                title: attributes.title || '',
                release_url: attributes.release_url || '',
                entity_picture: attributes.entity_picture || '',
                skipped_version: attributes.skipped_version || null
              };
              
              // 检查是否为home_assistant开头的实体
              if (entity.entity_id.includes('home_assistant') || 
                  entity.entity_id.includes('hacs')) {
                haUpdates.push(updateData);
              } else {
                otherUpdates.push(updateData);
              }
            }
          }
        });
      } catch (error) {
        console.warn('获取update实体更新信息失败:', error);
      }

      this._haUpdates = haUpdates;
      this._otherUpdates = otherUpdates;
    } catch (error) {
      console.error('加载更新信息失败:', error);
      this._haUpdates = [];
      this._otherUpdates = [];
    }

    this._loading = false;
  }

  _handleRefresh() {
    this._handleClick();
    this._loadUpdateData();
  }
  
  _handleUpdateClick(update) {
    this._handleClick();
    // 点击更新项时弹出实体详情
    
    // 如果有entity_id，弹出实体详情
    if (update.entity_id) {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        detail: { entityId: update.entity_id },
        bubbles: true,
        composed: true
      }));
    } else {
      // 对于没有entity_id的更新项，可以显示一个提示信息
      // 可选：显示一个简单的提示
      if (update.update_type === 'version') {
        alert(`${update.name}\n当前版本: ${update.current_version}\n最新版本: ${update.latest_version}\n\n请点击右侧的"立即更新"按钮进行更新`);
      }
    }
  }

  _handleConfirmUpdate(update, event) {
    this._handleClick();
    event.stopPropagation(); // 阻止事件冒泡
    event.preventDefault(); // 阻止默认行为
    
    // 弹出确认对话框
    const confirmed = confirm(`确认要更新 ${update.name} 吗？\n当前版本: ${update.current_version}\n最新版本: ${update.latest_version}`);
    
    if (confirmed) {
      this._executeUpdate(update);
      // 延迟3秒后刷新数据，给更新操作足够时间完成
      setTimeout(() => {
        this._loadUpdateData();
      }, 1000);
    }
  }

  _executeUpdate(update) {
    // 根据更新类型执行不同的更新逻辑
    if (update.update_type === 'version') {
      if (update.name.includes('Core')) {
        this._callUpdateService('homeassistant', 'core', 'update');
      } else if (update.name.includes('Supervisor')) {
        this._callUpdateService('hassio', 'supervisor', 'update');
      } else if (update.name.includes('OS')) {
        this._callUpdateService('hassio', 'os', 'update');
      }
    } else if (update.update_type.startsWith('hacs')) {
      // HACS更新逻辑
      // 可以通过调用HACS服务来更新
      this.hass.callService('hacs', 'download', {
        repository: update.name.replace('HACS - ', '')
      });
    } else if (update.update_type === 'integration') {
      // 集成更新逻辑
    } else if (update.update_type === 'entity_update') {
      // 实体更新逻辑
      this.hass.callService('update', 'install', {
        entity_id: update.entity_id
      });
    }
  }

  _callUpdateService(domain, service, action) {
    try {
      this.hass.callService(domain, service, {
        [action]: true
      });
    } catch (error) {
      console.error(`调用更新服务失败: ${domain}.${service}`, error);
    }
  }

  _isNewerVersion(latest, current) {
    if (!latest || !current) return false;
    
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);
    
    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const latestPart = latestParts[i] || 0;
      const currentPart = currentParts[i] || 0;
      
      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }
    
    return false;
  }

  _getHacsIcon(category) {
    const iconMap = {
      'integration': 'mdi:puzzle',
      'plugin': 'mdi:card-multiple',
      'theme': 'mdi:palette',
      'python_script': 'mdi:language-python',
      'netdaemon': 'mdi:code-braces',
      'appdaemon': 'mdi:application'
    };
    
    return iconMap[category] || 'mdi:download';
  }

  _formatDateTime(dateString) {
    if (!dateString || dateString === 'unknown' || dateString === '未知') {
      return '无';
    }
    
    try {
      // 解析ISO时间字符串，Date对象会自动处理时区转换
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '无';
      }
      
      // 使用toLocaleString直接格式化为东八区时间
      return date.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\//g, '-');
    } catch (error) {
      console.warn('时间格式化失败:', dateString, error);
      return '无';
    }
  }

  _getRelativeTime(dateString, isFuture = false) {
    if (!dateString || dateString === 'unknown' || dateString === '未知') {
      return '无';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '无';
      }
      
      const now = new Date();
      const diffMs = isFuture ? date.getTime() - now.getTime() : now.getTime() - date.getTime();
      const diffHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
      
      if (diffHours >= 24) {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}天${isFuture ? '后' : '前'}`;
      } else {
        return `${diffHours}小时${isFuture ? '后' : '前'}`;
      }
    } catch (error) {
      console.warn('相对时间计算失败:', dateString, error);
      return '无';
    }
  }

  _renderHAVersionInfo() {
    if (!this.hass) return html``;
    
    const versionElements = [];
    
    // OS版本信息 - 只有当update.home_assistant_operating_system_update存在时才显示
    const osEntity = this.hass.states['update.home_assistant_operating_system_update'];
    if (osEntity) {
      const current = osEntity.attributes.installed_version || '未知';
      const latest = osEntity.attributes.latest_version || '未知';
      const osCurrentVersionClass = (current !== '未知' && latest !== '未知' && current !== latest) ? 'outdated' : '';
      versionElements.push(html`
        <div class="version-label">OS</div>
        <div class="current-version ${osCurrentVersionClass}">当前版本：${current}</div>
        <div class="latest-version">最新版本：${latest}</div>
      `);
    }
    
    // Core版本信息
    const coreEntity = this.hass.states['update.home_assistant_core_update'];
    if (coreEntity) {
      const current = coreEntity.attributes.installed_version || '未知';
      const latest = coreEntity.attributes.latest_version || '未知';
      const coreCurrentVersionClass = (current !== '未知' && latest !== '未知' && current !== latest) ? 'outdated' : '';
      versionElements.push(html`
        <div class="version-label">Core</div>
        <div class="current-version ${coreCurrentVersionClass}">当前版本：${current}</div>
        <div class="latest-version">最新版本：${latest}</div>
      `);
    }
    
    // Supervisor版本信息
    const supervisorEntity = this.hass.states['update.home_assistant_supervisor_update'];
    if (supervisorEntity) {
      const current = supervisorEntity.attributes.installed_version || '未知';
      const latest = supervisorEntity.attributes.latest_version || '未知';
      const supervisorCurrentVersionClass = (current !== '未知' && latest !== '未知' && current !== latest) ? 'outdated' : '';
      versionElements.push(html`
        <div class="version-label">Supervisor</div>
        <div class="current-version ${supervisorCurrentVersionClass}">当前版本：${current}</div>
        <div class="latest-version">最新版本：${latest}</div>
      `);
    }
    
    return html`${versionElements}`;
  }

  _renderBackupInfo() {
    if (!this.hass) return html``;
    
    const backupElements = [];
    
    // 上次备份信息
    const lastBackupEntity = this.hass.states['sensor.backup_last_successful_automatic_backup'];
    if (lastBackupEntity) {
      const lastBackupTime = this._formatDateTime(lastBackupEntity.state);
      const lastBackupRelative = this._getRelativeTime(lastBackupEntity.state, false);
      const lastBackupCombined = lastBackupRelative !== '无' ? `${lastBackupTime}（${lastBackupRelative}）` : lastBackupTime;
      
      backupElements.push(html`
        <div class="backup-label">HA上次备份</div>
        <div class="backup-time" style="grid-column: 2 / -1;">${lastBackupCombined}</div>
      `);
    }
    
    // 下次备份信息
    const nextBackupEntity = this.hass.states['sensor.backup_next_scheduled_automatic_backup'];
    if (nextBackupEntity) {
      const nextBackupTime = this._formatDateTime(nextBackupEntity.state);
      const nextBackupRelative = this._getRelativeTime(nextBackupEntity.state, true);
      const nextBackupCombined = nextBackupRelative !== '无' ? `${nextBackupTime}（${nextBackupRelative}）` : nextBackupTime;
      
      backupElements.push(html`
        <div class="backup-label">HA下次备份</div>
        <div class="backup-time" style="grid-column: 2 / -1;">${nextBackupCombined}</div>
      `);
    }
    
    return html`${backupElements}`;
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
            <span class="offline-indicator" style="background: ${this._haUpdates.length + this._otherUpdates.length === 0 ? 'rgb(0,205,0)' : 'rgb(255,20,0)'}; animation: ${this._haUpdates.length + this._otherUpdates.length === 0 ? 'none' : 'pulse 1s infinite'}"></span>
            HA更新监控
          </div>
          <div style="display: flex; align-items: center; gap: 8px; ">
              <span class="device-count ${this._haUpdates.length + this._otherUpdates.length > 0 ? 'non-zero' : 'zero'}">
                ${this._haUpdates.length + this._otherUpdates.length}
              </span>
            <button class="refresh-btn" style="background: ${this._haUpdates.length + this._otherUpdates.length > 0 ? 'rgb(255,0,0,0.5)' : 'rgb(0,205,0)'}" @click=${this._handleRefresh}>
              刷新
            </button>
          </div>
        </div>
        
        <!-- HA版本信息 -->
        <div class="section-divider">
          <div class="section-title">
            <span> • HA版本信息</span>
          </div>
        </div>
        <div class="ha-version-info">
          ${this._renderHAVersionInfo()}
        </div>
        
        <div class="devices-list">
          ${this._loading ? 
            html`<div class="loading">HA版本信息加载中...</div>` :
            
            (this._haUpdates.length === 0 && this._otherUpdates.length === 0) ? 
              html`<div class="no-devices">✅ 所有组件都是最新版本</div>` :
              html`
                ${this._haUpdates.length > 0 ? html`
                  <div class="section-divider">
                    <div class="section-title">
                      <span> • HA版本更新</span>
                      <span class="section-count ${this._haUpdates.length > 0 ? 'non-zero' : 'zero'}">${this._haUpdates.length}</span>
                    </div>
                  </div>
                  ${this._haUpdates.map(update => html`
                    <div class="device-item" @click=${() => this._handleEntityClick(update)}>
                      <div class="device-icon">
                        <ha-icon icon="${update.icon}"></ha-icon>
                      </div>
                      <div class="device-info">
                        <div class="device-name">${update.name}</div>
                        <div class="device-details">
                          当前版本: ${update.current_version} → 最新版本: ${update.latest_version}
                          ${update.skipped_version ? html`<span style="color: #ff9800;"> 已跳过版本: ${update.skipped_version}</span>` : ''}
                        </div>
                      </div>
                      <div class="device-last-seen" @click=${(e) => this._handleConfirmUpdate(update, e)}>
                        立即更新
                      </div>
                    </div>
                  `)}\n                ` : ''}

                ${this._otherUpdates.length > 0 ? html`
                  <div class="section-divider">
                    <div class="section-title">
                      <span> • HACS更新</span>
                      <span class="section-count ${this._otherUpdates.length > 0 ? 'non-zero' : 'zero'}">${this._otherUpdates.length}</span>
                    </div>
                  </div>
                  ${this._otherUpdates.map(update => html`
                    <div class="device-item" @click=${() => this._handleEntityClick(update)}>
                      <div class="device-icon">
                        <ha-icon icon="${update.icon}"></ha-icon>
                      </div>
                      <div class="device-info">
                        <div class="device-name">${update.name}</div>
                        <div class="device-details">
                          当前版本: ${update.current_version} → 最新版本: ${update.latest_version}
                          ${update.skipped_version ? html`<span style="color: #ff9800;"> 已跳过版本: ${update.skipped_version}</span>` : ''}
                        </div>
                      </div>
                      <div class="device-last-seen" @click=${(e) => this._handleConfirmUpdate(update, e)}>
                        立即更新
                      </div>
                    </div>
                  `)}\n                ` : ''}
              `
          }

        </div>
        <!-- 备份信息 -->
        <div class="section-divider">
          <div class="section-title">
            <span> • 备份信息</span>
          </div>
        </div>
        <div class="backup-info">
          ${this._renderBackupInfo()}
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
    // 根据更新项数量动态计算卡片大小
    const baseSize = 4;
    const haSize = Math.max(0, Math.min(this._haUpdates.length, 6));
    const otherSize = Math.max(0, Math.min(this._otherUpdates.length, 8));
    return baseSize + haSize + otherSize;
  }
}
customElements.define('xiaoshi-update-card', XiaoshiUpdateCard);




