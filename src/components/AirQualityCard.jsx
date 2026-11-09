import { ShieldCheck, ShieldAlert } from 'lucide-react'

/**
 * 미세먼지 및 대기질 카드 컴포넌트
 */
export default function AirQualityCard({ currentAir, airStatus }) {
  if (!currentAir || !airStatus) return null

  return (
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
  )
}
