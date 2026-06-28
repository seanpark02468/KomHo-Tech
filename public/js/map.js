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
      svgIcon = `<span style="font-size: 18px; line-height: 1;">🍞</span>`;
    } else if (genre === 'Seafood') {
      color = '#4fbeff'; // Cornflower (하늘색)
      svgIcon = `<span style="font-size: 18px; line-height: 1;">🦞</span>`;
    } else if (genre === 'Japanese') {
      color = '#0099ff'; // Signal Blue (파랑)
      svgIcon = `<span style="font-size: 18px; line-height: 1;">🍣</span>`; 
    } else if (genre === 'Chinese') {
      color = '#bb9915'; // Mustard (노랑)
      svgIcon = `<span style="font-size: 18px; line-height: 1;">🥟</span>`; 
    } else if (genre === 'Western') {
      color = '#f26110'; // Tangerine (오렌지)
      svgIcon = `<span style="font-size: 18px; line-height: 1;">🍝</span>`; 
    } else {
      // Korean (한식)
      color = '#f26110'; // Tangerine (오렌지)
      svgIcon = `<span style="font-size: 18px; line-height: 1;">🥘</span>`; 
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

      // 음식점 상세 설명(desc)에서 첫 문장 추출하여 한 줄 소개 생성
      let oneLineDesc = rst.desc ? rst.desc.split('.')[0].replace(/\n/g, ' ').trim() : '';
      if (oneLineDesc.length > 55) {
        oneLineDesc = oneLineDesc.substring(0, 55) + '...';
      } else if (oneLineDesc && !oneLineDesc.endsWith('.')) {
        oneLineDesc += '.';
      }
      if (!oneLineDesc) {
        oneLineDesc = "부산의 대표적인 맛집입니다.";
      }

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
            💡 ${oneLineDesc}
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
