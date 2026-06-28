// Leaflet.js 지도 제어 및 커스텀 마커 관리 모듈
const MapModule = {
  map: null,
  markersGroup: null,
  markersMap: {}, // 식당 ID별 마커 객체 보관

  // 1. 지도 초기화
  initMap: function(elementId) {
    if (this.map) {
      this.map.remove();
    }
    
    // 부산 중심 위치 (서면/부산시청 인근)
    const busanCenter = [35.1797865, 129.0750194];
    
    this.map = L.map(elementId, {
      zoomControl: false // 커스텀 디자인을 위해 기본 줌 컨트롤 숨김
    }).setView(busanCenter, 12);
    
    // OpenStreetMap 타일 레이어 로드 (미려하고 밝은 지도 스타일 적용)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    // 줌 컨트롤 우측 하단 배치
    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);
    
    this.markersGroup = L.layerGroup().addTo(this.map);
    this.markersMap = {};

    // 뷰 전환 완료 후 올바른 픽셀 높이를 반영할 수 있도록 리사이즈 트리거
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  },

  // 2. 장르별 커스텀 SVG 마커 생성 (Geniestudio 색상 적용)
  getGenreMarkerIcon: function(genre, matchScore) {
    // Geniestudio 일러스트 악센트 컬러 매핑
    let color = '#f26110'; // Tangerine (한식/양식 기본)
    let svgIcon = '';

    if (genre === 'Cafe') {
      color = '#9552e0'; // Amethyst (보라)
      svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>`;
    } else if (genre === 'Seafood') {
      color = '#4fbeff'; // Cornflower (하늘색)
      svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M2 12c.5-2 1.5-3.5 3-4 1.5-.5 3 .5 4.5 1.5 1.5 1 3.5 1 5-1.5s2.5-4 4.5-4.5 3.5 2 3.5 4.5c0 3.5-3 5-6 6s-7.5-.5-9.5-2c-2-1.5-3.5-2.5-5-.5Z"></path><path d="M16 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"></path></svg>`;
    } else if (genre === 'Japanese') {
      color = '#0099ff'; // Signal Blue (파랑)
      svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>`; // Sushi/Global
    } else if (genre === 'Chinese') {
      color = '#bb9915'; // Mustard (노랑)
      svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M12 2L2 22h20L12 2z"></path><circle cx="12" cy="13" r="3"></circle></svg>`; // Bowl/Chopstick mock
    } else if (genre === 'Western') {
      color = '#f26110'; // Tangerine (오렌지)
      svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`; // Western dollar/premium sign or similar
    } else {
      // Korean (한식)
      color = '#f26110'; // Tangerine (오렌지)
      svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 6v12M6 12h12"></path></svg>`; // Cook/Dish
    }

    // 커스텀 SVG 마커 디자인 (32px 모서리와 Stone hairline 외곽선)
    const html = `
      <div class="custom-marker-wrapper" style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div class="marker-pin" style="
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: ${color};
          border: 2px solid #0a0d12;
          box-shadow: 0px 4px 6px rgba(4, 69, 144, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform 0.2s ease;
        ">
          ${svgIcon}
          <!-- 매칭 스코어 미니 배지 -->
          <div class="marker-badge" style="
            position: absolute;
            top: -8px;
            right: -8px;
            background: #181d27;
            color: #ffffff;
            font-size: 9px;
            font-weight: 600;
            padding: 2px 4px;
            border-radius: 9999px;
            border: 1px solid #ebf5ff;
            white-space: nowrap;
          ">${matchScore}%</div>
        </div>
        <div class="marker-tail" style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #0a0d12;
          margin-top: -1px;
        "></div>
      </div>
    `;

    return L.divIcon({
      html: html,
      className: 'custom-leaflet-icon',
      iconSize: [40, 48],
      iconAnchor: [20, 46]
    });
  },

  // 3. 맛집 마커들 지도에 그리기
  renderRestaurants: function(restaurants, onCardClick) {
    // 기존 마커 전체 삭제
    this.markersGroup.clearLayers();
    this.markersMap = {};

    if (restaurants.length === 0) return;

    const bounds = [];

    restaurants.forEach(rst => {
      const icon = this.getGenreMarkerIcon(rst.genre, rst.matchScore);
      const marker = L.marker([rst.lat, rst.lng], { icon: icon });

      // 팝업 디자인 정의 (Geniestudio 카드 레이아웃 모방)
      const popupContent = `
        <div class="map-popup-card" style="
          font-family: 'Geist', sans-serif;
          padding: 8px;
          max-width: 220px;
        ">
          <div style="font-size: 11px; font-weight: 600; color: #f26110; margin-bottom: 2px;">
            ${rst.matchScore}% 매칭 맛집
          </div>
          <h4 style="font-size: 14px; font-weight: 600; color: #0a0d12; margin: 0 0 6px 0;">
            ${rst.name}
          </h4>
          <p style="font-size: 11px; color: #535862; margin: 0 0 8px 0; line-height: 1.4;">
            ${rst.address}
          </p>
          <div style="
            font-size: 10px;
            background: #ebf5ff;
            color: #0069e0;
            padding: 4px 6px;
            border-radius: 8px;
            font-weight: 500;
            line-height: 1.35;
          ">
            💡 ${rst.matchReason}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        offset: L.point(0, -32)
      });

      // 마커 클릭 시 해당 식당의 리스트 카드 하이라이트 및 지도 포커스
      marker.on('click', () => {
        marker.openPopup();
        if (onCardClick) {
          onCardClick(rst.id);
        }
      });

      marker.addTo(this.markersGroup);
      this.markersMap[rst.id] = marker;
      bounds.push([rst.lat, rst.lng]);
    });

    // 모든 마커가 보이도록 지도 뷰 조정
    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  },

  // 4. 특정 식당 마커 포커스 및 팝업 열기
  focusMarker: function(id) {
    const marker = this.markersMap[id];
    if (marker) {
      const coords = marker.getLatLng();
      
      // 부드러운 위치 이동
      this.map.setView(coords, 15, {
        animate: true,
        duration: 0.5
      });
      
      // 약간의 딜레이 후 팝업 열기
      setTimeout(() => {
        marker.openPopup();
      }, 300);
    }
  }
};

window.MapModule = MapModule;
