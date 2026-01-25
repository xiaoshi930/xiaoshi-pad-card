console.info("%c 消逝卡-平板端 \n%c      v 1.0.4 ", "color: red; font-weight: bold; background: black", "color: white; font-weight: bold; background: black");

const loadCards = () => {
    import('./xiaoshi-pad-climate-card.js');
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
    type: 'xiaoshi-pad-climate-card',
    name: '消逝卡(平板端)-空调/水暖毯/热水器卡',
    description: '平板端空调/水暖毯/热水器卡',
    preview: true
  }
];

loadCards();
