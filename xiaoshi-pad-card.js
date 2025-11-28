console.info("%c 消逝卡-平板端 \n%c      v 0.1.5 ", "color: red; font-weight: bold; background: black", "color: white; font-weight: bold; background: black");

const loadCards = async () => {
    await import('./xiaoshi-pad-grid-card.js');
    await import('./xiaoshi-device-balance-card.js');
    await import('./xiaoshi-device-todo-card.js');
    await import('./xiaoshi-device-consumables-card.js');
    await import('./xiaoshi-device-consumables-button.js');
    await import('./xiaoshi-device-ha-info-card.js'); 
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
    type: 'xiaoshi-ha-info-card',
    name: '消逝卡HA信息卡片',
    description: '消逝卡HA信息卡片',
    preview: true
  },
  {
    type: 'xiaoshi-balance-card',
    name: '消逝电话余额卡',
    description: '消逝电话余额卡',
    preview: true
  },
  {
    type: 'xiaoshi-todo-card',
    name: '消逝待办事项',
    description: '消逝待办事项',
    preview: true
  },
  {
    type: 'xiaoshi-consumables-card',
    name: '消逝耗材统计',
    description: '消逝耗材统计',
    preview: true
  }
];

loadCards();
