import WeatherIcon from './WeatherIcon'
import { Thermometer, Droplets, Wind } from 'lucide-react'

/**
 * 현재 날씨 카드 컴포넌트
 */
export default function CurrentWeather({ current, cityName, country, weatherInfo }) {
  if (!current || !weatherInfo) return null

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
            {Math.round(current.temperature_2m)}
            <span className="unit">°C</span>
          </span>
          <p className="apparent-temp">
            체감온도 <strong>{Math.round(current.apparent_temperature)}°C</strong>
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
