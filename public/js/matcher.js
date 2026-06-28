// 사용자 MBTI 성향과 맛집 데이터 매칭 엔진
const MatchEngine = {
  // 1. 매칭 점수 계산 (0 ~ 100%)
  // userScores: { E, I, S, N, T, F, J, P } (각 차원 합산 후 정규화된 값)
  // restaurantScores: { E, I, S, N, T, F, J, P }
  calculateMatchScore: function(userScores, restaurantScores) {
    let dotProduct = 0;
    let userNorm = 0;
    let rstNorm = 0;

    const dimensions = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];

    dimensions.forEach(dim => {
      const u = userScores[dim] || 0.5;
      const r = restaurantScores[dim] || 0.5;
      dotProduct += u * r;
      userNorm += u * u;
      rstNorm += r * r;
    });

    userNorm = Math.sqrt(userNorm);
    rstNorm = Math.sqrt(rstNorm);

    if (userNorm === 0 || rstNorm === 0) return 50;

    // 코사인 유사도를 계산하여 50% ~ 100% 범위로 스케일링
    const cosineSimilarity = dotProduct / (userNorm * rstNorm);
    const scorePercentage = Math.round((0.4 + cosineSimilarity * 0.6) * 100);
    return Math.min(100, Math.max(0, scorePercentage));
  },

  // 2. 동적 매칭 사유 생성기
  // 사용자의 MBTI 유형(예: "ENFP")과 맛집의 특징(mbti_scores)을 바탕으로 맞춤형 1줄 추천 이유를 생성합니다.
  generateReason: function(mbtiStr, rst) {
    const rScores = rst.mbti_scores;
    const reasons = [];

    // E vs I
    if (mbtiStr.includes('E') && rScores.E >= 0.6) {
      reasons.push("활기찬 에너지가 넘치고 소통하기 좋은 공간");
    } else if (mbtiStr.includes('I') && rScores.I >= 0.6) {
      reasons.push("아늑하고 조용하여 차분히 쉴 수 있는 골목 맛집");
    }

    // S vs N
    if (mbtiStr.includes('S') && rScores.S >= 0.6) {
      reasons.push("정통 로컬의 깊은 손맛을 느끼게 해주는 노포");
    } else if (mbtiStr.includes('N') && rScores.N >= 0.6) {
      reasons.push("이색적이고 독특한 감성으로 감각을 깨워줄 핫플");
    }

    // T vs F
    if (mbtiStr.includes('T') && rScores.T >= 0.6) {
      reasons.push("합리적인 가격과 푸짐한 양으로 실속 있는 한 끼");
    } else if (mbtiStr.includes('F') && rScores.F >= 0.6) {
      reasons.push("아름다운 전망과 로맨틱한 무드를 품은 감성 충전소");
    }

    // J vs P
    if (mbtiStr.includes('J') && rScores.J >= 0.6) {
      reasons.push("정갈하고 정돈된 상차림으로 계획적인 일정에 알맞은 곳");
    } else if (mbtiStr.includes('P') && rScores.P >= 0.6) {
      reasons.push("가볍고 편안하게 방문해 뜻밖의 행복을 즐기는 곳");
    }

    // 만약 특출난 성향 매칭이 없을 때의 기본값 설정
    if (reasons.length === 0) {
      if (rst.genre === 'Cafe') {
        return "여유롭게 바다를 만끽하며 향긋한 음료를 즐기기 좋은 카페입니다.";
      } else if (rst.genre === 'Seafood') {
        return "부산 바다의 싱싱함을 한 그릇에 담아낸 해산물 대표 명소입니다.";
      } else {
        return "부산 특유의 정취와 대표적인 전통 미식을 만끽할 수 있는 식당입니다.";
      }
    }

    // 가장 도드라지는 특징 2개를 엮어서 한 문장으로 완성
    if (reasons.length >= 2) {
      return `${reasons[0]}이며, ${reasons[1]}입니다.`;
    }
    
    return `${reasons[0]}입니다.`;
  },

  // 3. 맛집 데이터 전체 매칭 및 정렬
  // userMbtiObj: { mbti: "ENFP", scores: { E: 3, I: 0, S: 0, N: 3, ... } }
  // restaurants: restaurants.json 배열
  matchAndSort: function(userMbtiObj, restaurants) {
    // 퀴즈 결과 점수를 0~1 사이로 정규화
    const userScoresNormalized = {};
    const axes = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']];
    
    axes.forEach(([dim1, dim2]) => {
      const s1 = userMbtiObj.scores[dim1] || 0;
      const s2 = userMbtiObj.scores[dim2] || 0;
      const sum = s1 + s2;
      if (sum > 0) {
        userScoresNormalized[dim1] = s1 / sum;
        userScoresNormalized[dim2] = s2 / sum;
      } else {
        userScoresNormalized[dim1] = 0.5;
        userScoresNormalized[dim2] = 0.5;
      }
    });

    return restaurants.map(rst => {
      const matchScore = this.calculateMatchScore(userScoresNormalized, rst.mbti_scores);
      const reason = this.generateReason(userMbtiObj.mbti, rst);
      return {
        ...rst,
        matchScore,
        matchReason: reason
      };
    }).sort((a, b) => b.matchScore - a.matchScore); // 매칭 점수 내림차순 정렬
  }
};

window.MatchEngine = MatchEngine;
