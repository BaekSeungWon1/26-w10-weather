import { useState, useMemo } from 'react'
import { getWeatherInfo } from '../api/weather'
import { Clock } from 'lucide-react'

/**
 * 24시간 시간별 기온 변화를 보여주는 경량 SVG 꺾은선 차트 컴포넌트
 */
export default function HourlyChart({ hourly, tempUnit = 'C' }) {
  // 렌더링 순수성(Purity) 유지를 위해 초기 마운트 시 시간 상태 보관
  const [currentHour] = useState(() => new Date().getHours())

  const chartData = useMemo(() => {
    if (!hourly || !hourly.time || !hourly.temperature_2m) return []

    // 현재 시각 시간대와 가장 가까운 인덱스 탐색
    const hourStr = currentHour.toString().padStart(2, '0')
    let startIndex = hourly.time.findIndex((t) => t.includes(`T${hourStr}:00`))
    if (startIndex === -1) {
      startIndex = 0
    }

    // 현재 시각부터 24시간 슬라이스
    const times = hourly.time.slice(startIndex, startIndex + 24)
    const temps = hourly.temperature_2m.slice(startIndex, startIndex + 24)
    const codes = hourly.weather_code ? hourly.weather_code.slice(startIndex, startIndex + 24) : []

    return times.map((t, i) => {
      const hourNum = parseInt(t.slice(11, 13), 10)
      const isNow = i === 0
      const celsius = temps[i]
      const converted = tempUnit === 'F' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius)
      return {
        timeStr: isNow ? '지금' : `${hourNum}시`,
        temp: converted,
        rawTemp: converted,
        weatherCode: codes[i] || 0,
      }
    })
  }, [hourly, currentHour, tempUnit])

  if (chartData.length === 0) return null

  // SVG 차트 크기 및 스케일 계산
  const width = Math.max(900, chartData.length * 48)
  const height = 180
  const padTop = 45
  const padBottom = 45
  const innerHeight = height - padTop - padBottom

  const temps = chartData.map((d) => d.temp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const tempRange = maxTemp === minTemp ? 2 : maxTemp - minTemp

  const points = chartData.map((d, i) => {
    const x = 30 + (i * (width - 60)) / (chartData.length - 1)
    const y = padTop + ((maxTemp - d.temp) / tempRange) * innerHeight
    return { x, y, ...d }
  })

  // SVG 패스 생성
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padBottom + 10} L ${points[0].x} ${height - padBottom + 10} Z`

  return (
    <section className="card hourly-chart-card">
      <div className="card-header">
        <div>
          <span className="card-tag">시간대별 예보</span>
          <h2 className="city-name">오늘~내일 24시간 기온 추이</h2>
        </div>
        <div className="chart-meta-pill">
          <Clock size={15} />
          <span>향후 24시간 실시간 변화</span>
        </div>
      </div>

      <div className="chart-scroll-wrapper">
        <svg
          className="hourly-svg"
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <defs>
            {/* 배경 그라데이션 */}
            <linearGradient id="tempAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 영역 채우기 */}
          <path d={areaPath} fill="url(#tempAreaGradient)" />

          {/* 꺾은선 */}
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 데이터 포인트, 텍스트, 날씨 아이콘 */}
          {points.map((p, idx) => {
            const weather = getWeatherInfo(p.weatherCode)
            return (
              <g key={idx} className="chart-point-group">
                {/* 상단 날씨 아이콘 (2시간 단위로 렌더링하여 겹침 방지) */}
                {idx % 2 === 0 && (
                  <circle
                    cx={p.x}
                    cy={16}
                    r="8"
                    fill={`${weather.color}25`}
                  />
                )}

                {/* 기온 텍스트 */}
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  className="chart-temp-text"
                >
                  {p.temp}°
                </text>

                {/* 포인트 원 */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={idx === 0 ? '5.5' : '4'}
                  fill={idx === 0 ? '#2563eb' : '#ffffff'}
                  stroke="#2563eb"
                  strokeWidth={idx === 0 ? '3' : '2.5'}
                />

                {/* 시간 텍스트 라벨 */}
                <text
                  x={p.x}
                  y={height - 14}
                  textAnchor="middle"
                  className={`chart-time-text ${idx === 0 ? 'current-time' : ''}`}
                >
                  {p.timeStr}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="chart-footer-guide">
        <span>← 좌우로 스크롤하여 24시간 동안의 기온과 날씨 변화를 확인하세요 →</span>
      </div>
    </section>
  )
}
