import WeatherIcon from './WeatherIcon'
import { Thermometer, Droplets, Wind } from 'lucide-react'

/**
 * 현재 날씨 카드 컴포넌트
 */
export default function CurrentWeather({ current, cityName, country, weatherInfo, tempUnit = 'C' }) {
  if (!current || !weatherInfo) return null

  // 단위에 따른 기온 변환
  const displayTemp = tempUnit === 'F' ? Math.round((current.temperature_2m * 9) / 5 + 32) : Math.round(current.temperature_2m)
  const displayApparent = tempUnit === 'F' ? Math.round((current.apparent_temperature * 9) / 5 + 32) : Math.round(current.apparent_temperature)

  return (
    <section className="card weather-card">
      <div className="card-header">
        <div>
          <span className="card-tag">현재 날씨</span>
          <h2 className="city-name">
            {cityName}
            {country && <span className="city-country">, {country}</span>}
          </h2>
        </div>
        <div
          className="weather-badge"
          style={{ backgroundColor: `${weatherInfo.color}20`, color: weatherInfo.color }}
        >
          <WeatherIcon name={weatherInfo.icon} size={20} color={weatherInfo.color} />
          <span>{weatherInfo.label}</span>
        </div>
      </div>

      <div className="weather-main">
        <div className="temperature-group">
          <span className="current-temp">
            {displayTemp}
            <span className="unit">°{tempUnit}</span>
          </span>
          <p className="apparent-temp">
            체감온도 <strong>{displayApparent}°{tempUnit}</strong>
          </p>
        </div>
        <div className="weather-icon-large">
          <WeatherIcon name={weatherInfo.icon} size={84} color={weatherInfo.color} />
        </div>
      </div>

      {/* 상세 기상 지표 그리드 */}
      <div className="metrics-row">
        <div className="metric-item">
          <div className="metric-icon humidity">
            <Droplets size={18} />
          </div>
          <div>
            <span className="metric-label">상대 습도</span>
            <span className="metric-value">{current.relative_humidity_2m}%</span>
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-icon wind">
            <Wind size={18} />
          </div>
          <div>
            <span className="metric-label">풍속</span>
            <span className="metric-value">{current.wind_speed_10m} km/h</span>
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-icon thermometer">
            <Thermometer size={18} />
          </div>
          <div>
            <span className="metric-label">강수량</span>
            <span className="metric-value">{current.precipitation || 0} mm</span>
          </div>
        </div>
      </div>
    </section>
  )
}
