console.info("%c 消逝卡-平板端 \n%c      v 1.0.0 ", "color: red; font-weight: bold; background: black", "color: white; font-weight: bold; background: black");

const loadCards = () => {
    import('./xiaoshi-pad-grid-card.js');
    
    window.customCards = window.customCards || [];
    window.customCards.push(...cardConfigs);
};

const cardConfigs = [
  {
    type: 'xiaoshi-pad-grid-card',
    name: '消逝卡(平板端)-分布卡',
    description: '温度分布、湿度分布'
  }
];

loadCards();
