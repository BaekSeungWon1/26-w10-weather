import { useState, useEffect } from 'react'
import './App.css'
import { DEFAULT_CITIES, fetchWeatherData, fetchAirQualityData, getWeatherInfo, getAirQualityStatus } from './api/weather'

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weather, setWeather] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 도시가 변경될 때마다 날씨 및 미세먼지 데이터 조회
  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(null)

    async function loadData() {
      try {
        const [weatherRes, airRes] = await Promise.all([
          fetchWeatherData(selectedCity.lat, selectedCity.lon),
          fetchAirQualityData(selectedCity.lat, selectedCity.lon)
        ])

        if (!ignore) {
          setWeather(weatherRes)
          setAirQuality(airRes)
          setLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          setError('날씨 데이터를 불러오는 중 오류가 발생했습니다.')
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      ignore = true
    }
  }, [selectedCity])

  const currentWeather = weather?.current
  const currentAir = airQuality?.current
  const weatherDetail = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const airDetail = currentAir ? getAirQualityStatus(currentAir.pm10, currentAir.pm2_5) : null

  return (
    <div className="container">
      <header className="header">
        <span className="badge">10주차 실습 스타터</span>
        <h1>🌤️ 실시간 날씨·미세먼지 대시보드</h1>
        <p className="subtitle">Open-Meteo 공개 API와 Antigravity IDE로 완성하는 스마트 기상 관측소</p>
      </header>

      {/* 주요 도시 빠른 선택 버튼 */}
      <nav className="city-selector">
        {DEFAULT_CITIES.map((city) => (
          <button
            key={city.name}
            className={`city-btn ${selectedCity.name === city.name ? 'active' : ''}`}
            onClick={() => setSelectedCity(city)}
          >
            {city.name}
          </button>
        ))}
      </nav>

      <main className="content">
        {loading && <div className="status-box">⏳ {selectedCity.name} 기상 관측 데이터 수신 중...</div>}
        {error && <div className="status-box error">⚠️ {error}</div>}

        {!loading && !error && currentWeather && (
          <div className="dashboard-grid">
            {/* 현재 날씨 카드 */}
            <section className="card weather-card">
              <h2>현재 기상 상태 ({selectedCity.name})</h2>
              <div className="weather-main">
                <span className="temp">{Math.round(currentWeather.temperature_2m)}°C</span>
                <span className="condition" style={{ color: weatherDetail.color }}>{weatherDetail.label}</span>
              </div>
              <div className="details-list">
                <div>체감 온도: <strong>{Math.round(currentWeather.apparent_temperature)}°C</strong></div>
                <div>습도: <strong>{currentWeather.relative_humidity_2m}%</strong></div>
                <div>풍속: <strong>{currentWeather.wind_speed_10m} km/h</strong></div>
              </div>
            </section>

            {/* 미세먼지 카드 */}
            <section className="card air-card">
              <h2>미세먼지 및 대기질</h2>
              {currentAir && (
                <>
                  <div className="air-badge" style={{ backgroundColor: airDetail.badgeColor }}>
                    통합 대기질: {airDetail.status}
                  </div>
                  <div className="details-list">
                    <div>미세먼지 (PM10): <strong>{Math.round(currentAir.pm10)} μg/m³</strong></div>
                    <div>초미세먼지 (PM2.5): <strong>{Math.round(currentAir.pm2_5)} μg/m³</strong></div>
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>한국폴리텍대학 강서캠퍼스 사이버보안과 | 웹콘텐츠 제작</p>
      </footer>
    </div>
  )
}

export default App
