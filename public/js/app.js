// MBTI 기반 부산 맛집 추천 서비스 SPA 컨트롤러
const AppController = {
  // 상태 변수
  state: {
    currentView: 'intro', // 'intro' | 'quiz' | 'loading' | 'result'
    currentQuestionIndex: 0,
    quizAnswers: [],
    mbtiResult: null, // { mbti, scores }
    restaurants: [], // raw 데이터
    matchedRestaurants: [], // 매칭 계산 완료 데이터
    currentGenreFilter: 'all',
    selectedRestaurantId: null
  },

  // 16개 MBTI별 여행 미식 성향 명칭 및 수식어 사전
  mbtiProfiles: {
    ESTJ: { title: "철저한 계획파 맛집 정복자", desc: "이동 동선과 웨이팅 시간까지 치밀하게 설계하여 검증된 전통 맛집과 깔끔한 정식을 실패 없이 정복하는 프로 계획러입니다." },
    ENTJ: { title: "트렌디 미식 리더", desc: "맛의 퀄리티와 서비스 효율성을 날카롭게 판단하고, 비즈니스 대접에도 어울릴 정갈하고 훌륭한 핫플레이스를 리드하는 대장부형 미식가입니다." },
    ESFJ: { title: "모두를 행복하게 만드는 미식 큐레이터", desc: "사람들과 어울려 활기찬 에너지를 채우고, 호불호 없이 모두가 만족할 대표적인 대형 맛집과 전통적인 명소를 추천하는 센스쟁이입니다." },
    ENFJ: { title: "낭만 가득한 감성 미식 안내자", desc: "아름다운 오션뷰와 종업원의 친절함에 감동하며, 사람들과 함께 아름다운 바다 야경과 맛있는 디저트를 만끽하는 다정다감한 낭만가입니다." },
    ESTP: { title: "실전 미식 푸드 파이터", desc: "길거리 포장마차부터 활기찬 자갈치 시장까지 몸으로 부딪치며 현지의 참맛을 생생하고 가성비 있게 낚아채는 행동파 식도락가입니다." },
    ENTP: { title: "이색 퓨전 요리 모험가", desc: "평범한 맛은 지루해합니다. 독특한 재료의 조합이나 새로운 퓨전 요리, 트렌디하고 감각적인 실험적 카페를 찾아다니며 즐거움을 얻는 모험가입니다." },
    ESFP: { title: "축제 같은 맛 파티피플", desc: "맛있는 음식과 신나는 대화, 북적이는 전통시장과 오션뷰 명소가 펼쳐지는 축제 같은 공간에서 인생 사진과 즐거운 추억을 남기는 분위기 메이커입니다." },
    ENFP: { title: "바람을 따라 걷는 낭만 방랑자", desc: "아기자기한 디저트 카페와 탁 트인 전망이 있는 곳이라면 어디든 좋습니다. 정형화된 틀을 벗어나 즉흥적으로 찾은 숨은 맛집에서 낭만을 발견합니다." },
    ISTJ: { title: "원조 노포와 백년가게 사냥꾼", desc: "유행을 타지 않고 수십 년간 묵묵히 자리를 지킨 정통 로컬 노포나 깔끔한 정식 식당을 정갈하게 기록하고 방문하는 든든한 학구파입니다." },
    INTJ: { title: "완벽을 추구하는 미식 분석가", desc: "인터넷 속 가짜 광고를 거르고 철저히 평점과 맛의 본질을 분석하여 정적이고 프라이빗한 공간에서 고독하게 미식을 맛보는 철학자입니다." },
    ISFJ: { title: "아늑한 힐링 밥상 컬렉터", desc: "시끄럽지 않은 한적한 골목길 모퉁이, 친절한 정이 머무는 한식 매장에서 소중한 사람들과 마음 따뜻한 정을 채우는 다정한 치유자입니다." },
    INFJ: { title: "영혼을 울리는 사색의 미식가", desc: "깊은 여유와 바다 풍경이 머무는 한적한 카페나 갤러리풍 식당에서 맛의 내밀한 스토리를 상상하고 음미하는 마음 깊은 사색가입니다." },
    ISTP: { title: "숨겨진 골목 가성비 장인", desc: "번잡함은 피하고 가성비와 음식 자체의 내공만으로 정직하게 승부하는 외딴 골목길 숨은 실력파 식당을 기가 막히게 찾아내는 은둔 고수입니다." },
    INTP: { title: "호기심 많은 미식 탐구 과학자", desc: "이 식당의 소스는 왜 이런 맛이 날까? 혼밥하기 편안한 구석자리나 독창적인 콘셉트의 특이한 디저트 숍에서 미식의 메커니즘을 관찰하는 연구원입니다." },
    ISFP: { title: "풍경과 미학을 담는 감성 아티스트", desc: "플레이팅이 아름답고 오션뷰가 예술인 장소를 사랑합니다. 오감으로 맛과 미학을 조용히 만끽하고 스케치하듯 미식을 감상하는 예술가입니다." },
    INFP: { title: "상상과 낭만 속 꿈꾸는 미식가", desc: "동화 속에 나올 법한 빈티지하고 아기자기한 감성 카페나 고요한 바닷가 식당에서 맛있는 음식과 낭만적인 문학적 사유를 즐기는 꿈쟁이입니다." }
  },

  // 2. 앱 초기화
  init: async function() {
    this.bindEvents();
    
    // 데이터 로드
    const loaderEl = document.getElementById('global-loader');
    try {
      const response = await fetch('./data/restaurants.json');
      if (!response.ok) throw new Error("데이터를 가져오는 데 실패했습니다.");
      this.state.restaurants = await response.json();
      console.log(`Loaded ${this.state.restaurants.length} restaurants for app.`);
      
      // 로더 숨기기
      if (loaderEl) loaderEl.style.opacity = '0';
      setTimeout(() => { if (loaderEl) loaderEl.style.display = 'none'; }, 500);
    } catch (error) {
      console.error("Initialization error:", error);
      alert("맛집 데이터를 불러오지 못했습니다. 새로고침해 주세요.");
    }
  },

  // 3. 이벤트 바인딩
  bindEvents: function() {
    // 시작 버튼
    const startBtn = document.getElementById('start-quiz-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startQuiz());
    }

    // 다시 시작 버튼
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.switchView('intro');
      });
    }

    // 장르 필터링 조작 이벤트 위임
    const filterContainer = document.getElementById('genre-filters');
    if (filterContainer) {
      filterContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (chip) {
          const genre = chip.dataset.genre;
          this.setFilter(genre);
        }
      });
    }

    // 모바일 탭 스위치
    const toggleMapBtn = document.getElementById('toggle-map-view');
    const toggleListBtn = document.getElementById('toggle-list-view');
    const mapSection = document.querySelector('.map-section');
    const listSection = document.querySelector('.list-section');

    if (toggleMapBtn && toggleListBtn && mapSection && listSection) {
      toggleMapBtn.addEventListener('click', () => {
        toggleMapBtn.classList.add('active');
        toggleListBtn.classList.remove('active');
        mapSection.classList.add('active');
        listSection.classList.remove('active');
        
        // 지도가 모바일 화면에 맞춰 올바르게 렌더링되도록 리사이즈 트리거
        if (window.MapModule && window.MapModule.map) {
          setTimeout(() => window.MapModule.map.invalidateSize(), 150);
        }
      });

      toggleListBtn.addEventListener('click', () => {
        toggleListBtn.classList.add('active');
        toggleMapBtn.classList.remove('active');
        listSection.classList.add('active');
        mapSection.classList.remove('active');
      });
    }
  },

  // 4. 뷰 전환 제어
  switchView: function(viewName) {
    this.state.currentView = viewName;
    
    // DOM 클래스 토글
    document.getElementById('intro-view').style.display = viewName === 'intro' ? 'flex' : 'none';
    document.getElementById('quiz-view').style.display = viewName === 'quiz' ? 'flex' : 'none';
    document.getElementById('loading-view').style.display = viewName === 'loading' ? 'flex' : 'none';
    document.getElementById('result-view').style.display = viewName === 'result' ? 'block' : 'none';

    // 뷰 전환 시 스크롤 최상단 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // 5. 퀴즈 시작
  startQuiz: function() {
    this.state.currentQuestionIndex = 0;
    this.state.quizAnswers = [];
    this.switchView('quiz');
    this.renderQuestion();
  },

  // 6. 질문 렌더링
  renderQuestion: function() {
    const questions = window.QuizEngine.questions;
    const index = this.state.currentQuestionIndex;
    const q = questions[index];

    // 프로그레스 바 업데이트
    const progressFill = document.getElementById('quiz-progress-fill');
    const progressText = document.getElementById('quiz-progress-text');
    const percent = Math.round(((index + 1) / questions.length) * 100);
    
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.innerText = `${index + 1} / ${questions.length}`;

    // 질문 텍스트
    const questionText = document.getElementById('question-text');
    if (questionText) {
      // 슬라이드 페이드 애니메이션 적용을 위한 애니메이션 리셋
      questionText.style.opacity = '0';
      questionText.style.transform = 'translateY(10px)';
      setTimeout(() => {
        questionText.innerText = q.question;
        questionText.style.opacity = '1';
        questionText.style.transform = 'translateY(0)';
      }, 150);
    }

    // 선택지 버튼
    const answersContainer = document.getElementById('quiz-answers');
    if (answersContainer) {
      answersContainer.innerHTML = '';
      q.answers.forEach((ans, i) => {
        const button = document.createElement('button');
        button.className = 'quiz-answer-btn';
        button.innerHTML = `<span class="answer-text">${ans.text}</span>`;
        
        button.addEventListener('click', () => {
          button.classList.add('selected');
          // 작은 지연 후 다음 질문으로 넘어가 터치 체감 개선
          setTimeout(() => this.selectAnswer(ans), 200);
        });
        
        answersContainer.appendChild(button);
      });
    }
  },

  // 7. 답변 선택 처리
  selectAnswer: function(answer) {
    this.state.quizAnswers.push(answer);
    const questions = window.QuizEngine.questions;

    if (this.state.currentQuestionIndex < questions.length - 1) {
      this.state.currentQuestionIndex++;
      this.renderQuestion();
    } else {
      // 퀴즈 완료 -> 로딩 뷰 이동
      this.switchView('loading');
      
      // 맛있는 추천을 위한 인공지능 분석 가상 연출 (1.5초)
      setTimeout(() => {
        this.processResults();
      }, 1500);
    }
  },

  // 8. 퀴즈 결과 계산 및 맛집 매칭
  processResults: function() {
    const rawResult = window.QuizEngine.calculateMBTI(this.state.quizAnswers);
    this.state.mbtiResult = rawResult;
    
    // 맛집 정렬 수행 (코사인 유사도 기반 매칭 점수 계산)
    this.state.matchedRestaurants = window.MatchEngine.matchAndSort(
      this.state.mbtiResult,
      this.state.restaurants
    );

    this.switchView('result');
    this.renderResult();
  },

  // 9. 결과 화면 렌더링
  renderResult: function() {
    const { mbti } = this.state.mbtiResult;
    const profile = this.mbtiProfiles[mbti] || { title: "신비로운 여행가", desc: "음식을 사랑하고 부산을 탐험하는 열정적인 큐레이터입니다." };

    // MBTI 및 타이틀 표시
    const mbtiBadge = document.getElementById('user-mbti-type');
    const mbtiTitle = document.getElementById('user-mbti-title');
    const mbtiDesc = document.getElementById('user-mbti-desc');

    if (mbtiBadge) mbtiBadge.innerText = mbti;
    if (mbtiTitle) mbtiTitle.innerText = profile.title;
    if (mbtiDesc) mbtiDesc.innerText = profile.desc;

    // 지도 모듈 구동
    window.MapModule.initMap('map-container');

    // 장르 필터 '전체'로 복구 (내부적으로 applyFilteringAndRendering이 호출되어 마커와 리스트를 렌더링함)
    this.setFilter('all');
  },

  // 10. 장르 필터 지정
  setFilter: function(genre) {
    this.state.currentGenreFilter = genre;
    
    // 필터 칩 스타일링 갱신
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      if (chip.dataset.genre === genre) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    this.applyFilteringAndRendering();
  },

  // 11. 필터링 로직 및 렌더링 동기화
  applyFilteringAndRendering: function() {
    const genre = this.state.currentGenreFilter;
    const allMatched = this.state.matchedRestaurants;
    
    const filtered = genre === 'all' 
      ? allMatched 
      : allMatched.filter(r => r.genre === genre);

    // 상위 최대 30개 맛집만 지도와 리스트에 노출 (지도가 너무 혼잡해지는 것 방지)
    const displayList = filtered.slice(0, 30);

    // 카드 리스트 렌더링
    const listContainer = document.getElementById('restaurants-list');
    if (listContainer) {
      listContainer.innerHTML = '';
      
      if (displayList.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-list" style="
            text-align: center;
            padding: 40px 24px;
            color: #93979f;
            font-family: 'Geist', sans-serif;
          ">
            선택하신 장르의 매칭된 맛집이 없습니다. 다른 필터를 선택해 주세요.
          </div>
        `;
      } else {
        displayList.forEach(rst => {
          const card = this.createRestaurantCardElement(rst);
          listContainer.appendChild(card);
        });
      }
    }

    // 지도 마커 그리기
    window.MapModule.renderRestaurants(displayList, (id) => {
      this.highlightCardInList(id, false); // 지도 마커 클릭 시 리스트 카드 하이라이트
    });
  },

  // 12. 맛집 카드 DOM 생성 (Geniestudio 32px 곡률 모방 및 1px Stone 테두리)
  createRestaurantCardElement: function(rst) {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.dataset.id = rst.id;
    
    // 장르 한글명 매핑
    const genreKo = {
      Korean: '한식',
      Japanese: '일식',
      Chinese: '중식',
      Western: '양식',
      Cafe: '카페·디저트',
      Seafood: '해산물'
    }[rst.genre] || '기타';

    // 카드 내부 렌더링
    card.innerHTML = `
      <div class="card-image-box">
        <img src="${rst.image}" alt="${rst.name}" loading="lazy" />
        <span class="card-match-badge">${rst.matchScore}% 매칭</span>
      </div>
      <div class="card-content-box">
        <div class="card-header-row">
          <span class="card-genre-tag genre-${rst.genre.toLowerCase()}">${genreKo}</span>
          <span class="card-gugun-text">${rst.gugun}</span>
        </div>
        <h3 class="card-title">${rst.name}</h3>
        <p class="card-menu-text">🍴 ${rst.menu}</p>
        <p class="card-address-text">📍 ${rst.address}</p>
        <p class="card-time-text">🕒 ${rst.hours}</p>
        
        <!-- 매칭 사유 말풍선 -->
        <div class="card-reason-box">
          <span class="reason-icon">💡</span>
          <span class="reason-text">${rst.matchReason}</span>
        </div>
      </div>
    `;

    // 카드 클릭 시 이벤트: 카드 하이라이팅 및 지도의 마커 포커스
    card.addEventListener('click', () => {
      this.highlightCardInList(rst.id, true);
    });

    return card;
  },

  // 13. 리스트 카드 하이라이팅 처리
  highlightCardInList: function(id, focusMap) {
    this.state.selectedRestaurantId = id;
    
    // 기존 하이라이트 지우기
    const cards = document.querySelectorAll('.restaurant-card');
    cards.forEach(card => {
      card.classList.remove('selected');
    });

    // 선택된 카드 찾아서 표시
    const selectedCard = document.querySelector(`.restaurant-card[data-id="${id}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
      // 리스트 스크롤 안으로 엘리먼트 가져오기
      selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 지도 상에서 마커 팝업 열기
    if (focusMap && window.MapModule) {
      window.MapModule.focusMarker(id);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.AppController = AppController;
  AppController.init();
});
