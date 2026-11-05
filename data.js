// 기체 카드 내용과 상황표. 카드 글은 원장님이 주신 원고 그대로(띄어쓰기만 교과서 표기 '이산화 탄소').
// grade : ok 정답 · near 아쉬움(틀림은 아니지만 정답 아님) · bad 실패
// fx : 그 상황 장면에서 벌어지는 일 (index.html의 scene 함수가 처리)
const CARDS = {
  n2:  {no:'01', name:'질소', nick:'공기의 지배자', air:'공기 중 약 78%', trait:'다른 물질과 쉽게 반응하지 않는 안정적인 기체', use:'과자 포장, 식품 보관, 액체질소 냉각', power:'산화 방어막', powerText:'식품이 산소와 반응하는 것을 줄인다.', sym:'N₂', art:'cards/01.webp', color:'#2f6fb0'},
  o2:  {no:'02', name:'산소', nick:'생명의 수호자', air:'공기 중 약 21%', trait:'사람의 호흡에 필요하고 물질이 타는 것을 돕는 기체', use:'병원 산소 공급, 용접, 제철', power:'연소 부스터', powerText:'불이 더 잘 타도록 돕는다.', sym:'O₂', art:'cards/02.webp', color:'#d9482b'},
  h2:  {no:'03', name:'수소', nick:'초경량 에너지 전사', air:'공기 중 약 0.000055%', trait:'가장 가벼운 기체이며 불이 잘 붙는다.', use:'수소 연료전지, 로켓 연료', power:'에너지 변환', powerText:'연료전지에서 산소와 반응해 전기를 만든다.', sym:'H₂', art:'cards/03.webp', color:'#0e9f8e'},
  he:  {no:'04', name:'헬륨', nick:'하늘을 나는 마법사', air:'공기 중 약 0.00052%', trait:'공기보다 가볍고 불에 타지 않는다.', use:'풍선, 비행선, MRI 장비 냉각', power:'공중 부양', powerText:'풍선이 하늘로 떠오르게 한다.', sym:'He', art:'cards/04.webp', color:'#e0a100'},
  ne:  {no:'05', name:'네온', nick:'빛의 마법사', air:'공기 중 약 0.0018%', trait:'전기가 흐르는 방전관에서 붉은 주황빛을 낸다.', use:'네온사인, 표시등, 레이저', power:'네온 플래시', powerText:'방전관 안에서 빛을 낸다.', sym:'Ne', art:'cards/05.webp', color:'#ef5a24'},
  co2: {no:'06', name:'이산화 탄소', nick:'식물의 조력자', air:'공기 중 약 0.04%', trait:'광합성에 사용되며 열을 흡수하는 온실기체', use:'탄산음료, 소화기, 드라이아이스', power:'광합성 지원', powerText:'식물이 양분을 만드는 데 필요한 재료를 제공한다.', sym:'CO₂', art:'cards/06.webp', color:'#3d8b37'},
  ar:  {no:'07', name:'아르곤', nick:'철벽 방어 기사', air:'공기 중 약 0.93%', trait:'다른 물질과 거의 반응하지 않는 기체', use:'용접 보호가스, 전구, 복층유리', power:'금속 보호막', powerText:'뜨거운 금속이 공기와 반응하는 것을 막는다.', sym:'Ar', art:'cards/07.webp', color:'#6b4fb3'},
  h2o: {no:'08', name:'수증기', nick:'날씨의 마법사', air:'공기 중 약 0~4% (변동)', trait:'눈에 보이지 않는 기체 상태의 물', use:'증기터빈, 가습, 조리', power:'구름 생성', powerText:'냉각되어 응결하면 작은 물방울을 만든다.', sym:'H₂O', art:'cards/08.webp', color:'#3aa0d8'},
  ch4: {no:'09', name:'메테인(메탄)', nick:'불꽃의 드래곤', air:'약 0.0002%', trait:'도시가스의 주성분, 연료로 사용', use:'', power:'블루 파이어', powerText:'', sym:'CH₄', art:'cards/09.webp', color:'#2456c4', ext:true},
  o3:  {no:'10', name:'오존', nick:'자외선 방패', air:'위치에 따라 변동', trait:'성층권에서는 자외선 흡수, 지표면에서는 유해할 수 있음', use:'', power:'UV 실드', powerText:'', sym:'O₃', art:'cards/10.webp', color:'#7a3fa0', ext:true},
  xe:  {no:'11', name:'제논(크세논)', nick:'희귀한 빛의 전사', air:'약 0.000009%', trait:'특수 조명, 일부 의료 분야에 사용', use:'', power:'제논 빔', powerText:'', sym:'Xe', art:'cards/11.webp', color:'#1f8fa3', ext:true},
  kr:  {no:'12', name:'크립톤', nick:'희귀 보호자', air:'약 0.00011%', trait:'특수 조명과 단열유리 등에 사용', use:'', power:'단열 배리어', powerText:'', sym:'Kr', color:'#5a6b7b', ext:true},
};

