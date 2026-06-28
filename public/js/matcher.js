// 사용자 MBTI 성향과 맛집 데이터 매칭 엔진
const MatchEngine = {
  // 1. 매칭 점수 계산 (0 ~ 100%)
  calculateMatchScore: function(userWeights, restaurantScores) {
    let totalScore = 0;
    
    // 축별 점수: 사용자 가중치 * 맛집 속성값
    const scoreEI = (userWeights.E_I || 0) * (restaurantScores.E_I || 0);
    const scoreNS = (userWeights.N_S || 0) * (restaurantScores.N_S || 0);
    const scoreFT = (userWeights.F_T || 0) * (restaurantScores.F_T || 0);
    
    totalScore = scoreEI + scoreNS + scoreFT;
    
    // 최종 매칭률(%): (총점 + 3) / 6 * 100 (0% ~ 100% 범위로 변환)
    const matchPercentage = Math.round(((totalScore + 3) / 6) * 100);
    
    return {
      percentage: Math.min(100, Math.max(0, matchPercentage)),
      contributions: {
        E_I: scoreEI,
        N_S: scoreNS,
        F_T: scoreFT
      }
    };
  },

  // 2. 동적 매칭 사유 생성기 (다국어 지원)
  generateReason: function(userWeights, contributions, lang = 'ko') {
    let maxAxis = '';
    let maxVal = -Infinity;
    
    for (const [axis, val] of Object.entries(contributions)) {
      if (val > maxVal) {
        maxVal = val;
        maxAxis = axis;
      }
    }
    
    let trait = '';
    if (maxAxis === 'E_I') trait = userWeights.E_I > 0 ? 'E' : 'I';
    else if (maxAxis === 'N_S') trait = userWeights.N_S > 0 ? 'N' : 'S';
    else if (maxAxis === 'F_T') trait = userWeights.F_T > 0 ? 'F' : 'T';
    
    const TEMPLATES = {
      E: {
        ko: "활기찬 에너지가 넘치는 당신께 - 소통하기 좋은 핫플",
        en: "For you with vibrant energy - a hot spot great for mingling"
      },
      I: {
        ko: "조용하고 아늑한 곳을 찾는 당신께 - 차분히 쉬어갈 수 있는 숨은 맛집",
        en: "For you seeking cozy places - a hidden gem where you can relax calmly"
      },
      N: {
        ko: "새로운 걸 즐기는 당신께 - 여기서만 맛볼 수 있는 시그니처 메뉴",
        en: "For you who enjoys new things - unique signature menus you can only taste here"
      },
      S: {
        ko: "익숙한 맛의 깊이를 아는 당신께 - 정통 로컬의 깊은 손맛을 느끼게 해주는 곳",
        en: "For you who knows familiar tastes - a heritage spot with deep traditional flavors"
      },
      F: {
        ko: "감성을 아는 당신께 - 작품 같은 공간의 한 끼",
        en: "For you who appreciates aesthetics - a picturesque meal"
      },
      T: {
        ko: "합리적 가치를 중시하는 당신께 - 실속 있는 한 끼",
        en: "For you who values rationality - a practical meal"
      }
    };
    
    if (trait && TEMPLATES[trait] && maxVal > 0) {
      return TEMPLATES[trait][lang];
    }
    
    // 만약 양수 기여도가 없다면 (전부 음수이거나 0)
    return lang === 'ko' ? "부산 특유의 정취와 맛을 만끽할 수 있는 식당입니다." : "A restaurant where you can fully enjoy Busan's unique atmosphere and taste.";
  },

  // 3. 맛집 데이터 전체 매칭 및 정렬 (다국어 지원)
  matchAndSort: function(userMbtiObj, restaurants, lang = 'ko') {
    // 사용자 가중치 변환
    const userWeights = { E_I: 0, N_S: 0, F_T: 0 };
    
    if (userMbtiObj.scores.E === 3) userWeights.E_I = 1.0;
    else if (userMbtiObj.scores.E === 2) userWeights.E_I = 0.5;
    else if (userMbtiObj.scores.I === 3) userWeights.E_I = -1.0;
    else if (userMbtiObj.scores.I === 2) userWeights.E_I = -0.5;
    
    if (userMbtiObj.scores.N === 3) userWeights.N_S = 1.0;
    else if (userMbtiObj.scores.N === 2) userWeights.N_S = 0.5;
    else if (userMbtiObj.scores.S === 3) userWeights.N_S = -1.0;
    else if (userMbtiObj.scores.S === 2) userWeights.N_S = -0.5;
    
    if (userMbtiObj.scores.F === 3) userWeights.F_T = 1.0;
    else if (userMbtiObj.scores.F === 2) userWeights.F_T = 0.5;
    else if (userMbtiObj.scores.T === 3) userWeights.F_T = -1.0;
    else if (userMbtiObj.scores.T === 2) userWeights.F_T = -0.5;

    const matchedList = restaurants.map(rst => {
      const { percentage, contributions } = this.calculateMatchScore(userWeights, rst.mbti_scores);
      const reason = this.generateReason(userWeights, contributions, lang);
      return {
        ...rst,
        matchScore: percentage,
        matchReason: reason
      };
    });

    matchedList.sort((a, b) => b.matchScore - a.matchScore);
    
    // P 성향 다양성 정렬 로직
    const isP3 = userMbtiObj.scores.P === 3;
    const isP2 = userMbtiObj.scores.P === 2;
    
    if (isP3 || isP2) {
      const diverseList = [];
      const genreCounts = {};
      const maxPerGenre = isP3 ? 2 : 3; 
      
      const remaining = [...matchedList];
      
      while (remaining.length > 0) {
        // 장르 카운트가 maxPerGenre 미만이면서 가장 매칭 점수가 높은 항목을 찾음
        const index = remaining.findIndex(r => (genreCounts[r.genre] || 0) < maxPerGenre);
        if (index !== -1) {
          const rst = remaining.splice(index, 1)[0];
          diverseList.push(rst);
          genreCounts[rst.genre] = (genreCounts[rst.genre] || 0) + 1;
        } else {
          // 모든 장르가 maxPerGenre를 채웠다면 남은 것들을 그냥 넣음
          diverseList.push(...remaining);
          break;
        }
      }
      return diverseList;
    }
    
    return matchedList;
  }
};

window.MatchEngine = MatchEngine;
