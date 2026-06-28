// MBTI 기반 부산 맛집 추천 서비스 SPA 컨트롤러 (다국어 지원)
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
    selectedRestaurantId: null,
    lang: localStorage.getItem('foodie-genie-lang') || 'ko' // 기본값 한국어
  },

  // 2. 앱 초기화
  init: async function() {
    this.bindEvents();
    
    // 초기화 시점 언어 적용
    this.changeLanguage(this.state.lang);

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

    // 상단 로고 버튼 (클릭 시 랜딩페이지 복귀)
    const logoBtn = document.getElementById('nav-logo-btn');
    if (logoBtn) {
      logoBtn.addEventListener('click', () => {
        this.switchView('intro');
      });
    }

    // 퀴즈 이전(Back) 버튼 바인딩
    const backBtn = document.getElementById('quiz-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.goBackQuestion());
    }

    // 언어 선택 버튼 바인딩
    const koBtn = document.getElementById('lang-ko-btn');
    const enBtn = document.getElementById('lang-en-btn');
    
    if (koBtn && enBtn) {
      koBtn.addEventListener('click', () => this.changeLanguage('ko'));
      enBtn.addEventListener('click', () => this.changeLanguage('en'));
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

  // 3-1. 언어 변경 처리
  changeLanguage: function(lang) {
    this.state.lang = lang;
    localStorage.setItem('foodie-genie-lang', lang);

    // 언어 선택 토글 버튼 활성화 스타일 제어
    const koBtn = document.getElementById('lang-ko-btn');
    const enBtn = document.getElementById('lang-en-btn');
    if (koBtn && enBtn) {
      if (lang === 'ko') {
        koBtn.classList.add('active');
        enBtn.classList.remove('active');
      } else {
        enBtn.classList.add('active');
        koBtn.classList.remove('active');
      }
    }

    // UI 사전 번역 반영
    window.I18nEngine.translateUI(lang);

    // 현재 열려있는 화면 동기화
    if (this.state.currentView === 'quiz') {
      this.renderQuestion();
    } else if (this.state.currentView === 'result' && this.state.mbtiResult) {
      // 매칭 맛집 한영 스코어 사유 리빌드
      this.state.matchedRestaurants = window.MatchEngine.matchAndSort(
        this.state.mbtiResult,
        this.state.restaurants,
        this.state.lang
      );
      this.renderResult();
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

  // 6. 질문 렌더링 (다국어 대응)
  renderQuestion: function() {
    const questions = window.QuizEngine.questions;
    const index = this.state.currentQuestionIndex;
    const q = questions[index];
    const lang = this.state.lang;

    // 프로그레스 바 업데이트
    const progressFill = document.getElementById('quiz-progress-fill');
    const progressText = document.getElementById('quiz-progress-text');
    const percent = Math.round(((index + 1) / questions.length) * 100);
    
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.innerText = `${index + 1} / ${questions.length}`;

    // 질문 텍스트
    const questionText = document.getElementById('question-text');
    if (questionText) {
      questionText.style.opacity = '0';
      questionText.style.transform = 'translateY(10px)';
      setTimeout(() => {
        questionText.innerText = q.question[lang];
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
        button.innerHTML = `<span class="answer-text">${ans.text[lang]}</span>`;
        
        button.addEventListener('click', () => {
          button.classList.add('selected');
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
      this.switchView('loading');
      setTimeout(() => {
        this.processResults();
      }, 1500);
    }
  },

  // 7-1. 이전 질문으로 돌아가기 (Back)
  goBackQuestion: function() {
    if (this.state.currentQuestionIndex > 0) {
      this.state.currentQuestionIndex--;
      this.state.quizAnswers.pop();
      this.renderQuestion();
    } else {
      // 1/12 단계에서 이전을 누르면 인트로 페이지로 가며 세션 초기화
      this.state.quizAnswers = [];
      this.switchView('intro');
    }
  },

  // 8. 퀴즈 결과 계산 및 맛집 매칭 (다국어 넘김)
  processResults: function() {
    const rawResult = window.QuizEngine.calculateMBTI(this.state.quizAnswers);
    this.state.mbtiResult = rawResult;
    
    // 맛집 정렬 수행 (코사인 유사도 기반 매칭 점수 계산 및 다국어 매칭사유 생성)
    this.state.matchedRestaurants = window.MatchEngine.matchAndSort(
      this.state.mbtiResult,
      this.state.restaurants,
      this.state.lang
    );

    this.switchView('result');
    this.renderResult();
  },

  // 9. 결과 화면 렌더링 (다국어 적용)
  renderResult: function() {
    const { mbti } = this.state.mbtiResult;
    const profile = window.I18nEngine.mbtiProfiles[mbti][this.state.lang];

    // MBTI 및 타이틀 표시
    const mbtiBadge = document.getElementById('user-mbti-type');
    const mbtiTitle = document.getElementById('user-mbti-title');
    const mbtiDesc = document.getElementById('user-mbti-desc');

    if (mbtiBadge) mbtiBadge.innerText = mbti;
    if (mbtiTitle) mbtiTitle.innerText = profile.title;
    if (mbtiDesc) mbtiDesc.innerText = profile.desc;

    // 지도 모듈 구동
    window.MapModule.initMap('map-container');
    
    // 장르 필터 상태 복구 (내부적으로 applyFilteringAndRendering이 호출됨)
    this.setFilter(this.state.currentGenreFilter || 'all');
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
    const lang = this.state.lang;
    
    // 사용자가 '전체' 탭에서 다른 모든 카테고리의 음식점들이 보이길 원하므로,
    // 전체 탭일 때의 엄격한 개수 제한을 해제하고 충분히 많은 개수를 보여줍니다.
    let limit = 50; 
    
    let filtered = genre === 'all' 
      ? allMatched 
      : allMatched.filter(r => r.genre === genre);

    // 필터링된 결과에서 limit만큼 잘라서 보여줌
    const displayList = filtered.slice(0, limit);

    // 카드 리스트 렌더링
    const listContainer = document.getElementById('restaurants-list');
    if (listContainer) {
      listContainer.innerHTML = '';
      
      if (displayList.length === 0) {
        const emptyMsg = {
          ko: '선택하신 장르의 매칭된 맛집이 없습니다. 다른 필터를 선택해 주세요.',
          en: 'No matching restaurants found in this category. Try another filter.'
        }[lang];
        listContainer.innerHTML = `
          <div class="empty-list" style="
            text-align: center;
            padding: 40px 24px;
            color: #93979f;
            font-family: 'Geist', sans-serif;
          ">
            ${emptyMsg}
          </div>
        `;
      } else {
        displayList.forEach(rst => {
          const card = this.createRestaurantCardElement(rst);
          listContainer.appendChild(card);
        });
      }
    }

    // 지도 마커 그리기 (다국어로 가공된 displayList 전달)
    window.MapModule.renderRestaurants(displayList, (id) => {
      this.highlightCardInList(id, false);
    });
  },

  // 12. 맛집 카드 DOM 생성 (다국어 번역 레이블 반영)
  createRestaurantCardElement: function(rst) {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.dataset.id = rst.id;
    const lang = this.state.lang;
    
    // 장르 다국어 매핑
    const genreName = {
      ko: { Korean: '한식', Japanese: '일식', Chinese: '중식', Western: '양식', Cafe: '카페·디저트', Seafood: '해산물' },
      en: { Korean: 'Korean', Japanese: 'Japanese', Chinese: 'Chinese', Western: 'Western', Cafe: 'Cafe/Dessert', Seafood: 'Seafood' }
    }[lang][rst.genre] || rst.genre;

    // 번역 레이블 사전
    const labels = {
      ko: { menu: '🍴 대표메뉴', address: '📍 주소', hours: '🕒 영업시간', match: '매칭' },
      en: { menu: '🍴 Menu', address: '📍 Address', hours: '🕒 Hours', match: 'Match' }
    }[lang];

    // 네이버 검색 URL 생성 (부산 + 구군 + 상호명)
    const naverSearchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent('부산 ' + rst.gugun + ' ' + rst.name)}`;

    // 카드 내부 렌더링
    card.innerHTML = `
      <div class="card-image-box">
        <img src="${rst.image}" alt="${rst.name}" loading="lazy" />
        <span class="card-match-badge">${rst.matchScore}% ${labels.match}</span>
      </div>
      <div class="card-content-box">
        <div class="card-header-row">
          <span class="card-genre-tag genre-${rst.genre.toLowerCase()}">${genreName}</span>
          <span class="card-gugun-text">${rst.gugun}</span>
        </div>
        <h3 class="card-title">
          <a href="${naverSearchUrl}" target="_blank" class="naver-search-link" onclick="event.stopPropagation()">
            ${rst.name} <i class="fas fa-external-link-alt" style="font-size: 11px; margin-left: 2px; color: var(--color-fog);"></i>
          </a>
        </h3>
        <p class="card-menu-text">${labels.menu}: ${rst.menu}</p>
        <p class="card-address-text">${labels.address}: ${rst.address}</p>
        <p class="card-time-text">${labels.hours}: ${rst.hours}</p>
        
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
