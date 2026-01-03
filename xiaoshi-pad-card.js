console.info("%c 消逝卡-平板端 \n%c      v 0.2.6 ", "color: red; font-weight: bold; background: black", "color: white; font-weight: bold; background: black");

const loadCards = () => {
    import('./xiaoshi-device-balance-button.js');
    import('./xiaoshi-device-ha-info-button.js'); 
    import('./xiaoshi-device-todo-button.js');
    import('./xiaoshi-device-consumables-button.js');
    import('./xiaoshi-device-balance-card.js');
    import('./xiaoshi-device-ha-info-card.js'); 
    import('./xiaoshi-device-todo-card.js');
    import('./xiaoshi-device-consumables-card.js');
    import('./xiaoshi-pad-grid-card.js');
    
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
    name: '消逝HA信息卡片',
    description: '消逝HA信息卡片',
    preview: true
  },
  {
    type: 'xiaoshi-ha-info-button',
    name: '消逝HA信息按钮',
    description: '消逝HA信息按钮',
    preview: true
  },
  {
    type: 'xiaoshi-balance-card',
    name: '消逝余额信息卡片',
    description: '消逝余额信息卡片',
    preview: true
  },
  {
    type: 'xiaoshi-balance-button',
    name: '消逝余额信息按钮',
    description: '消逝余额信息按钮',
    preview: true
  },
  {
    type: 'xiaoshi-todo-card',
    name: '消逝待办信息卡片',
    description: '消逝待办信息卡片',
    preview: true
  },
  {
    type: 'xiaoshi-todo-button',
    name: '消逝待办信息按钮',
    description: '消逝待办信息按钮',
    preview: true
  },
  {
    type: 'xiaoshi-consumables-card',
    name: '消逝耗材信息卡片',
    description: '消逝耗材信息卡片',
    preview: true
  },
  {
    type: 'xiaoshi-consumables-button',
    name: '消逝耗材信息按钮',
    description: '消逝耗材信息按钮',
    preview: true
  }
];

loadCards();