const BASE = ['n2','o2','h2','he','ne','co2','ar','h2o'];
const EXT = ['ch4','o3','xe','kr'];

const SITUATIONS = [
  {id:'fire', answer:'co2', title:'실험실에 큰불이 났다!', ask:'불을 끄려면 어떤 기체를 넣어야 할까요?', res:{
    co2:{grade:'ok',fx:'out',msg:'불이 꺼졌어요! 이산화 탄소는 타지 않고 공기보다 무거워 불을 덮어요. 산소가 막히니 불이 꺼져요. 그래서 소화기에 넣어요.'},
    o2:{grade:'bad',fx:'bigger',msg:'불이 더 커졌어요! 산소는 물질이 타는 것을 도와요.'},
    h2:{grade:'bad',fx:'boom',msg:'펑! 수소는 불이 아주 잘 붙어요. 불에 넣으면 터져요.'},
    n2:{grade:'near',fx:'weak',msg:'불이 조금 약해졌어요. 질소는 타지 않고 산소를 밀어내요. 하지만 아직 불이 남았어요. 소화기에 넣는 기체를 찾아봐요.'},
    ar:{grade:'near',fx:'weak',msg:'불이 조금 약해졌어요. 아르곤은 타지 않아요. 하지만 손에 드는 소화기에 넣는 기체는 따로 있어요.'},
    h2o:{grade:'near',fx:'weak',msg:'불이 조금 약해졌어요. 수증기가 공기를 밀어내거든요. 하지만 이 큰불을 끄기엔 모자라요.'},
    he:{grade:'bad',fx:'none',msg:'불은 그대로예요. 헬륨은 타지 않지만 공기보다 가벼워 위로 날아가요. 불을 덮지 못해요.'},
    ne:{grade:'bad',fx:'none',msg:'불은 그대로예요. 네온도 타지 않지만 공기보다 가벼워 위로 올라가요. 불을 덮지 못해요.'},
  }},
  {id:'balloon', answer:'he', title:'풍선을 하늘로 띄워라!', ask:'풍선 속에 어떤 기체를 넣어야 안전하게 뜰까요?', res:{
    he:{grade:'ok',fx:'up',msg:'풍선이 떠올랐어요! 헬륨은 공기보다 가볍고 불에 타지 않아 안전해요.'},
    h2:{grade:'bad',fx:'upboom',msg:'떠올랐지만 불씨에 펑! 수소는 가장 가볍지만 불이 잘 붙어요. 놀이용 풍선엔 쓰지 않아요.'},
    ne:{grade:'near',fx:'hover',msg:'뜰 듯 말 듯해요. 네온도 공기보다 가볍지만 헬륨만큼 가볍지 않아요.'},
    n2:{grade:'bad',fx:'slowfall',msg:'천천히 내려왔어요. 질소의 무게는 같은 크기의 공기와 거의 같아서 떠오르지 못해요.'},
    o2:{grade:'bad',fx:'fall',msg:'바닥으로 떨어졌어요. 산소는 같은 크기의 공기보다 조금 무거워요.'},
    co2:{grade:'bad',fx:'fastfall',msg:'툭 떨어졌어요! 이산화 탄소 1L는 약 1.8g으로, 같은 크기의 공기보다 무거워요.'},
    ar:{grade:'bad',fx:'fastfall',msg:'툭 떨어졌어요! 아르곤은 같은 크기의 공기보다 무거워요.'},
    h2o:{grade:'bad',fx:'shrink',msg:'쭈글쭈글 내려왔어요. 수증기는 식으면 작은 물방울로 바뀌어 풍선이 쪼그라들어요.'},
  }},
  {id:'snack', answer:'n2', title:'과자를 바삭하게 지켜라!', ask:'과자 봉지 속을 어떤 기체로 채울까요?', res:{
    n2:{grade:'ok',fx:'crisp',msg:'봉지가 빵빵하고 과자는 바삭해요! 질소는 다른 물질과 쉽게 반응하지 않아요. 산소 대신 채우면 과자 맛이 덜 변하고, 쿠션처럼 과자가 부서지는 것도 막아요.'},
    o2:{grade:'bad',fx:'stink',msg:'과자에서 이상한 냄새가 나요! 산소가 과자의 기름과 반응해 맛이 변해요.'},
    h2o:{grade:'bad',fx:'soggy',msg:'과자가 눅눅해졌어요! 과자가 수증기를 빨아들였어요.'},
    h2:{grade:'bad',fx:'danger',msg:'위험해요! 수소는 불이 잘 붙어서 음식 포장에 쓰지 않아요.'},
    he:{grade:'near',fx:'leak',msg:'봉지가 점점 쭈그러들어요. 헬륨은 과자와 반응하지 않지만, 봉지를 잘 빠져나가요.'},
    ne:{grade:'near',fx:'money',msg:'과자는 지켜지지만 너무 비싸요! 네온은 공기 중에 아주 적어요.'},
    ar:{grade:'near',fx:'money',msg:'과자는 지켜져요. 아르곤도 거의 반응하지 않거든요. 하지만 공기 중에 약 78%나 있는 질소보다 비싸요.'},
    co2:{grade:'near',fx:'none',msg:'아까워요! 이산화 탄소도 과자를 지킬 수 있어요. 하지만 과자 봉지는 공기에 가장 많고 값이 싼 기체로 채워요.'},
  }},
  {id:'breath', answer:'o2', title:'숨쉬기 힘든 환자에게 줄 기체는?', ask:'병원에서 환자에게 통에 담아 주는 이 기체를 찾아요.', res:{
    o2:{grade:'ok',fx:'gaugeup',msg:'숨쉬기가 편해졌어요! 우리 몸은 숨으로 들이마신 산소가 있어야 살 수 있어요.'},
    co2:{grade:'bad',fx:'gaugedown',msg:'더 답답해져요! 이산화 탄소는 몸이 내보내는 기체예요. 산소를 대신하지 못해요.'},
    n2:{grade:'bad',fx:'gaugedown',msg:'나아지지 않아요. 공기의 약 78%가 질소지만, 우리 몸은 질소로 숨 쉬지 못해요. 질소만 마시면 위험해요.'},
    he:{grade:'bad',fx:'gaugedown',msg:'목소리만 변해요! 헬륨에는 산소가 없어 마시면 위험해요. 절대 따라 하지 마세요.'},
    h2:{grade:'bad',fx:'gaugedown',msg:'위험해요! 수소는 숨 쉬는 데 쓰지 못하고 불도 잘 붙어요.'},
    ne:{grade:'bad',fx:'gaugedown',msg:'나아지지 않아요. 네온만 마시면 산소가 모자라 위험해요.'},
    ar:{grade:'bad',fx:'gaugedown',msg:'나아지지 않아요. 아르곤만 마시면 산소가 모자라 위험해요.'},
    h2o:{grade:'bad',fx:'none',msg:'촉촉해지긴 해요. 수증기는 코와 목을 덜 마르게 하지만, 산소를 대신하지 못해요.'},
  }},
  {id:'car', answer:'h2', title:'이산화 탄소를 내보내지 않고 달려라!', ask:'자동차 연료로 어떤 기체를 넣을까요?', res:{
    h2:{grade:'ok',fx:'drive',msg:'부릉, 달려요! 수소가 연료전지라는 장치에서 산소와 만나 전기를 만들어요. 그 전기로 달리고, 물이 나와요.'},
    o2:{grade:'near',fx:'stall',msg:'시동이 안 걸려요. 산소는 타는 것을 돕지만 스스로 타지 않아요. 연료가 따로 있어야 해요.'},
    co2:{grade:'bad',fx:'stall',msg:'시동이 안 걸려요. 이산화 탄소는 불이 붙지 않아 연료가 될 수 없어요.'},
    n2:{grade:'bad',fx:'stall',msg:'시동이 안 걸려요. 질소는 쉽게 반응하지 않아 연료가 될 수 없어요.'},
    he:{grade:'bad',fx:'stall',msg:'시동이 안 걸려요. 헬륨은 불에 타지 않아 연료가 될 수 없어요.'},
    ne:{grade:'bad',fx:'stall',msg:'시동이 안 걸려요. 네온은 불이 붙지 않아 연료가 될 수 없어요.'},
    ar:{grade:'bad',fx:'stall',msg:'시동이 안 걸려요. 아르곤은 거의 반응하지 않아 연료가 될 수 없어요.'},
    h2o:{grade:'near',fx:'slow',msg:'천천히 움직여요. 수증기는 연료가 아니라서 물을 끓일 연료를 따로 태워야 해요.'},
  }},
  {id:'sign', answer:'ne', title:'붉은 주황빛 간판을 환하게 켜라!', ask:'유리관 속에 어떤 기체를 넣을까요?', res:{
    ne:{grade:'ok',fx:'glowNe',msg:'환한 붉은 주황빛! 네온은 유리관 속에서 전기가 흐르면 이 빛을 내요. 그래서 네온사인이라고 해요.'},
    ar:{grade:'near',fx:'glowAr',msg:'옅은 보랏빛이 나요. 아르곤은 붉은 주황빛을 내지 않아요.'},
    he:{grade:'near',fx:'glowHe',msg:'옅은 빛이 나요. 헬륨도 빛을 내지만 네온처럼 진한 붉은 주황빛은 아니에요.'},
    h2:{grade:'bad',fx:'dim',msg:'분홍빛이 나요. 붉은 주황빛이 아닌 데다 수소는 불이 잘 붙어 간판에 쓰지 않아요.'},
    o2:{grade:'bad',fx:'dim',msg:'환하게 빛나지 않아요. 산소는 네온처럼 밝은 간판 빛을 내지 못해요.'},
    n2:{grade:'bad',fx:'dim',msg:'붉은 주황빛이 아니에요. 질소는 네온처럼 환한 붉은 주황빛을 내지 못해요.'},
    co2:{grade:'bad',fx:'dim',msg:'붉은 주황빛이 아니에요. 이산화 탄소는 네온처럼 환한 붉은 주황빛을 내지 못해요.'},
    h2o:{grade:'bad',fx:'dim',msg:'환하게 빛나지 않아요. 유리관 속 수증기는 식으면 물방울로 맺혀요.'},
  }},
  {id:'weld', answer:'ar', title:'뜨거운 쇠를 튼튼하게 이어 붙여라!', ask:'용접할 때 뜨거운 금속을 공기에서 지켜 줄 기체는?', res:{
    ar:{grade:'ok',fx:'shield',msg:'매끈하게 붙었어요! 아르곤은 거의 반응하지 않아요. 뜨거운 금속을 감싸 공기와 닿지 못하게 막아요.'},
    o2:{grade:'bad',fx:'sparks',msg:'불꽃이 확 튀어요! 산소는 용접 불꽃을 키우지만, 뜨거운 쇠는 지켜 주지 못하고 더 태워요.'},
    h2:{grade:'bad',fx:'boom',msg:'펑! 수소는 뜨거운 불꽃에 터질 수 있어요.'},
    n2:{grade:'near',fx:'rough',msg:'거칠게 붙었어요. 질소는 쉽게 반응하지 않지만, 아주 뜨거운 금속과는 반응하기도 해요.'},
    co2:{grade:'near',fx:'rough',msg:'붙기는 해요. 실제로 철을 용접할 때 쓰기도 해요. 하지만 불꽃이 더 튀어요. 거의 반응하지 않는 기체를 찾아봐요.'},
    he:{grade:'near',fx:'rough',msg:'붙기는 해요. 하지만 헬륨은 아주 가벼워 금세 위로 날아가, 많이 써야 하고 비싸요.'},
    ne:{grade:'near',fx:'money',msg:'금속은 지켜 주지만 너무 귀해요. 네온은 공기 중에 아주 적어요.'},
    h2o:{grade:'bad',fx:'rough',msg:'치직! 뜨거운 쇠가 수증기와 반응해 약하게 붙었어요.'},
  }},
  {id:'turbine', answer:'h2o', title:'발전소의 터빈을 돌려 전기를 만들어라!', ask:'터빈은 기체의 힘으로 도는 날개 바퀴예요. 어떤 기체로 돌릴까요?', res:{
    h2o:{grade:'ok',fx:'spin',msg:'터빈이 빙글빙글, 전구가 켜졌어요! 물을 끓이면 수증기가 되며 부피가 아주 커져요. 그 힘으로 터빈을 돌려요.'},
    h2:{grade:'bad',fx:'boom',msg:'펑! 수소가 뜨거운 곳에서 공기와 만나 터졌어요.'},
    o2:{grade:'bad',fx:'danger',msg:'위험해요! 뜨거운 발전소에 산소가 가득하면 불이 쉽게 붙어요.'},
    n2:{grade:'near',fx:'stop',msg:'터빈이 돌다가 멈춰요. 터빈을 계속 돌리려면 뜨겁고 힘센 기체가 쉼 없이 나와야 해요. 물을 끓이면 되는 기체를 찾아봐요.'},
    co2:{grade:'near',fx:'stop',msg:'터빈이 돌다가 멈춰요. 터빈을 계속 돌리려면 뜨겁고 힘센 기체가 쉼 없이 나와야 해요. 물을 끓이면 되는 기체를 찾아봐요.'},
    he:{grade:'near',fx:'stop',msg:'터빈이 돌다가 멈춰요. 헬륨은 귀해서 이렇게 많이 쓸 수 없어요.'},
    ne:{grade:'near',fx:'stop',msg:'터빈이 돌다가 멈춰요. 네온은 귀해서 이렇게 많이 쓸 수 없어요.'},
    ar:{grade:'near',fx:'stop',msg:'터빈이 돌다가 멈춰요. 아르곤을 이렇게 많이 쓰면 너무 비싸요.'},
  }},
];

