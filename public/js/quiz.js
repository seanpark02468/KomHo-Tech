// 12문항 MBTI 여행 성향 퀴즈 데이터셋 (다국어 지원)
const quizQuestions = [
  // 1. E vs I (외향 vs 내향)
  {
    id: 1,
    dimension: "EI",
    question: {
      ko: "부산에 도착하자마자 당신이 향하고 싶은 곳은?",
      en: "Where is the first place you want to head to as soon as you arrive in Busan?"
    },
    answers: [
      {
        text: {
          ko: "사람들이 북적이고 활기찬 해운대 해수욕장 광장",
          en: "The crowded and lively Haeundae Beach Square"
        },
        score: { E: 1, I: 0 }
      },
      {
        text: {
          ko: "조용하게 바다 소리를 들으며 사색할 수 있는 영도 해안산책로",
          en: "The quiet Yeongdo coastal trail where you can hear the waves and reflect"
        },
        score: { E: 0, I: 1 }
      }
    ]
  },
  {
    id: 2,
    dimension: "EI",
    question: {
      ko: "여행 중 식사를 할 식당을 고를 때 선호하는 분위기는?",
      en: "What kind of atmosphere do you prefer when choosing a restaurant during travel?"
    },
    answers: [
      {
        text: {
          ko: "왁자지껄하고 현지인들의 살아있는 에너지가 느껴지는 로컬 시장 맛집",
          en: "A lively local market eatery filled with the energy of locals"
        },
        score: { E: 1, I: 0 }
      },
      {
        text: {
          ko: "조용히 대화를 나누며 쉴 수 있는 차분하고 아늑한 골목길 식당",
          en: "A quiet, cozy alley restaurant where you can talk and relax"
        },
        score: { E: 0, I: 1 }
      }
    ]
  },
  {
    id: 3,
    dimension: "EI",
    question: {
      ko: "식사가 끝난 후, 가고 싶은 카페는 어떤 곳인가요?",
      en: "What type of cafe do you want to visit after your meal?"
    },
    answers: [
      {
        text: {
          ko: "루프탑에서 탁 트인 바다와 대교가 보이고 음악이 흐르는 핫플레이스 대형 카페",
          en: "A trendy rooftop cafe with a wide ocean/bridge view and music"
        },
        score: { E: 1, I: 0 }
      },
      {
        text: {
          ko: "한적한 주택가 모퉁이에 위치하여 차분하게 커피 맛에 집중할 수 있는 조용한 카페",
          en: "A quiet neighborhood cafe where you can calmly focus on the taste of coffee"
        },
        score: { E: 0, I: 1 }
      }
    ]
  },
  
  // 2. S vs N (감각/전통 vs 직관/이색)
  {
    id: 4,
    dimension: "SN",
    question: {
      ko: "맛집을 고를 때 가장 신뢰하는 정보는 무엇인가요?",
      en: "What information do you trust the most when choosing a restaurant?"
    },
    answers: [
      {
        text: {
          ko: "수십 년간 역사적으로 검증된 로컬 백년가게와 노포 후기",
          en: "Historical reviews of local heritage restaurants open for decades"
        },
        score: { S: 1, N: 0 }
      },
      {
        text: {
          ko: "요즘 SNS에서 뜨고 있는 독특한 비주얼의 퓨전 요리나 신선한 컨셉의 매장",
          en: "Unique fusion dishes or trendy, new concept stores popular on social media"
        },
        score: { S: 0, N: 1 }
      }
    ]
  },
  {
    id: 5,
    dimension: "SN",
    question: {
      ko: "메뉴판을 보고 주문을 결정할 때 당신의 스타일은?",
      en: "What is your style when deciding what to order from the menu?"
    },
    answers: [
      {
        text: {
          ko: "이 가게의 대표 시그니처 메뉴나 늘 먹던 정통 오리지널 메뉴 선택",
          en: "Choosing the signature dish or traditional original menu items"
        },
        score: { S: 1, N: 0 }
      },
      {
        text: {
          ko: "처음 보는 독특한 재료 조합이나 신메뉴, 퓨전 요리에 도전",
          en: "Trying new menu items, fusion dishes, or unique ingredient combinations"
        },
        score: { S: 0, N: 1 }
      }
    ]
  },
  {
    id: 6,
    dimension: "SN",
    question: {
      ko: "여행 기념품으로 살 음식을 고를 때 끌리는 것은?",
      en: "What kind of food souvenirs are you drawn to buy?"
    },
    answers: [
      {
        text: {
          ko: "부산의 역사와 정통성이 깃든 대물림 원조 삼진어묵 세트",
          en: "Traditional local specialty sets like historical Busan fishcakes"
        },
        score: { S: 1, N: 0 }
      },
      {
        text: {
          ko: "독특한 풍미와 현대적인 패키징이 돋보이는 로컬 수제 맥주와 드립백 세트",
          en: "Local craft beer or drip bag coffee sets with trendy modern packaging"
        },
        score: { S: 0, N: 1 }
      }
    ]
  },

  // 3. T vs F (사고/실속 vs 감정/분위기)
  {
    id: 7,
    dimension: "TF",
    question: {
      ko: "식당 리뷰를 볼 때 가장 유심히 보는 요소는?",
      en: "What factors do you look at most closely when reading restaurant reviews?"
    },
    answers: [
      {
        text: {
          ko: "음식의 정확한 양, 가격 대비 맛의 만족도, 위생 상태와 대기 시간",
          en: "Portion sizes, value for money, hygiene conditions, and wait times"
        },
        score: { T: 1, F: 0 }
      },
      {
        text: {
          ko: "오션뷰 창가 자리의 전망, 종업원의 친절함, 인테리어의 감성과 무드",
          en: "Scenic ocean views, friendly service, and aesthetic interior mood"
        },
        score: { T: 0, F: 1 }
      }
    ]
  },
  {
    id: 8,
    dimension: "TF",
    question: {
      ko: "주문한 음식이 테이블에 세팅되었을 때 먼저 드는 생각은?",
      en: "What is your first thought when the food is served?"
    },
    answers: [
      {
        text: {
          ko: "'이 가격에 이 구성과 퀄리티면 꽤 괜찮네' (가성비와 실효성 분석)",
          en: "'This portion and quality for this price is great' (value analysis)"
        },
        score: { T: 1, F: 0 }
      },
      {
        text: {
          ko: "'그릇도 예쁘고 바다 전망이랑 색감이 예술이다!' (카메라 켜고 감상 시작)",
          en: "'The plate is beautiful, and the ocean view matches it!' (takes photos)"
        },
        score: { T: 0, F: 1 }
      }
    ]
  },
  {
    id: 9,
    dimension: "TF",
    question: {
      ko: "식당 사장님이 친절하게 말을 걸어주며 서비스 음식을 주신다면?",
      en: "What is your reaction if the owner strikes up a friendly talk and gives you free food?"
    },
    answers: [
      {
        text: {
          ko: "'와 감사합니다!' 인사드리고 맛있게 식사를 이어간다",
          en: "Politely say 'Thank you!' and continue enjoying the meal"
        },
        score: { T: 1, F: 0 }
      },
      {
        text: {
          ko: "사장님의 따뜻한 마음에 깊이 감동하여 식사 후 정성스러운 후기를 쓰기로 결심한다",
          en: "Touched by their warmth and decide to write a heartfelt review after dining"
        },
        score: { T: 0, F: 1 }
      }
    ]
  },

  // 4. J vs P (계획/정돈 vs 인식/유연)
  {
    id: 10,
    dimension: "JP",
    question: {
      ko: "부산 미식 여행 일정을 짤 때 당신의 행동은?",
      en: "What is your approach when planning your Busan food trip itinerary?"
    },
    answers: [
      {
        text: {
          ko: "아침/점심/저녁 동선과 대기 시간, 웨이팅 마감 시 갈 플랜B 식당까지 꼼꼼히 정리",
          en: "Meticulously planning meals, transit, wait times, and backup plans"
        },
        score: { J: 1, P: 0 }
      },
      {
        text: {
          ko: "대표 맛집 몇 개만 골라두고, 당일 컨디션과 발길 닿는 동선에 맞춰 즉흥적으로 결정",
          en: "Listing a few places and choosing spontaneously based on how you feel"
        },
        score: { J: 0, P: 1 }
      }
    ]
  },
  {
    id: 11,
    dimension: "JP",
    question: {
      ko: "가려던 맛집이 갑자기 임시 휴업 중이거나 웨이팅이 너무 길 때?",
      en: "What do you do if your target restaurant is suddenly closed or has too long of a wait?"
    },
    answers: [
      {
        text: {
          ko: "당황하지만 미리 리스트업해 둔 인근 2순위 식당으로 빠르게 방향 전환",
          en: "Switching quickly to the backup restaurant you pre-listed nearby"
        },
        score: { J: 1, P: 0 }
      },
      {
        text: {
          ko: "오히려 새로운 탐험의 기회! 근처에 그냥 눈에 띄는 매장에 즉흥적으로 들어감",
          en: "A new adventure! Spontaneously stepping into any place that catches your eye"
        },
        score: { J: 0, P: 1 }
      }
    ]
  },
  {
    id: 12,
    dimension: "JP",
    question: {
      ko: "미리 예약금을 내고 시간 맞춰 찾아가야 하는 파인 다이닝 예약에 대해?",
      en: "How do you feel about fine dining reservations that require deposit and strict timing?"
    },
    answers: [
      {
        text: {
          ko: "일정이 보장되므로 안심되고 계획적인 미식을 위해 선호함",
          en: "I prefer it because it guarantees the schedule and supports structured dining"
        },
        score: { J: 1, P: 0 }
      },
      {
        text: {
          ko: "정해진 시간에 맞춰 움직여야 하는 것이 속박같이 느껴져 부담스러움",
          en: "I find it stressful because it restricts flexibility during travel"
        },
        score: { J: 0, P: 1 }
      }
    ]
  }
];

// 사용자의 답변 누적 점수를 바탕으로 최종 MBTI 유형 계산
function calculateMBTI(answers) {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  
  answers.forEach(ans => {
    Object.keys(ans.score).forEach(key => {
      scores[key] += ans.score[key];
    });
  });

  const mbti = [
    scores.E >= scores.I ? "E" : "I",
    scores.S >= scores.N ? "S" : "N",
    scores.T >= scores.F ? "T" : "F",
    scores.J >= scores.P ? "J" : "P"
  ].join("");

  return { mbti, scores };
}

window.QuizEngine = {
  questions: quizQuestions,
  calculateMBTI
};
