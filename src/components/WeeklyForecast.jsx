import { useMemo } from 'react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'
import { Calendar, Droplets } from 'lucide-react'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

/**
 * 7일간 주간 날씨 예보 컴포넌트
 */
export default function WeeklyForecast({ daily, tempUnit = 'C' }) {
  const forecastList = useMemo(() => {
    if (!daily || !daily.time) return []

    return daily.time.slice(0, 7).map((dateStr, idx) => {
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const dayOfWeek = DAY_NAMES[date.getDay()]

      let dayLabel = `${dayOfWeek}요일`
      if (idx === 0) dayLabel = '오늘'
      else if (idx === 1) dayLabel = '내일'

      const code = daily.weather_code ? daily.weather_code[idx] : 0
      const weather = getWeatherInfo(code)
      const minC = daily.temperature_2m_min[idx]
      const maxC = daily.temperature_2m_max[idx]
      const minTemp = tempUnit === 'F' ? Math.round((minC * 9) / 5 + 32) : Math.round(minC)
      const maxTemp = tempUnit === 'F' ? Math.round((maxC * 9) / 5 + 32) : Math.round(maxC)
      const precipProb = daily.precipitation_probability_max
        ? daily.precipitation_probability_max[idx]
        : 0

      return {
        dateStr,
        dayLabel,
        dateFormatted: `${month}.${day}`,
        weather,
        minTemp,
        maxTemp,
        precipProb,
      }
    })
  }, [daily, tempUnit])

  if (forecastList.length === 0) return null

  // 주간 전체 최저/최고 기온 (온도 바 스케일 계산용)
  const allMin = Math.min(...forecastList.map((d) => d.minTemp))
  const allMax = Math.max(...forecastList.map((d) => d.maxTemp))
  const totalRange = allMax === allMin ? 1 : allMax - allMin

  return (
    <section className="card weekly-forecast-card">
      <div className="card-header">
        <div>
          <span className="card-tag">주간 예보</span>
          <h2 className="city-name">향후 7일간 일기예보</h2>
        </div>
        <div className="chart-meta-pill">
          <Calendar size={15} />
          <span>7일간 일별 기온 및 강수확률</span>
        </div>
      </div>

      <div className="weekly-list">
        {forecastList.map((item, idx) => {
          // 기온 바 게이지 시작 위치 및 너비 백분율 계산
          const leftPercent = ((item.minTemp - allMin) / totalRange) * 100
          const widthPercent = Math.max(12, ((item.maxTemp - item.minTemp) / totalRange) * 100)

          return (
            <div key={item.dateStr} className={`weekly-item ${idx === 0 ? 'today-item' : ''}`}>
              <div className="weekly-date-col">
                <span className="weekly-day">{item.dayLabel}</span>
                <span className="weekly-date">{item.dateFormatted}</span>
              </div>

              <div className="weekly-weather-col">
                <WeatherIcon
                  name={item.weather.icon}
                  size={26}
                  color={item.weather.color}
                />
                <span className="weekly-weather-label">{item.weather.label}</span>
              </div>

              {/* 강수 확률 */}
              <div className="weekly-rain-col">
                {item.precipProb > 0 ? (
                  <span className="rain-prob">
                    <Droplets size={13} /> {item.precipProb}%
                  </span>
                ) : (
                  <span className="rain-prob zero">-</span>
                )}
              </div>

              {/* 기온 범위 바 */}
              <div className="weekly-temp-bar-col">
                <span className="temp-min">{item.minTemp}°</span>
                <div className="temp-bar-track">
                  <div
                    className="temp-bar-fill"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>
                <span className="temp-max">{item.maxTemp}°</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

