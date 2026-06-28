// 다국어 번역 사전 및 UI 번역 유틸리티 (i18n)
const I18nEngine = {
  // 정적 UI 번역 리소스
  ui: {
    ko: {
      "nav-logo-text": "Type B",
      "hero-title": "나의 여행 <span class=\"highlight-text\">MBTI</span>에 맞는<br>부산 최고의 맛집을 나만의 지도로",
      "hero-subtitle": "부산 미식투어 공공데이터와 여행 성향 MBTI를 결합해서<br>1:1 커스텀 맛집 지도를 만들어보아요.",
      "start-quiz-btn": "미식 성향 퀴즈 시작하기 <i class=\"fas fa-arrow-right\"></i>",
      "quiz-badge": "성향 분석 퀴즈",
      "quiz-back-text": "이전",
      "loading-title": "잠깐, 맛집 고르는 중...",
      "loading-subtitle": "곧 나만의 부산 맛집 지도가 완성돼요!",
      "restart-btn": "<i class=\"fas fa-undo\"></i> 다시 검사하기",
      "toggle-map-view": "<i class=\"fas fa-map-marked-alt\"></i> 지도 보기",
      "toggle-list-view": "<i class=\"fas fa-list-ul\"></i> 리스트 보기",
      "filter-all": "전체",
      "filter-korean": "한식",
      "filter-seafood": "해산물",
      "filter-japanese": "일식",
      "filter-western": "양식",
      "filter-chinese": "중식",
      "filter-cafe": "카페·디저트",
      "global-loader-text": "부산 맛집 공공데이터 로딩 중...",
      "empty-list": "선택하신 장르의 매칭된 맛집이 없습니다. 다른 필터를 선택해 주세요."
    },
    en: {
      "nav-logo-text": "Type B",
      "hero-title": "Your Personal Food Map in Busan<br>tailored to your Travel <span class=\"highlight-text\">MBTI</span>",
      "hero-subtitle": "Let's combine Busan gastronomy public API data with your travel MBTI<br>to create a 1:1 custom food map.",
      "start-quiz-btn": "Start Gastronomy Quiz <i class=\"fas fa-arrow-right\"></i>",
      "quiz-badge": "Travel MBTI Quiz",
      "quiz-back-text": "Back",
      "loading-title": "Hold on, choosing restaurants...",
      "loading-subtitle": "Your personal Busan food map is almost ready!",
      "restart-btn": "<i class=\"fas fa-undo\"></i> Retake Quiz",
      "toggle-map-view": "<i class=\"fas fa-map-marked-alt\"></i> Map View",
      "toggle-list-view": "<i class=\"fas fa-list-ul\"></i> List View",
      "filter-all": "All",
      "filter-korean": "Korean",
      "filter-seafood": "Seafood",
      "filter-japanese": "Japanese",
      "filter-western": "Western",
      "filter-chinese": "Chinese",
      "filter-cafe": "Cafe/Dessert",
      "global-loader-text": "Loading Busan Gastronomy Data...",
      "empty-list": "No matching restaurants found in this category. Try another filter."
    }
  },

  // 16가지 MBTI 성향 번역 사전
  mbtiProfiles: {
    ESTJ: {
      ko: { title: "철저한 계획파 맛집 정복자", desc: "이동 동선과 웨이팅 시간까지 치밀하게 설계하여 검증된 전통 맛집과 깔끔한 정식을 실패 없이 정복하는 프로 계획러입니다." },
      en: { title: "Thoroughly Planned Food Conqueror", desc: "A master planner who meticulously designs travel routes and wait times, failure-freely conquering verified heritage restaurants and clean table d'hote." }
    },
    ENTJ: {
      ko: { title: "트렌디 미식 리더", desc: "맛의 퀄리티와 서비스 효율성을 날카롭게 판단하고, 비즈니스 대접에도 어울릴 정갈하고 훌륭한 핫플레이스를 리드하는 대장부형 미식가입니다." },
      en: { title: "Trendy Gastronomy Leader", desc: "A charismatic gourmet who sharply judges food quality and service efficiency, leading the group to neat and outstanding hot spots suitable for formal dining." }
    },
    ESFJ: {
      ko: { title: "모두를 행복하게 만드는 미식 큐레이터", desc: "사람들과 어울려 활기찬 에너지를 채우고, 호불호 없이 모두가 만족할 대표적인 대형 맛집과 전통적인 명소를 추천하는 센스쟁이입니다." },
      en: { title: "Social Harmony Food Curator", desc: "A thoughtful host who charges up with lively energy among people, recommending crowd-pleasing major restaurants and traditional landmarks that everyone will love." }
    },
    ENFJ: {
      ko: { title: "낭만 가득한 감성 미식 안내자", desc: "아름다운 오션뷰와 종업원의 친절함에 감동하며, 사람들과 함께 아름다운 바다 야경과 맛있는 디저트를 만끽하는 다정다감한 낭만가입니다." },
      en: { title: "Romantic Gastronomy Guide", desc: "A warm romanticist who is touched by beautiful ocean views and friendly service, fully enjoying night seascapes and sweet desserts with companions." }
    },
    ESTP: {
      ko: { title: "실전 미식 푸드 파이터", desc: "길거리 포장마차부터 활기찬 자갈치 시장까지 몸으로 부딪치며 현지의 참맛을 생생하고 가성비 있게 낚아채는 행동파 식도락가입니다." },
      en: { title: "Action-Driven Food Explorer", desc: "A hands-on explorer who dives into street stalls and bustling fish markets, grabbing authentic local flavors with excellent cost efficiency." }
    },
    ENTP: {
      ko: { title: "이색 퓨전 요리 모험가", desc: "평범한 맛은 지루해합니다. 독특한 재료의 조합이나 새로운 퓨전 요리, 트렌디하고 감각적인 실험적 카페를 찾아다니며 즐거움을 얻는 모험가입니다." },
      en: { title: "Experimental Fusion Adventurer", desc: "Bored by the ordinary. An active adventurer who finds joy in unique ingredient pairings, creative fusion dishes, and trendy, experimental cafes." }
    },
    ESFP: {
      ko: { title: "축제 같은 맛 파티피플", desc: "맛있는 음식과 신나는 대화, 북적이는 전통시장과 오션뷰 명소가 펼쳐지는 축제 같은 공간에서 인생 사진과 즐거운 추억을 남기는 분위기 메이커입니다." },
      en: { title: "Festive Food Partygoer", desc: "A mood maker who creates sweet memories and snaps photos of a lifetime in festive settings with good food, lively chat, bustling traditional markets, and scenic ocean views." }
    },
    ENFP: {
      ko: { title: "바람을 따라 걷는 낭만 방랑자", desc: "아기자기한 디저트 카페와 탁 트인 전망이 있는 곳이라면 어디든 좋습니다. 정형화된 틀을 벗어나 즉흥적으로 찾은 숨은 맛집에서 낭만을 발견합니다." },
      en: { title: "Free-Spirited Romantic Wanderer", desc: "Loves cozy dessert cafes and wide open views. Breaks away from structured plans to discover romance in hidden local spots found on a whim." }
    },
    ISTJ: {
      ko: { title: "원조 노포와 백년가게 사냥꾼", desc: "유행을 타지 않고 수십 년간 묵묵히 자리를 지킨 정통 로컬 노포나 깔끔한 정식 식당을 정갈하게 기록하고 방문하는 든든한 학구파입니다." },
      en: { title: "Authentic Heritage Spot Hunter", desc: "A reliable scholar who cleanly records and visits traditional local spots and neat diners that have quietly stood the test of time, ignoring temporary trends." }
    },
    INTJ: {
      ko: { title: "완벽을 추구하는 미식 분석가", desc: "인터넷 속 가짜 광고를 거르고 철저히 평점과 맛의 본질을 분석하여 정적이고 프라이빗한 공간에서 고독하게 미식을 맛보는 철학자입니다." },
      en: { title: "Perfectionist Food Analyst", desc: "Filters out fake internet ads, strictly analyzing ratings and the essence of taste to quietly savor gourmet dishes in peaceful, private spaces." }
    },
    ISFJ: {
      ko: { title: "아늑한 힐링 밥상 컬렉터", desc: "시끄럽지 않은 한적한 골목길 모퉁이, 친절한 정이 머무는 한식 매장에서 소중한 사람들과 마음 따뜻한 정을 채우는 다정한 치유자입니다." },
      en: { title: "Cozy Soul Food Collector", desc: "A warm healer who fills their heart sharing kind local meals with loved ones in quiet alley corners and friendly neighborhood kitchens." }
    },
    INFJ: {
      ko: { title: "영혼을 울리는 사색의 미식가", desc: "깊은 여유와 바다 풍경이 머무는 한적한 카페나 갤러리풍 식당에서 맛의 내밀한 스토리를 상상하고 음미하는 마음 깊은 사색가입니다." },
      en: { title: "Deep Reflective Gourmet", desc: "A thoughtful thinker who imagines and savors the hidden stories of taste in quiet oceanfront cafes or artistic gallery-like restaurants." }
    },
    ISTP: {
      ko: { title: "숨겨진 골목 가성비 장인", desc: "번잡함은 피하고 가성비와 음식 자체의 내공만으로 정직하게 승부하는 외딴 골목길 숨은 실력파 식당을 기가 막히게 찾아내는 은둔 고수입니다." },
      en: { title: "Hidden Alley Value Artisan", desc: "Avoids crowds to find hidden gems in quiet back alleys that win honestly with absolute value and true culinary craftsmanship." }
    },
    INTP: {
      ko: { title: "호기심 많은 미식 탐구 과학자", desc: "이 식당의 소스는 왜 이런 맛이 날까? 혼밥하기 편안한 구석자리나 독창적인 콘셉트의 특이한 디저트 숍에서 미식의 메커니즘을 관찰하는 연구원입니다." },
      en: { title: "Curious Food Science Researcher", desc: "Asks 'Why does this sauce taste like this?' An observer who analyzes the mechanisms of gastronomy in comfortable solo spots or unique dessert labs." }
    },
    ISFP: {
      ko: { title: "풍경과 미학을 담는 감성 아티스트", desc: "플레이팅이 아름답고 오션뷰가 예술인 장소를 사랑합니다. 오감으로 맛과 미학을 조용히 만끽하고 스케치하듯 미식을 감상하는 예술가입니다." },
      en: { title: "Scenic Aesthetic Artist", desc: "Loves beautiful plating and stunning ocean backdrops. Silently enjoys taste and aesthetics with all five senses like sketching a painting." }
    },
    INFP: {
      ko: { title: "상상과 낭만 속 꿈꾸는 미식가", desc: "동화 속에 나올 법한 빈티지하고 아기자기한 감성 카페나 고요한 바닷가 식당에서 맛있는 음식과 낭만적인 문학적 사유를 즐기는 꿈쟁이입니다." },
      en: { title: "Dreamy Romantic Poet-Gourmet", desc: "Enjoys delicious bites and romantic literary thoughts in fairy-tale-like vintage cafes or peaceful seaside restaurants." }
    }
  },

  // 3. UI 번역 갱신 함수
  translateUI: function(lang) {
    const dictionary = this.ui[lang];
    if (!dictionary) return;

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.dataset.i18n;
      if (dictionary[key]) {
        el.innerHTML = dictionary[key];
      }
    });
  }
};

window.I18nEngine = I18nEngine;
