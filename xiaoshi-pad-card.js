console.info("%c 消逝卡-平板端 \n%c      v 0.0.1 ", "color: red; font-weight: bold; background: black", "color: white; font-weight: bold; background: black");

const loadCards = async () => {
    await import('./xiaoshi-pad-grid-card.js');
    await import('./xiaoshi-device-update-card.js');
    await import('./xiaoshi-device-offline-card.js');
    
    window.customCards = window.customCards || [];
    window.customCards.push(...cardConfigs);
};

const cardConfigs = [
  {
    type: 'xiaoshi-pad-grid-card',
    name: '消逝卡(平板端)-分布卡',
    description: '温度分布、湿度分布'
  },
  {
    type: 'xiaoshi-update-card',
    name: '消逝卡HA更新监控卡片',
    description: '显示需要更新的组件和版本',
    preview: true
  },
  {
    type: 'xiaoshi-offline-card',
    name: '消逝卡HA离线设备卡片',
    description: '显示所有离线的设备和实体',
    preview: true
  }
];

loadCards();
