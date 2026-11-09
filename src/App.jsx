import { useState, useEffect, useCallback } from 'react'
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
  getWeatherInfo,
  getAirQualityStatus,
} from './api/weather'
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Thermometer,
  Droplets,
  Wind,
  RefreshCw,
  AlertCircle,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'
import './App.css'

// 날씨 상태에 매핑되는 Lucide 아이콘 모음
const WEATHER_ICONS = {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
}

// 동적 아이콘 컴포넌트
function DynamicWeatherIcon({ name, size = 56, color = 'currentColor' }) {
  const IconComponent = WEATHER_ICONS[name] || Cloud
  return <IconComponent size={size} color={color} className="weather-icon-svg" />
}

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airData, setAirData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // 날씨 및 미세먼지 데이터 불러오기 (HTTPS 병렬 호출)
  const loadDashboardData = useCallback(async (city) => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const [weatherRes, airRes] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon),
      ])

      setWeatherData(weatherRes)
      setAirData(airRes)
      setLastUpdated(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    } catch (err) {
      console.error('대시보드 데이터 조회 실패:', err)
      setErrorMessage(err.message || '날씨 데이터를 불러오는데 실패했습니다. 네트워크 상태를 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 도시 선택 변경 시 데이터 갱신 (경쟁 상태 방지)
  useEffect(() => {
    let ignore = false

    async function fetchData() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const [weatherRes, airRes] = await Promise.all([
          fetchWeatherData(selectedCity.lat, selectedCity.lon),
          fetchAirQualityData(selectedCity.lat, selectedCity.lon),
        ])

        if (!ignore) {
          setWeatherData(weatherRes)
          setAirData(airRes)
          setLastUpdated(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
        }
      } catch (err) {
        if (!ignore) {
          console.error('대시보드 데이터 조회 실패:', err)
          setErrorMessage(err.message || '날씨 데이터를 불러오는데 실패했습니다. 네트워크 상태를 확인해주세요.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [selectedCity])

  // 현재 날씨 및 미세먼지 파싱
  const currentWeather = weatherData?.current
  const currentAir = airData?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const airStatus = currentAir ? getAirQualityStatus(currentAir.pm10, currentAir.pm2_5) : null

  return (
    <div className="weather-dashboard">
      {/* 1. 상단 헤더 섹션 */}
      <header className="dashboard-header">
        <div className="header-title-wrap">
          <div className="badge-pill">
            <Sparkles size={14} className="sparkle-icon" /> 실시간 기상 관측
          </div>
          <h1>실시간 날씨 · 미세먼지 대시보드</h1>
          <p className="header-subtitle">Open-Meteo 공개 HTTPS API 기반 실시간 관측 현황</p>
        </div>

        <div className="header-meta">
          {lastUpdated && (
            <span className="last-updated">
              <Clock size={14} /> 마지막 업데이트: {lastUpdated}
            </span>
          )}
          <button
            type="button"
            className="refresh-button"
            onClick={() => loadDashboardData(selectedCity)}
            disabled={isLoading}
            title="데이터 새로고침"
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            새로고침
          </button>
        </div>
      </header>

      {/* 2. 주요 도시 빠른 선택 버튼 바 */}
      <nav className="city-selector-section" aria-label="주요 도시 선택">
        <div className="city-buttons-wrapper">
          {DEFAULT_CITIES.map((city) => {
            const isSelected = selectedCity.name === city.name
            return (
              <button
                key={city.name}
                type="button"
                className={`city-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                <MapPin size={15} />
                {city.name}
              </button>
            )
          })}
        </div>
      </nav>

      {/* 3. 메인 콘텐츠 영역 (로딩 / 에러 / 데이터 카드) */}
      <main className="dashboard-content">
        {isLoading && (
          <div className="state-card loading-card">
            <RefreshCw size={36} className="spinning text-primary" />
            <h3>{selectedCity.name} 기상 정보를 불러오는 중...</h3>
            <p>Open-Meteo HTTPS API와 안전하게 통신하고 있습니다.</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="state-card error-card">
            <AlertCircle size={40} className="text-danger" />
            <h3>기상 데이터를 가져올 수 없습니다</h3>
            <p className="error-text">{errorMessage}</p>
            <button
              type="button"
              className="retry-button"
              onClick={() => loadDashboardData(selectedCity)}
            >
              다시 시도
            </button>
          </div>
        )}

        {!isLoading && !errorMessage && currentWeather && currentAir && (
          <div className="cards-grid">
            {/* 현재 날씨 카드 */}
            <section className="card weather-card">
              <div className="card-header">
                <div>
                  <span className="card-tag">현재 날씨</span>
                  <h2 className="city-name">{selectedCity.name}</h2>
                </div>
                <div
                  className="weather-badge"
                  style={{ backgroundColor: `${weatherInfo.color}20`, color: weatherInfo.color }}
                >
                  <DynamicWeatherIcon name={weatherInfo.icon} size={20} color={weatherInfo.color} />
                  <span>{weatherInfo.label}</span>
                </div>
              </div>

              <div className="weather-main">
                <div className="temperature-group">
                  <span className="current-temp">
                    {Math.round(currentWeather.temperature_2m)}
                    <span className="unit">°C</span>
                  </span>
                  <p className="apparent-temp">
                    체감온도 <strong>{Math.round(currentWeather.apparent_temperature)}°C</strong>
                  </p>
                </div>
                <div className="weather-icon-large">
                  <DynamicWeatherIcon name={weatherInfo.icon} size={84} color={weatherInfo.color} />
                </div>
              </div>

              {/* 상세 기상 지표 */}
              <div className="metrics-row">
                <div className="metric-item">
                  <div className="metric-icon humidity">
                    <Droplets size={18} />
                  </div>
                  <div>
                    <span className="metric-label">상대 습도</span>
                    <span className="metric-value">{currentWeather.relative_humidity_2m}%</span>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-icon wind">
                    <Wind size={18} />
                  </div>
                  <div>
                    <span className="metric-label">풍속</span>
                    <span className="metric-value">{currentWeather.wind_speed_10m} km/h</span>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-icon thermometer">
                    <Thermometer size={18} />
                  </div>
                  <div>
                    <span className="metric-label">강수량</span>
                    <span className="metric-value">{currentWeather.precipitation || 0} mm</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 미세먼지 카드 */}
            <section className="card air-card">
              <div className="card-header">
                <div>
                  <span className="card-tag">대기질 지수</span>
                  <h2 className="city-name">미세먼지 정보</h2>
                </div>
                <div
                  className="air-status-badge"
                  style={{ backgroundColor: airStatus.badgeColor }}
                >
                  {airStatus.status === '좋음' || airStatus.status === '보통' ? (
                    <ShieldCheck size={18} />
                  ) : (
                    <ShieldAlert size={18} />
                  )}
                  <span>{airStatus.status}</span>
                </div>
              </div>

              {/* 미세먼지 & 초미세먼지 세부 수치 */}
              <div className="air-metrics-grid">
                <div className="air-metric-box">
                  <div className="air-box-header">
                    <span className="air-name">미세먼지 (PM10)</span>
                    <span className="air-grade" style={{ color: airStatus.badgeColor }}>
                      {currentAir.pm10 <= 30 ? '좋음' : currentAir.pm10 <= 80 ? '보통' : currentAir.pm10 <= 150 ? '나쁨' : '매우 나쁨'}
                    </span>
                  </div>
                  <div className="air-box-value">
                    <span className="value-number">{Math.round(currentAir.pm10)}</span>
                    <span className="value-unit">μg/m³</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, (currentAir.pm10 / 150) * 100)}%`,
                        backgroundColor: airStatus.badgeColor,
                      }}
                    />
                  </div>
                  <span className="air-guide">환경부 기준: 보통 (31~80)</span>
                </div>

                <div className="air-metric-box">
                  <div className="air-box-header">
                    <span className="air-name">초미세먼지 (PM2.5)</span>
                    <span className="air-grade" style={{ color: airStatus.badgeColor }}>
                      {currentAir.pm2_5 <= 15 ? '좋음' : currentAir.pm2_5 <= 35 ? '보통' : currentAir.pm2_5 <= 75 ? '나쁨' : '매우 나쁨'}
                    </span>
                  </div>
                  <div className="air-box-value">
                    <span className="value-number">{Math.round(currentAir.pm2_5)}</span>
                    <span className="value-unit">μg/m³</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, (currentAir.pm2_5 / 75) * 100)}%`,
                        backgroundColor: airStatus.badgeColor,
                      }}
                    />
                  </div>
                  <span className="air-guide">환경부 기준: 보통 (16~35)</span>
                </div>
              </div>

              {/* 활동 권장 팁 */}
              <div className="air-action-tip">
                {airStatus.status === '좋음' && '💡 공기가 깨끗합니다. 환기와 야외 활동을 즐기기 아주 좋은 날이에요!'}
                {airStatus.status === '보통' && '💡 대기질이 무난합니다. 일상적인 야외 활동에 지장이 없습니다.'}
                {airStatus.status === '나쁨' && '⚠️ 미세먼지 농도가 높습니다. 장시간 외출 시 마스크(KF80 이상)를 착용하세요.'}
                {airStatus.status === '매우 나쁨' && '🚨 미세먼지 경보! 무리한 야외 활동을 피하고 창문을 닫아주세요.'}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* 4. 사이버보안 체크포인트 배너 */}
      <footer className="dashboard-footer">
        <div className="security-notice">
          <strong>🛡️ 보안 아키텍처 체크:</strong> Open-Meteo는 API 키가 없는 공개 API로 HTTPS 통신을 사용합니다. UI 컴포넌트와 API 통신 로직(<code>src/api/weather.js</code>)을 분리하여 유지보수성과 보안성을 높였습니다.
        </div>
      </footer>
    </div>
  )
}

export default App
