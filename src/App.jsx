import { useState, useEffect, useCallback } from 'react'
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
  getWeatherInfo,
  getAirQualityStatus,
} from './api/weather'
import CitySearch from './components/CitySearch'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import {
  RefreshCw,
  AlertCircle,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react'
import './App.css'

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airData, setAirData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // 날씨 및 미세먼지 수동 새로고침
  const handleRefresh = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const [weatherRes, airRes] = await Promise.all([
        fetchWeatherData(selectedCity.lat, selectedCity.lon),
        fetchAirQualityData(selectedCity.lat, selectedCity.lon),
      ])

      setWeatherData(weatherRes)
      setAirData(airRes)
      setLastUpdated(
        new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    } catch (err) {
      console.error('대시보드 데이터 조회 실패:', err)
      setErrorMessage(
        err.message || '날씨 데이터를 불러오는데 실패했습니다. 네트워크 상태를 확인해주세요.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [selectedCity])

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
          setLastUpdated(
            new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          )
        }
      } catch (err) {
        if (!ignore) {
          console.error('대시보드 데이터 조회 실패:', err)
          setErrorMessage(
            err.message || '날씨 데이터를 불러오는데 실패했습니다. 네트워크 상태를 확인해주세요.'
          )
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

  // 데이터 파싱
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
            <Sparkles size={14} className="sparkle-icon" /> 실시간 기상 대시보드
          </div>
          <h1>실시간 날씨 · 미세먼지 관측소</h1>
          <p className="header-subtitle">Open-Meteo 전 세계 기상 API 연동 및 400ms 디바운스 검색</p>
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
            onClick={handleRefresh}
            disabled={isLoading}
            title="데이터 새로고침"
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            새로고침
          </button>
        </div>
      </header>

      {/* 2. 도시 검색창 (400ms 디바운스) */}
      <section className="search-section" aria-label="도시 검색">
        <CitySearch onSelectCity={(city) => setSelectedCity(city)} />
      </section>

      {/* 3. 주요 도시 빠른 선택 버튼 바 */}
      <nav className="city-selector-section" aria-label="주요 도시 빠른 선택">
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

      {/* 4. 메인 콘텐츠 영역 */}
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
              onClick={handleRefresh}
            >
              다시 시도
            </button>
          </div>
        )}

        {!isLoading && !errorMessage && currentWeather && currentAir && (
          <div className="dashboard-sections">
            {/* 상단 2열 그리드: 현재 날씨 & 미세먼지 카드 */}
            <div className="cards-grid">
              <CurrentWeather
                current={currentWeather}
                cityName={selectedCity.name}
                country={selectedCity.country}
                weatherInfo={weatherInfo}
              />
              <AirQualityCard
                currentAir={currentAir}
                airStatus={airStatus}
              />
            </div>

            {/* 중단: 24시간 시간별 기온 변화 SVG 차트 */}
            {weatherData?.hourly && (
              <HourlyChart hourly={weatherData.hourly} />
            )}

            {/* 하단: 향후 7일간 일별 주간 예보 */}
            {weatherData?.daily && (
              <WeeklyForecast daily={weatherData.daily} />
            )}
          </div>
        )}
      </main>

      {/* 5. 사이버보안 체크포인트 배너 */}
      <footer className="dashboard-footer">
        <div className="security-notice">
          <strong>🛡️ 사이버보안 & 아키텍처 체크:</strong> 
          <span> Open-Meteo는 API 키 노출 위험이 없는 공개 API이며 전송 구간이 HTTPS로 암호화되어 안전합니다. 검색창에는 400ms 디바운스(Debounce) 처리를 적용하여 불필요한 DoS성 요청 및 API 서버의 <code>429 Too Many Requests</code> 차단을 방어합니다.</span>
        </div>
      </footer>
    </div>
  )
}

export default App
