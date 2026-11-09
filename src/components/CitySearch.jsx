import { useState, useEffect, useRef } from 'react'
import { searchCities } from '../api/weather'
import { Search, Loader2, MapPin, X } from 'lucide-react'

/**
 * 400ms 디바운스(Debounce)가 적용된 도시 검색 및 자동완성 컴포넌트
 * 
 * 🛡️ 사이버보안 체크포인트:
 * - 사용자의 타이핑마다 무차별적으로 외부 API를 호출하는 DoS성 부하 및 429 Too Many Requests 방어
 * - 입력이 멈춘 후 400ms 동안 추가 입력이 없을 때만 단 1회 검색 API를 호출합니다.
 */
export default function CitySearch({ onSelectCity }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // 400ms 디바운스 검색 처리
  useEffect(() => {
    const trimmed = searchTerm.trim()
    if (trimmed.length < 2) {
      const resetTimer = setTimeout(() => {
        setResults([])
        setIsSearching(false)
        setIsOpen(false)
      }, 0)
      return () => clearTimeout(resetTimer)
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const data = await searchCities(trimmed)
        setResults(data)
        setIsOpen(true)
      } catch (err) {
        console.error('도시 검색 중 오류 발생:', err)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400) // 400ms 디바운스

    return () => clearTimeout(timer)
  }, [searchTerm])

  // 바깥 영역 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 도시 선택 핸들러
  const handleSelect = (city) => {
    onSelectCity({
      name: city.name,
      lat: city.latitude,
      lon: city.longitude,
      country: city.country,
      admin1: city.admin1,
    })
    setSearchTerm('')
    setIsOpen(false)
  }

  // 검색창 비우기
  const handleClear = () => {
    setSearchTerm('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="city-search-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="도시 이름 검색 (예: Seoul, Busan, Tokyo, 서울 등)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          aria-label="도시 검색"
        />
        {isSearching && <Loader2 size={18} className="search-spinner spinning" />}
        {!isSearching && searchTerm && (
          <button type="button" className="clear-btn" onClick={handleClear} aria-label="검색어 지우기">
            <X size={16} />
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && (
        <ul className="search-dropdown" role="listbox">
          {results.length > 0 ? (
            results.map((item) => (
              <li
                key={`${item.id || item.latitude}-${item.longitude}`}
                className="search-dropdown-item"
                onClick={() => handleSelect(item)}
                role="option"
                aria-selected="false"
              >
                <div className="item-main">
                  <MapPin size={16} className="item-icon" />
                  <span className="item-name">{item.name}</span>
                  {item.admin1 && <span className="item-admin">({item.admin1})</span>}
                </div>
                {item.country && <span className="item-country">{item.country}</span>}
              </li>
            ))
          ) : (
            <li className="search-empty-item">
              <span>일치하는 도시를 찾을 수 없습니다.</span>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
