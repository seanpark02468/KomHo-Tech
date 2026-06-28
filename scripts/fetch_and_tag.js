const fs = require('fs');
const path = require('path');

const SERVICE_KEY = '001e32e24be265a32586a23988bc7bc2a50555731942104383859aecb8cdf521';
const API_URL = `http://apis.data.go.kr/6260000/FoodService/getFoodKr?serviceKey=${SERVICE_KEY}&resultType=json&numOfRows=500`;

// 키워드 사전 정의
const KEYWORDS = {
  // MBTI 성향별 키워드
  E: ['시장', '북적', '사람', '단체', '모임', '줄 서', '유명', '대표', '인기', '활기', '광장', '거리', '왁자지껄'],
  I: ['아늑', '조용', '숨겨진', '혼밥', '골목', '여유', '차분', '휴식', '프라이빗', '혼자', '소규모', '단정'],
  S: ['전통', '원조', '노포', '향토', '오랜', '수대째', '할머니', '전통시장', '정통', '직접', '대물림', '역사'],
  N: ['이색', '독특', '트렌디', '퓨전', '감각', '새로운', '현대적', '창의', '예술', '특별한', '감성카페', '모던'],
  T: ['가성비', '푸짐', '저렴', '정직', '든든', '신속', '정갈', '실속', '합리적', '친근한', '착한가격'],
  F: ['분위기', '전망', '바다', '야경', '데이트', '감성', '예쁜', '친절', '로맨틱', '추억', '오션뷰', '예술적', '인스타'],
  J: ['예약', '코스', '정돈', '정식', '비즈니스', '대접', '깔끔', '격식', '시간 맞춰', '위생', '안전'],
  P: ['길거리', '간편', '가벼운', '편안', '즉석', '야식', '부담 없는', '노점', 'casual', '갑자기', '자유']
};

// 음식 장르 매핑 규칙
const GENRE_RULES = {
  Cafe: ['카페', '디저트', '빵', '베이커리', '커피', '차', '빙수', '샌드위치', '에스프레소', '로스터리', '티하우스', '마카롱'],
  Seafood: ['회', '조개', '대게', '해물', '해산물', '랍스터', '전복', '장어', '낙지', '쭈꾸미', '아구찜', '복어', '복국', '꽃게', '생선구이', '물회', '곰장어'],
  Japanese: ['스시', '초밥', '사시미', '우동', '돈가스', '돈카츠', '라멘', '소바', '일식', '이자카야', '규동'],
  Western: ['피자', '파스타', '스테이크', '이탈리아', '양식', '버거', '샐러드', '레스토랑', '프렌치', '와인바'],
  Chinese: ['짜장', '짬뽕', '탕수육', '만두', '중식', '딤섬', '마라탕', '양꼬치', '양장피', '깐풍기'],
  Korean: [] // 매칭되지 않는 경우 기본 장르
};

// 키워드 카운팅 함수
function countOccurrences(text, keywords) {
  if (!text) return 0;
  let count = 0;
  keywords.forEach(kw => {
    const regex = new RegExp(kw, 'gi');
    const matches = text.match(regex);
    if (matches) {
      count += matches.length;
    }
  });
  return count;
}

// 식당 데이터 태깅
function tagRestaurant(item) {
  const textToAnalyze = `${item.MAIN_TITLE} ${item.RPRSNTV_MENU} ${item.ITEMCNTNTS}`;
  
  // 1. 장르 판별
  let detectedGenre = 'Korean';
  for (const [genre, keywords] of Object.entries(GENRE_RULES)) {
    if (genre === 'Korean') continue;
    const count = countOccurrences(textToAnalyze, keywords);
    if (count > 0) {
      detectedGenre = genre;
      break;
    }
  }

  // 2. MBTI 속성 점수화 (-1.0 ~ +1.0)
  // J/P 축 제외, E(분위기+), I(분위기-), N(메뉴+), S(메뉴-), F(가치+), T(가치-) 로 사용
  const scores = { E_I: 0.0, N_S: 0.0, F_T: 0.0 };
  
  const axes = [
    { pos: 'E', neg: 'I', key: 'E_I' }, // 분위기
    { pos: 'N', neg: 'S', key: 'N_S' }, // 메뉴
    { pos: 'F', neg: 'T', key: 'F_T' }  // 가치
  ];

  axes.forEach(({ pos, neg, key }) => {
    const posScore = countOccurrences(textToAnalyze, KEYWORDS[pos]);
    const negScore = countOccurrences(textToAnalyze, KEYWORDS[neg]);
    const total = posScore + negScore;
    
    let val = 0.0;
    if (total > 0) {
      // (양 - 음) / (양 + 음)
      val = (posScore - negScore) / total;
    }
    
    // 가산점: 번화가(해운대구, 부산진구, 수영구, 중구)일 경우 분위기 축(E_I)에 +0.2 가산
    if (key === 'E_I' && ['해운대구', '부산진구', '수영구', '중구'].includes(item.GUGUN_NM)) {
      val += 0.2;
    }
    
    // -1.0 ~ 1.0 범위 제한 및 소수점 2자리 반올림
    scores[key] = Math.max(-1.0, Math.min(1.0, Math.round(val * 100) / 100));
  });

  return {
    id: item.UC_SEQ,
    name: item.MAIN_TITLE,
    genre: detectedGenre,
    gugun: item.GUGUN_NM,
    address: item.ADDR1,
    lat: parseFloat(item.LAT) || 35.1797865, // 기본값: 부산시청 위도
    lng: parseFloat(item.LNG) || 129.0750194, // 기본값: 부산시청 경도
    phone: item.CNTCT_TEL || '정보 없음',
    hours: item.USAGE_DAY_WEEK_AND_TIME ? item.USAGE_DAY_WEEK_AND_TIME.replace(/\n/g, ' ') : '정보 없음',
    menu: item.RPRSNTV_MENU || '정보 없음',
    image: item.MAIN_IMG_NORMAL || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60',
    thumb: item.MAIN_IMG_THUMB || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=60',
    desc: item.ITEMCNTNTS ? item.ITEMCNTNTS.trim() : '부산의 대표적인 맛집입니다.',
    mbti_scores: scores
  };
}

async function run() {
  console.log('Fetching Busan restaurant data from OpenAPI...');
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (!data.getFoodKr || !data.getFoodKr.item) {
      throw new Error('Invalid response structure. Check your API key or request URL.');
    }
    
    const rawItems = data.getFoodKr.item;
    console.log(`Successfully fetched ${rawItems.length} restaurants. Tagging data...`);
    
    const taggedItems = rawItems.map(tagRestaurant);
    
    // 데이터 저장 디렉토리 생성
    const outputDir = path.join(__dirname, '..', 'public', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'restaurants.json');
    fs.writeFileSync(outputPath, JSON.stringify(taggedItems, null, 2), 'utf-8');
    
    console.log(`Successfully saved ${taggedItems.length} tagged restaurants to: ${outputPath}`);
  } catch (error) {
    console.error('Error during fetch and tag process:', error);
    process.exit(1);
  }
}

run();