const BONUS = [
  {id:'stove', answer:'ch4', title:'가스레인지에 파란 불꽃을 켜라!', ask:'도시가스의 주성분을 찾아요.', res:{
    ch4:{grade:'ok',fx:'blue',msg:'파란 불꽃이 켜졌어요! 메테인은 도시가스의 주성분이에요. 잘 타면서 많은 열을 내요.'},
    o3:{grade:'bad',fx:'none',msg:'불이 안 켜져요. 오존은 연료로 쓰지 않아요. 마시면 코와 목에도 해로워요.'},
    xe:{grade:'bad',fx:'none',msg:'불이 안 켜져요. 제논은 불이 붙지 않아요.'},
    kr:{grade:'bad',fx:'none',msg:'불이 안 켜져요. 크립톤은 불이 붙지 않아요.'},
  }},
  {id:'uv', answer:'o3', title:'태양의 강한 자외선을 막아라!', ask:'높은 하늘에서 자외선을 막아 주는 기체는?', res:{
    o3:{grade:'ok',fx:'shieldUv',msg:'자외선을 막았어요! 성층권의 오존이 태양의 자외선을 많이 흡수해요. 땅 가까이에 있는 오존은 해로울 수 있어요.'},
    ch4:{grade:'bad',fx:'none',msg:'자외선을 막지 못해요. 메테인은 공기 중에 아주 적어요.'},
    xe:{grade:'bad',fx:'none',msg:'자외선을 막지 못해요. 제논은 공기 중에 아주 적어요.'},
    kr:{grade:'bad',fx:'none',msg:'자외선을 막지 못해요. 크립톤은 공기 중에 아주 적어요.'},
  }},
  {id:'beam', answer:'xe', title:'강한 흰빛으로 먼 길을 비춰라!', ask:'자동차 앞을 비추는 램프(전조등)에 넣는 기체는?', res:{
    xe:{grade:'ok',fx:'beam',msg:'밝은 흰빛! 제논을 넣은 램프는 전기를 받아 강한 빛을 내요. 자동차 전조등에 써요.'},
    kr:{grade:'near',fx:'beamWeak',msg:'빛은 나요. 크립톤도 특수 조명에 쓰지만, 이 강한 흰빛을 내는 램프에는 다른 기체를 넣어요.'},
    ch4:{grade:'bad',fx:'boom',msg:'펑! 메테인은 불이 잘 붙어요. 램프에 넣으면 위험해요.'},
    o3:{grade:'bad',fx:'none',msg:'빛이 나지 않아요. 오존은 금세 산소로 바뀌는 기체라 램프에 넣지 않아요.'},
  }},
  {id:'window', answer:'kr', title:'창문으로 빠져나가는 열을 막아라!', ask:'열이 덜 빠져나가는 창문 유리 두 장 사이에 넣는 기체는?', res:{
    kr:{grade:'ok',fx:'warm',msg:'집 안이 따뜻해요! 크립톤은 아르곤보다도 열을 덜 전달해 유리 사이로 열이 덜 빠져요.'},
    xe:{grade:'near',fx:'warm',msg:'열은 잘 막아요. 하지만 제논은 크립톤보다 훨씬 귀해서 창문에 쓰기엔 너무 비싸요.'},
    ch4:{grade:'bad',fx:'danger',msg:'위험해요! 메테인은 불이 잘 붙어서 창문에 넣지 않아요.'},
    o3:{grade:'bad',fx:'none',msg:'열을 막지 못해요. 오존은 금세 산소로 바뀌고 마시면 해로워요.'},
  }},
];

const OX = [
  ['공기에서 가장 많은 기체는 산소이다.', false, '가장 많은 기체는 질소예요. 약 78%를 차지해요.'],
  ['내가 끼운 네온 와이어 속에는 네온 기체가 들어 있다.', false, '이름만 네온이에요. 전기를 받은 형광 물질이 빛나요.'],
  ['백열전구 속 아르곤은 필라멘트가 빠르게 증발하는 것을 막는다.', true, '그래서 전구를 더 오래 쓸 수 있어요.'],
  ['산소는 스스로 불에 타서 연료가 된다.', false, '산소는 다른 물질이 타는 것을 도와요. 스스로 타지는 않아요.'],
  ['수소 자동차는 달릴 때 이산화 탄소를 내보내지 않는다.', true, '수소가 산소와 만나 전기를 만들고 물이 나와요.'],
];
