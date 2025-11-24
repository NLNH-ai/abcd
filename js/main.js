
// Modern Frontend Architecture Implementation
'use strict';

// Application State Management
class HanabiAppState {
    constructor() {
        this.state = {
            isMenuOpen: false,
            isLiveStreaming: false,
            currentSection: 'hero',
            theme: 'dark',
            analytics: [],
            subscribers: [],
            user: {
                preferences: {},
                visitCount: 0,
                lastVisit: null
            }
        };

        this.subscribers = new Map();
        this.loadState();
    }

    getState() {
        return { ...this.state };
    }

    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        this.notifySubscribers(prevState, this.state);
        this.saveState();
    }

    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(callback);

        return () => {
            const callbacks = this.subscribers.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    notifySubscribers(prevState, newState) {
        Object.keys(newState).forEach(key => {
            if (prevState[key] !== newState[key] && this.subscribers.has(key)) {
                this.subscribers.get(key).forEach(callback => {
                    try {
                        callback(newState[key], prevState[key]);
                    } catch (error) {
                        console.error('State subscription error:', error);
                    }
                });
            }
        });
    }

    saveState() {
        try {
            const persistableState = {
                theme: this.state.theme,
                user: this.state.user,
                analytics: this.state.analytics.slice(-100),
                subscribers: this.state.subscribers
            };
            localStorage.setItem('hanabi_app_state', JSON.stringify(persistableState));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    loadState() {
        try {
            const savedState = localStorage.getItem('hanabi_app_state');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                this.state = { ...this.state, ...parsed };
                this.state.user.visitCount = (this.state.user.visitCount || 0) + 1;
                this.state.user.lastVisit = new Date().toISOString();
            }
        } catch (error) {
            console.error('Failed to load state:', error);
        }
    }
}

// Error Handling System
class ErrorHandler {
    static log(message, error = null, context = {}) {
        const errorInfo = {
            message,
            error: error?.message || error,
            stack: error?.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        console.error('🚨 Hanabi Error:', errorInfo);

        if (window.hanabiAnalytics) {
            window.hanabiAnalytics.track('error_occurred', errorInfo);
        }
    }

    static async withErrorHandling(fn, context = {}) {
        try {
            return await fn();
        } catch (error) {
            this.log('Function execution failed', error, context);
            throw error;
        }
    }
}

// Utility Functions
class DOMUtils {
    static async querySelector(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element not found: ${selector}`));
            }, timeout);
        });
    }

    static addEventListenerSafe(element, event, handler, options = {}) {
        if (!element || !event || !handler) return;

        const wrappedHandler = (e) => {
            try {
                handler(e);
            } catch (error) {
                ErrorHandler.log(`Event handler error: ${event}`, error);
            }
        };

        element.addEventListener(event, wrappedHandler, options);
        return () => element.removeEventListener(event, wrappedHandler, options);
    }
}

// Performance Monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.initializeObservers();
    }

    startTiming(label) {
        this.metrics.set(label, { start: performance.now() });
    }

    endTiming(label) {
        const metric = this.metrics.get(label);
        if (metric) {
            metric.end = performance.now();
            metric.duration = metric.end - metric.start;

            if (window.hanabiAnalytics) {
                window.hanabiAnalytics.track('performance_metric', {
                    label,
                    duration: metric.duration
                });
            }
        }
    }

    initializeObservers() {
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];

                    if (window.hanabiAnalytics) {
                        window.hanabiAnalytics.track('lcp_metric', {
                            value: lastEntry.startTime
                        });
                    }
                });

                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (error) {
                ErrorHandler.log('Failed to initialize LCP observer', error);
            }
        }
    }
}

// Initialize global instances
const appState = new HanabiAppState();
const performanceMonitor = new PerformanceMonitor();

// Global utilities
window.HanabiApp = {
    state: appState,
    performance: performanceMonitor,
    utils: {
        DOM: DOMUtils,
        ErrorHandler
    }
};

// Legacy compatibility
let isMenuOpen = false;

// 기타 스트럼 사운드 및 시각 효과
async function createGuitarStrum() {
    console.log('🎸 Creating guitar strum effect...');

    // 시각적 효과 추가
    createStrumVisualEffect();

    try {
        // Web Audio API를 사용하여 기타 스트럼 사운드 생성
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // AudioContext를 명시적으로 resume (브라우저 정책 준수)
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
            console.log('🎵 AudioContext resumed!');
        }

        // 여러 기타 현을 시뮬레이션하여 풍부한 사운드 생성
        const now = audioContext.currentTime;

        // E, A, D, G, B, E 현 (기타 6개 현)
        const stringFrequencies = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];

        stringFrequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = 'triangle'; // 기타 소리와 유사한 파형
            oscillator.frequency.setValueAtTime(freq, now);

            // 각 현이 약간 다른 시간에 울리도록 설정 (스트러밍 효과)
            const delay = index * 0.02;
            const startTime = now + delay;

            // 볼륨 엔벨로프 (공격-감쇠-지속-해제)
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.01); // 빠른 공격 (볼륨 증가)
            gainNode.gain.exponentialRampToValueAtTime(0.15, startTime + 0.2); // 감쇠
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.5); // 긴 해제

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + 1.5);
        });

        console.log('🎸 Guitar strum sound generated successfully! AudioContext state:', audioContext.state);

        // 성공 시 시각적 피드백
        const notification = document.createElement('div');
        notification.innerHTML = '🎸 하나비에 오신 것을 환영합니다!';
        notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--gradient-primary);
                    color: white;
                    padding: 15px 30px;
                    border-radius: 50px;
                    z-index: 10000;
                    font-size: 16px;
                    font-weight: bold;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    animation: slideDown 0.5s ease-out;
                `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 2500);

    } catch (e) {
        console.error('🚫 Audio error:', e);
        showAudioError();
    }
}

function showAudioError() {
    const fallback = document.createElement('div');
    fallback.innerHTML = '🎸 오디오 재생 실패 - 브라우저 정책으로 인해 소리가 차단됨';
    fallback.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: orange;
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 10000;
                max-width: 300px;
                text-align: center;
            `;
    document.body.appendChild(fallback);
    setTimeout(() => fallback.remove(), 3000);
}

// 기타 스트럼 시각 효과
function createStrumVisualEffect() {
    // 웰컴 플래시 효과
    const flash = document.createElement('div');
    flash.className = 'welcome-flash';
    document.body.appendChild(flash);

    // 파문 효과 컨테이너
    const effectContainer = document.createElement('div');
    effectContainer.className = 'guitar-strum-effect';
    document.body.appendChild(effectContainer);

    // 여러 개의 파문 생성
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const wave = document.createElement('div');
            wave.className = 'strum-wave';
            wave.style.borderColor = `rgba(${255 - i * 30}, ${107 + i * 20}, ${107 + i * 20}, ${0.6 - i * 0.1})`;
            effectContainer.appendChild(wave);

            // 애니메이션 완료 후 제거
            setTimeout(() => {
                if (wave.parentNode) {
                    wave.parentNode.removeChild(wave);
                }
            }, 1500);
        }, i * 200);
    }

    // 전체 효과 정리
    setTimeout(() => {
        if (flash.parentNode) flash.parentNode.removeChild(flash);
        if (effectContainer.parentNode) effectContainer.parentNode.removeChild(effectContainer);
    }, 2000);
}

// 이 부분은 새로운 오프닝 시스템으로 대체됨 (아래 참조)

// Lazy Loading 초기화
function initializeLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-image');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// 테마 토글 초기화
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    let isDarkMode = true;

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            document.body.classList.toggle('light-mode', !isDarkMode);
            themeIcon.textContent = isDarkMode ? '🌙' : '☀️';

            // 테마 변경 애니메이션
            document.body.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        });
    }
}

// 터치 제스처 초기화
function initializeTouchGestures() {
    let startX = 0;
    let startY = 0;
    const mobileMenuPanel = document.getElementById('mobileMenuPanel');

    // 스와이프로 모바일 메뉴 닫기
    if (mobileMenuPanel) {
        mobileMenuPanel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        mobileMenuPanel.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = Math.abs(startY - endY);

            // 왼쪽으로 스와이프 감지 (최소 100px, 세로 이동은 50px 이하)
            if (diffX > 100 && diffY < 50) {
                toggleMobileMenu();
            }
        }, { passive: true });
    }

    // 멤버 카드 터치 향상
    const memberCards = document.querySelectorAll('.member-card');
    memberCards.forEach(card => {
        let isFlipped = false;

        card.addEventListener('touchstart', () => {
            if (!isFlipped) {
                card.classList.add('touch-flip');
                isFlipped = true;
                setTimeout(() => {
                    card.classList.remove('touch-flip');
                    isFlipped = false;
                }, 3000);
            }
        }, { passive: true });
    });
}

// 음악 플레이어 초기화
function initializeMusicPlayer() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const currentTime = document.getElementById('currentTime');
    const totalTime = document.getElementById('totalTime'); // Added totalTime element
    const volumeSlider = document.getElementById('volumeSlider');
    const muteBtn = document.getElementById('muteBtn');

    // Use the opening video as the audio source for the demo
    const audio = new Audio('videos/하나비_밴드_오프닝_영상_제작.mp4');
    let isPlaying = false;

    // 초기 볼륨 설정
    audio.volume = 0.5;
    if (volumeSlider) volumeSlider.value = 50;

    // 메타데이터 로드 시 총 시간 설정
    audio.addEventListener('loadedmetadata', () => {
        if (totalTime) totalTime.textContent = formatTime(audio.duration);
    });

    // 재생/일시정지 토글
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play().then(() => {
                    isPlaying = true;
                    playIcon.textContent = '⏸️';
                    startProgressLoop();
                }).catch(error => {
                    console.error("Playback failed:", error);
                    showNotification('오디오 재생을 시작할 수 없습니다.', 'error');
                });
            } else {
                audio.pause();
                isPlaying = false;
                playIcon.textContent = '▶️';
            }
        });
    }

    // 프로그레스 바 클릭
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const percentage = clickX / width;

            if (isFinite(audio.duration)) {
                audio.currentTime = percentage * audio.duration;
                updateProgressUI();
            }
        });
    }

    // 볼륨 슬라이더
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            audio.volume = value / 100;
            if (audio.volume === 0) {
                muteBtn.textContent = '🔇';
            } else {
                muteBtn.textContent = '🔊';
            }
        });
    }

    // 음소거 토글
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (audio.muted) {
                audio.muted = false;
                muteBtn.textContent = '🔊';
                if (volumeSlider) volumeSlider.value = audio.volume * 100;
            } else {
                audio.muted = true;
                muteBtn.textContent = '🔇';
                if (volumeSlider) volumeSlider.value = 0;
            }
        });
    }

    // 오디오 종료 시
    audio.addEventListener('ended', () => {
        isPlaying = false;
        playIcon.textContent = '▶️';
        audio.currentTime = 0;
        updateProgressUI();
    });

    function startProgressLoop() {
        if (!audio.paused) {
            updateProgressUI();
            requestAnimationFrame(startProgressLoop);
        }
    }

    function updateProgressUI() {
        if (isFinite(audio.duration)) {
            const percentage = (audio.currentTime / audio.duration) * 100;
            if (progress) progress.style.width = `${percentage}%`;
            if (currentTime) currentTime.textContent = formatTime(audio.currentTime);
        }
    }

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// 성능 최적화 초기화
function initializePerformanceOptimizations() {
    // 비디오 지연 로딩
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.setAttribute('preload', 'metadata');
    });

    // 이미지 프리로드 최적화
    const criticalImages = document.querySelectorAll('img[data-critical="true"]');
    criticalImages.forEach(img => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src || img.dataset.src;
        document.head.appendChild(link);
    });

    // Intersection Observer로 애니메이션 최적화
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in, .bounce-in');
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.willChange = 'transform, opacity';
                setTimeout(() => {
                    entry.target.style.willChange = 'auto';
                }, 1000);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => animationObserver.observe(el));

    // 메모리 정리
    window.addEventListener('beforeunload', () => {
        animationObserver.disconnect();
    });
}

// 분석 및 트래킹 초기화
function initializeAnalytics() {
    // 가상의 분석 시스템 (실제로는 Google Analytics, Mixpanel 등 사용)
    const analytics = {
        track: function (event, properties = {}) {
            console.log('📊 Analytics Event:', event, properties);

            // 로컬 스토리지에 이벤트 저장 (데모용)
            const events = JSON.parse(localStorage.getItem('hanabi_analytics') || '[]');
            events.push({
                event,
                properties,
                timestamp: new Date().toISOString(),
                url: window.location.href
            });
            localStorage.setItem('hanabi_analytics', JSON.stringify(events.slice(-100))); // 최근 100개만 저장
        },

        pageView: function () {
            this.track('page_view', {
                page: window.location.pathname,
                referrer: document.referrer,
                user_agent: navigator.userAgent
            });
        }
    };

    // 페이지 뷰 트래킹
    analytics.pageView();

    // 클릭 이벤트 트래킹
    document.addEventListener('click', (e) => {
        if (e.target.matches('button') || e.target.closest('button')) {
            const button = e.target.matches('button') ? e.target : e.target.closest('button');
            analytics.track('button_click', {
                button_text: button.textContent.trim(),
                button_id: button.id,
                section: button.closest('section')?.id || 'unknown'
            });
        }

        if (e.target.matches('a') || e.target.closest('a')) {
            const link = e.target.matches('a') ? e.target : e.target.closest('a');
            analytics.track('link_click', {
                url: link.href,
                text: link.textContent.trim(),
                external: !link.href.includes(window.location.hostname)
            });
        }
    });

    // 스크롤 깊이 트래킹
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            if (maxScroll % 25 === 0) { // 25%, 50%, 75%, 100%
                analytics.track('scroll_depth', { depth: maxScroll });
            }
        }
    });

    // 글로벌 analytics 객체로 만들기
    window.hanabiAnalytics = analytics;
}

// 라이브 스트림 시스템 초기화
function initializeLiveStream() {
    const liveIndicator = document.getElementById('liveIndicator');
    const liveNotification = document.getElementById('liveStreamNotification');
    const joinLiveBtn = document.getElementById('joinLiveBtn');

    // 라이브 상태 시뮬레이션 (실제로는 서버에서 받아옴)
    const isLive = Math.random() > 0.7; // 30% 확률로 라이브 중

    if (isLive) {
        liveIndicator.style.display = 'block';
        liveNotification.style.display = 'block';

        // 라이브 참여 버튼 클릭
        if (joinLiveBtn) {
            joinLiveBtn.addEventListener('click', () => {
                window.hanabiAnalytics?.track('live_stream_join', {
                    source: 'hero_notification'
                });

                // 라이브 스트림 모달 표시
                showLiveStreamModal();
            });
        }
    }

    // 라이브 상태 주기적 확인 (실제로는 WebSocket 사용)
    setInterval(() => {
        // 서버에서 라이브 상태 확인하는 로직
    }, 30000); // 30초마다 확인
}

// 라이브 스트림 모달 표시
function showLiveStreamModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center';
    modal.innerHTML = `
                <div class="bg-darker border border-gray-700 rounded-lg max-w-4xl w-full mx-4 p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-2xl font-semibold text-gradient">🔴 하나비 라이브 스트림</h3>
                        <button id="closeLiveModal" class="text-gray-400 hover:text-white text-2xl">&times;</button>
                    </div>
                    <div class="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
                        <div class="text-center">
                            <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p class="text-gray-400">라이브 스트림 연결 중...</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2 text-red-500">
                            <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span>LIVE</span>
                        </div>
                        <span class="text-gray-400">시청자 1,234명</span>
                        <button class="ml-auto px-4 py-2 bg-primary hover:bg-secondary rounded transition-colors">
                            💬 채팅 참여
                        </button>
                    </div>
                </div>
            `;

    document.body.appendChild(modal);

    document.getElementById('closeLiveModal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// 뉴스레터 시스템 초기화
function initializeNewsletter() {
    const form = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('emailInput');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = emailInput.value;

            // 이메일 유효성 검사
            if (!email || !email.includes('@')) {
                showNotification('올바른 이메일 주소를 입력해주세요.', 'error');
                return;
            }

            // 분석 이벤트 트래킹
            window.hanabiAnalytics?.track('newsletter_signup', {
                email: email.split('@')[1], // 도메인만 저장 (개인정보 보호)
                source: 'contact_section'
            });

            // 가입 처리 (실제로는 서버에 전송)
            const subscribers = JSON.parse(localStorage.getItem('hanabi_subscribers') || '[]');
            if (!subscribers.includes(email)) {
                subscribers.push(email);
                localStorage.setItem('hanabi_subscribers', JSON.stringify(subscribers));

                showNotification('뉴스레터 구독이 완료되었습니다! 🎉', 'success');
                emailInput.value = '';
            } else {
                showNotification('이미 구독 중인 이메일입니다.', 'info');
            }
        });
    }
}

// UX 향상 기능 초기화
function initializeUXEnhancements() {
    // 스크롤 진행률 표시
    initializeScrollProgress();

    // 네비게이션 액티브 상태
    initializeActiveNavigation();

    // 플로팅 액션 버튼
    initializeFloatingActionButton();

    // 향상된 폼 피드백
    initializeFormEnhancements();

    // 햄버거 메뉴 애니메이션
    initializeHamburgerAnimation();

    // 스크롤투탑 기능
    initializeScrollToTop();
}

// 스크롤 진행률 표시
function initializeScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;

        if (progressBar) {
            progressBar.style.width = `${Math.min(scrolled, 100)}%`;
        }
    });
}

// 네비게이션 액티브 상태 관리
function initializeActiveNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const currentSection = document.getElementById('currentSection');

    const sectionNames = {
        'hero': '🏠 홈 › 하나비와 함께하는 시네마틱 여정',
        'story': '📖 스토리 › 밴드의 탄생과 음악적 철학',
        'music': '🎵 음악 › 최신 앨범과 뮤직비디오',
        'band': '👥 멤버 › 하나비를 이루는 다섯 명의 뮤지션',
        'contact': '📞 연락처 › 공연 문의 및 팬 커뮤니티'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;

                // 네비게이션 액티브 상태 업데이트
                navLinks.forEach(link => {
                    link.classList.remove('active', 'text-primary', 'text-secondary');
                    if (link.getAttribute('data-section') === id || link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                        if (id === 'music' || id === 'contact') {
                            link.classList.add('text-secondary');
                        } else {
                            link.classList.add('text-primary');
                        }
                    }
                });

                // 브레드크럼 업데이트
                if (currentSection && sectionNames[id]) {
                    currentSection.textContent = sectionNames[id];
                }
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
}

// 플로팅 액션 버튼
function initializeFloatingActionButton() {
    const fab = document.getElementById('scrollToTopFab');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            fab.style.display = 'flex';
            fab.style.animation = 'fadeIn 0.3s ease-in-out';
        } else {
            fab.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => {
                if (window.scrollY <= 300) {
                    fab.style.display = 'none';
                }
            }, 300);
        }
    });

    fab.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Analytics tracking
        window.hanabiAnalytics?.track('scroll_to_top', {
            scroll_position: window.scrollY
        });
    });
}

// 향상된 폼 피드백
function initializeFormEnhancements() {
    const emailInput = document.getElementById('emailInput');
    const validIcon = document.getElementById('emailValidIcon');
    const submitBtn = document.getElementById('newsletterSubmitBtn');

    if (emailInput) {
        emailInput.addEventListener('input', (e) => {
            const email = e.target.value;
            const isValid = email.includes('@') && email.includes('.');

            if (isValid) {
                emailInput.classList.remove('form-error');
                emailInput.classList.add('form-success');
                validIcon.style.opacity = '1';
            } else if (email.length > 0) {
                emailInput.classList.remove('form-success');
                emailInput.classList.add('form-error');
                validIcon.style.opacity = '0';
            } else {
                emailInput.classList.remove('form-success', 'form-error');
                validIcon.style.opacity = '0';
            }
        });

        // 포커스 시 플레이스홀더 애니메이션
        emailInput.addEventListener('focus', () => {
            emailInput.style.transform = 'scale(1.02)';
        });

        emailInput.addEventListener('blur', () => {
            emailInput.style.transform = 'scale(1)';
        });
    }
}

// 햄버거 메뉴 애니메이션
function initializeHamburgerAnimation() {
    const mobileMenuBtn = document.getElementById('mobileMenu');
    const mobileMenuPanel = document.getElementById('mobileMenuPanel');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
        });
    }
}

// 스크롤투탑 전역 함수
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 스크롤투탑 초기화
function initializeScrollToTop() {
    // 로고 클릭시 맨 위로 이동
    const logo = document.querySelector('.nav-logo');
    if (logo) {
        logo.addEventListener('click', scrollToTop);
    }
}

// 관리자 대시보드 초기화
function initializeAdminDashboard() {
    const adminBtn = document.getElementById('adminDashboardBtn');
    const adminDashboard = document.getElementById('adminDashboard');
    const closeBtn = document.getElementById('closeAdminDashboard');
    const toggleLiveBtn = document.getElementById('toggleLiveStream');
    const clearAnalyticsBtn = document.getElementById('clearAnalytics');

    let isLiveStreaming = false;

    // 관리자 대시보드 열기
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            adminDashboard.classList.remove('hidden');
            updateDashboardData();
            updateAnalyticsEvents();
        });
    }

    // 관리자 대시보드 닫기
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            adminDashboard.classList.add('hidden');
        });
    }

    // 라이브 스트림 토글
    if (toggleLiveBtn) {
        toggleLiveBtn.addEventListener('click', () => {
            isLiveStreaming = !isLiveStreaming;

            const indicator = document.getElementById('liveStatusIndicator');
            const statusText = document.getElementById('liveStatusText');
            const liveIndicator = document.getElementById('liveIndicator');
            const liveNotification = document.getElementById('liveStreamNotification');

            if (isLiveStreaming) {
                indicator.className = 'w-3 h-3 bg-red-500 rounded-full animate-pulse';
                statusText.textContent = '라이브 중';
                statusText.className = 'text-red-500 font-semibold';
                toggleLiveBtn.textContent = '라이브 종료';
                toggleLiveBtn.className = 'w-full py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors';

                // 메인 사이트에 라이브 표시
                liveIndicator.style.display = 'block';
                liveNotification.style.display = 'block';

                showNotification('라이브 스트림이 시작되었습니다! 🔴', 'success');
            } else {
                indicator.className = 'w-3 h-3 bg-gray-500 rounded-full';
                statusText.textContent = '오프라인';
                statusText.className = 'text-gray-400';
                toggleLiveBtn.textContent = '라이브 시작';
                toggleLiveBtn.className = 'w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors';

                // 메인 사이트에서 라이브 숨김
                liveIndicator.style.display = 'none';
                liveNotification.style.display = 'none';

                showNotification('라이브 스트림이 종료되었습니다.', 'info');
            }

            window.hanabiAnalytics?.track('admin_live_toggle', {
                status: isLiveStreaming ? 'started' : 'stopped'
            });
        });
    }

    // 분석 데이터 지우기
    if (clearAnalyticsBtn) {
        clearAnalyticsBtn.addEventListener('click', () => {
            localStorage.removeItem('hanabi_analytics');
            document.getElementById('analyticsEvents').innerHTML = '';
            showNotification('분석 데이터가 삭제되었습니다.', 'success');
        });
    }

    // 대시보드 데이터 업데이트
    function updateDashboardData() {
        // 구독자 수 업데이트
        const subscribers = JSON.parse(localStorage.getItem('hanabi_subscribers') || '[]');
        document.getElementById('subscriberCount').textContent = subscribers.length;

        // 분석 이벤트 수 업데이트
        const events = JSON.parse(localStorage.getItem('hanabi_analytics') || '[]');
        document.getElementById('totalPageViews').textContent = events.filter(e => e.event === 'page_view').length;
    }

    // 실시간 분석 이벤트 표시
    function updateAnalyticsEvents() {
        const events = JSON.parse(localStorage.getItem('hanabi_analytics') || '[]');
        const container = document.getElementById('analyticsEvents');

        container.innerHTML = '';

        events.slice(-20).reverse().forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'text-sm py-2 border-b border-gray-700 flex justify-between';

            const eventName = event.event.replace('_', ' ').toUpperCase();
            const time = new Date(event.timestamp).toLocaleTimeString();

            eventDiv.innerHTML = `
                        <span class="text-gray-300">${eventName}</span>
                        <span class="text-gray-500">${time}</span>
                    `;

            container.appendChild(eventDiv);
        });

        // 실시간 업데이트를 위해 다시 호출
        setTimeout(updateAnalyticsEvents, 5000);
    }

    // 대시보드가 열려있을 때 실시간 업데이트
    setInterval(() => {
        if (!adminDashboard.classList.contains('hidden')) {
            updateDashboardData();
        }
    }, 10000);
}

// 알림 표시 함수
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg text-white font-semibold animate-bounce ${type === 'success' ? 'bg-green-600' :
        type === 'error' ? 'bg-red-600' :
            'bg-blue-600'
        }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// 접근성 초기화
function initializeAccessibility() {
    // 키보드 네비게이션 향상
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // ESC로 모달 닫기
            const videoModal = document.getElementById('videoModal');
            const imageModal = document.getElementById('imageModal');
            const mobileMenuPanel = document.getElementById('mobileMenuPanel');

            if (videoModal && videoModal.style.display === 'flex') {
                closeVideoModal();
            }
            if (imageModal && imageModal.style.display === 'flex') {
                closeImageModal();
            }
            if (mobileMenuPanel && mobileMenuPanel.classList.contains('translate-x-0')) {
                toggleMobileMenu();
            }
        }
    });

    // ARIA 상태 업데이트
    const mobileMenuBtn = document.getElementById('mobileMenu');
    if (mobileMenuBtn) {
        const observer = new MutationObserver(() => {
            const isOpen = document.getElementById('mobileMenuPanel').classList.contains('translate-x-0');
            mobileMenuBtn.setAttribute('aria-expanded', isOpen);
            document.getElementById('mobileMenuPanel').setAttribute('aria-hidden', !isOpen);
        });

        observer.observe(document.getElementById('mobileMenuPanel'), {
            attributes: true,
            attributeFilter: ['class']
        });
    }
}

function initializeApp() {
    initializeUXEnhancements();
    initializeAnalytics();
    initializeLiveStream();
    initializeNewsletter();
    initializeAdminDashboard();
    initializePerformanceOptimizations();
    initializeLazyLoading();
    initializeThemeToggle();
    initializeTouchGestures();
    initializeMusicPlayer();
    initializeNavigation();
    initializeScrollAnimations();
    initializeVideoModal();
    initializeImageModal();
    initializeFloatingShapes();
    initializeInteractiveEffects();
    initializeAnimeAnimations();
    initializeAccessibility();

    // 새로운 기획자 기능들
    initializeFanEngagement();
    initializeDataAnalytics();
    initializeSocialIntegration();
    initializeContentManagement();
    initializeUserJourney();
    initializePracticeLog();
}

// 네비게이션 초기화
function initializeNavigation() {
    const mobileMenuBtn = document.getElementById('mobileMenu');
    const mobileMenuPanel = document.getElementById('mobileMenuPanel');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMobileMenu();
        });
    });

    // 부드러운 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;
    const mobileMenuPanel = document.getElementById('mobileMenuPanel');

    if (mobileMenuPanel) {
        if (isMenuOpen) {
            mobileMenuPanel.style.transform = 'translateX(0)';
        } else {
            mobileMenuPanel.style.transform = 'translateX(-100%)';
        }
    }
}

// 강화된 스크롤 애니메이션 초기화
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // 모든 애니메이션 클래스들 관찰
    const animationClasses = [
        '.fade-in', '.slide-left', '.slide-right', '.scale-up',
        '.rotate-in', '.bounce-in', '.fade-up-slow', '.blur-in'
    ];

    animationClasses.forEach(className => {
        document.querySelectorAll(className).forEach(el => {
            observer.observe(el);
        });
    });

    // 패럴랙스 효과
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateParallax() {
        const scrollY = window.scrollY;
        const scrollDelta = scrollY - lastScrollY;

        // Hero 배경 패럴랙스
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${scrollY * 0.5}px)`;
        }

        // 오로라 효과 패럴랙스
        const aurora = document.querySelector('.aurora');
        if (aurora) {
            aurora.style.transform = `translateY(${scrollY * 0.3}px) rotate(${scrollY * 0.05}deg)`;
        }

        // 플로팅 도형들 패럴랙스
        const floatingShapes = document.querySelectorAll('.shape');
        floatingShapes.forEach((shape, index) => {
            const speed = 0.2 + (index % 3) * 0.1;
            shape.style.transform += ` translateY(${scrollDelta * speed}px)`;
        });

        lastScrollY = scrollY;
        ticking = false;
    }

    function requestParallaxUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestParallaxUpdate, { passive: true });

    // 스크롤 진행 표시기
    const scrollProgress = document.createElement('div');
    scrollProgress.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 0%;
                height: 3px;
                background: linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-tertiary));
                z-index: 9999;
                transition: width 0.1s ease;
            `;
    document.body.appendChild(scrollProgress);

    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        scrollProgress.style.width = Math.min(scrollPercent, 100) + '%';
    }, { passive: true });
}

// 영상 모달 초기화
function initializeVideoModal() {
    const jinhoVideoBtn = document.getElementById('videoBtn');
    const yuntaeVideoBtn = document.getElementById('yuntaeVideoBtn');
    const videoModal = document.getElementById('videoModal');
    const videoClose = document.getElementById('videoClose');
    const modalVideo = document.getElementById('modalVideo');
    const videoTitle = document.querySelector('.video-title');

    // 진호 영상보기 버튼 클릭
    if (jinhoVideoBtn) {
        jinhoVideoBtn.addEventListener('click', function () {
            openVideoModal('videos/진호_guitar_performance.mp4', '김진호 - 기타 연주 영상');
        });
    }

    // 윤태 영상보기 버튼 클릭
    if (yuntaeVideoBtn) {
        yuntaeVideoBtn.addEventListener('click', function () {
            openVideoModal('videos/윤태_guitar_performance.mp4', '윤태 - 기타 연주 영상');
        });
    }

    function openVideoModal(videoSrc, title) {
        if (videoModal && modalVideo) {
            // 비디오 소스 설정
            const videoSource = modalVideo.querySelector('source');
            if (videoSource) {
                videoSource.src = videoSrc;
                modalVideo.load();
            }

            // 제목 설정
            if (videoTitle) {
                videoTitle.textContent = title;
            }

            videoModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            modalVideo.currentTime = 0;
        }
    }

    // 모달 닫기 버튼
    if (videoClose) {
        videoClose.addEventListener('click', closeVideoModal);
    }

    // 모달 배경 클릭시 닫기
    if (videoModal) {
        videoModal.addEventListener('click', function (e) {
            if (e.target === videoModal) {
                closeVideoModal();
            }
        });
    }

    // ESC 키로 닫기
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });

    function closeVideoModal() {
        if (videoModal) {
            videoModal.classList.remove('active');
            document.body.style.overflow = 'auto';

            // 비디오 정지
            if (modalVideo) {
                modalVideo.pause();
                modalVideo.currentTime = 0;
            }
        }
    }
}

// 이미지 모달 초기화
function initializeImageModal() {
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalName = document.getElementById('modalName');
    const modalRole = document.getElementById('modalRole');
    const imageClose = document.getElementById('imageClose');
    const clickableImages = document.querySelectorAll('.clickable-image');

    // 멤버 데이터
    const memberData = {
        '윤태.png': { name: '윤태', role: '기타 (Guitar)' },
        '진호.png': { name: '김진호', role: '기타 (Guitar)' },
        '찬희.png': { name: '황찬희', role: '베이스 (Bass)' },
        '건희.png': { name: '노건희', role: '드럼 (Drums)' },
        '경준.jpeg': { name: '이경준', role: '피아노 (Piano)' },
        '고양이.jpg': { name: '하나비 마스코트', role: '공식 밴드 고양이 🐱' },
        '앨범 표지 1.png': { name: '앨범 표지', role: '하나비의 정규 앨범 아트워크' },
        '앨범 소개 2.png': { name: '앨범 소개', role: '하나비의 음악 세계관과 컨셉' },
        '앨범 소개 3.png': { name: '앨범 아트', role: '시네마틱 사운드의 비주얼 표현' }
    };

    // 이미지 클릭 이벤트
    clickableImages.forEach(img => {
        img.addEventListener('click', function () {
            const imageSrc = this.src;
            const fileName = imageSrc.split('/').pop();
            const decodedFileName = decodeURIComponent(fileName);
            const member = memberData[decodedFileName] || memberData[fileName];

            if (member && imageModal && modalImage) {
                modalImage.src = imageSrc;
                modalImage.alt = member.name;
                modalName.textContent = member.name;
                modalRole.textContent = member.role;
                modalImage.classList.remove('zoomed');
                imageModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // 이미지 클릭으로 확대/축소
    if (modalImage) {
        modalImage.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('zoomed');
        });
    }

    // 모달 닫기 버튼
    if (imageClose) {
        imageClose.addEventListener('click', closeImageModal);
    }

    // 모달 배경 클릭시 닫기
    if (imageModal) {
        imageModal.addEventListener('click', function (e) {
            if (e.target === imageModal) {
                closeImageModal();
            }
        });
    }

    // ESC 키로 닫기
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && imageModal.classList.contains('active')) {
            closeImageModal();
        }
    });

    function closeImageModal() {
        if (imageModal) {
            imageModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            modalImage.classList.remove('zoomed');
        }
    }
}

// 플로팅 도형 생성
function initializeFloatingShapes() {
    const container = document.getElementById('floatingShapes');
    const shapes = ['circle', 'square', 'triangle'];

    function createShape() {
        const shape = document.createElement('div');
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        const size = Math.random() * 60 + 20;

        shape.className = `shape ${shapeType}`;
        shape.style.left = Math.random() * 100 + 'vw';
        shape.style.animationDuration = (Math.random() * 15 + 10) + 's';
        shape.style.animationDelay = Math.random() * 5 + 's';

        if (shapeType === 'circle' || shapeType === 'square') {
            shape.style.width = size + 'px';
            shape.style.height = size + 'px';
        } else if (shapeType === 'triangle') {
            const triangleSize = size / 2;
            shape.style.borderLeft = triangleSize + 'px solid transparent';
            shape.style.borderRight = triangleSize + 'px solid transparent';
            shape.style.borderBottom = size + 'px solid rgba(255, 255, 255, 0.1)';
        }

        container.appendChild(shape);

        // 애니메이션 완료 후 제거
        setTimeout(() => {
            if (container.contains(shape)) {
                container.removeChild(shape);
            }
        }, 25000);
    }

    // 초기 도형들 생성
    for (let i = 0; i < 15; i++) {
        setTimeout(createShape, i * 1000);
    }

    // 지속적으로 새 도형 생성
    setInterval(createShape, 2000);
}


// 인터랙티브 효과 초기화
function initializeInteractiveEffects() {
    const lightRays = document.getElementById('lightRays');
    const heroSection = document.getElementById('hero');

    // 마우스 움직임에 따른 빛줄기 효과
    if (lightRays && heroSection) {
        heroSection.addEventListener('mousemove', function (e) {
            const rect = heroSection.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            lightRays.style.setProperty('--mouse-x', x + '%');
            lightRays.style.setProperty('--mouse-y', y + '%');
        });
    }

    // 스크롤에 따른 배경 색상 변화
    let scrollTicking = false;
    function updateBackgroundOnScroll() {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const hueRotation = scrollPercent * 60; // 0도에서 60도까지 회전

        const gradient = document.querySelector('.animated-gradient');
        if (gradient) {
            gradient.style.filter = `blur(2px) brightness(1.1) hue-rotate(${hueRotation}deg)`;
        }

        scrollTicking = false;
    }

    window.addEventListener('scroll', function () {
        if (!scrollTicking) {
            requestAnimationFrame(updateBackgroundOnScroll);
            scrollTicking = true;
        }
    });

    // 클릭 효과 - 파티클 폭발 (이미지가 아닌 배경 클릭시만)
    heroSection.addEventListener('click', function (e) {
        // 클릭한 요소가 이미지나 버튼, 링크가 아닌 경우에만 폭발 효과 실행
        if (!e.target.closest('img, button, a, .clickable-image')) {
            createClickExplosion(e.clientX, e.clientY);
        }
    });
}

// 클릭 폭발 효과
function createClickExplosion(x, y) {
    const heroSection = document.getElementById('hero');
    const rect = heroSection.getBoundingClientRect();

    for (let i = 0; i < 12; i++) {
        const spark = document.createElement('div');
        spark.style.cssText = `
                    position: absolute;
                    left: ${x - rect.left}px;
                    top: ${y - rect.top}px;
                    width: 4px;
                    height: 4px;
                    background: ${['var(--color-primary)', 'var(--color-secondary)', 'var(--color-tertiary)', '#96CEB4', '#FECA57'][Math.floor(Math.random() * 5)]};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 30;
                    animation: sparkFly 1s ease-out forwards;
                `;

        // 랜덤 방향으로 날아가기
        const angle = (i / 12) * 2 * Math.PI;
        const distance = 50 + Math.random() * 100;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;

        spark.style.setProperty('--end-x', endX + 'px');
        spark.style.setProperty('--end-y', endY + 'px');

        heroSection.appendChild(spark);

        // 제거
        setTimeout(() => {
            if (heroSection.contains(spark)) {
                heroSection.removeChild(spark);
            }
        }, 1000);
    }
}

// 파티클 폭발 애니메이션
const sparkFlyKeyframes = `
            @keyframes sparkFly {
                0% {
                    transform: translate(0, 0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(var(--end-x), var(--end-y)) scale(0);
                    opacity: 0;
                }
            }
        `;

// 스타일 추가
const sparkStyle = document.createElement('style');
sparkStyle.textContent = sparkFlyKeyframes;
document.head.appendChild(sparkStyle);

// Anime.js 애니메이션 초기화
function initializeAnimeAnimations() {
    // 1. 네비게이션 로고 애니메이션
    anime({
        targets: '.nav-logo',
        scale: [0, 1],
        rotate: [180, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutBounce',
        delay: 500
    });

    // 2. Hero 타이틀은 기존 CSS 애니메이션 사용 (원복)

    // 3. 앨범 커버 3D 플립 효과
    anime({
        targets: '.album-card',
        rotateY: [-90, 0],
        translateZ: [100, 0],
        opacity: [0, 1],
        duration: 1500,
        delay: anime.stagger(300, { start: 2000 }),
        easing: 'easeOutBack'
    });

    // 4. 멤버 카드 순차적 등장
    anime({
        targets: '.member-card',
        translateY: [60, 0],
        opacity: [0, 1],
        scale: [0.8, 1],
        rotate: [5, 0],
        duration: 1200,
        delay: anime.stagger(200, { start: 1500 }),
        easing: 'easeOutCubic'
    });

    // 7. 스크롤 트리거 섹션별 애니메이션
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');

                anime({
                    targets: entry.target,
                    scale: [0.5, 1],
                    opacity: [0, 1],
                    rotate: [10, 0],
                    duration: 1000,
                    easing: 'easeOutElastic(1, .8)'
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-title').forEach(el => {
        sectionObserver.observe(el);
    });

    // 10. 페이지 전환 액체 효과 (네비게이션 링크 클릭시)
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // 액체 전환 애니메이션
                const liquidTransition = document.getElementById('liquidTransition');

                anime({
                    targets: liquidTransition,
                    scaleX: [0, 1],
                    duration: 800,
                    easing: 'easeInOutCubic',
                    complete: function () {
                        // 스크롤 이동
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });

                        // 액체 효과 되돌리기
                        anime({
                            targets: liquidTransition,
                            scaleX: [1, 0],
                            duration: 800,
                            easing: 'easeInOutCubic',
                            delay: 300
                        });
                    }
                });
            }
        });
    });

    // 추가 인터랙티브 애니메이션
    // 버튼 호버 효과 강화
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function () {
            anime({
                targets: this,
                scale: 1.05,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });

        button.addEventListener('mouseleave', function () {
            anime({
                targets: this,
                scale: 1,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    });

    // 입장 시퀀스 완료 후 추가 효과들
    setTimeout(() => {
        // 배경 요소들 미세한 움직임
        anime({
            targets: '.floating-shapes .shape',
            translateY: () => anime.random(-20, 20),
            duration: 3000,
            loop: true,
            direction: 'alternate',
            easing: 'easeInOutSine',
            delay: anime.stagger(200)
        });
    }, 4000);
}

// 중복 함수 제거 완료

// 오프닝 영상 제어
function initializeOpening() {
    const openingOverlay = document.getElementById('openingOverlay');
    const openingVideo = document.getElementById('openingVideo');
    const mainContent = document.getElementById('mainContent');
    let openingCompleted = false;

    // 오프닝 종료 함수
    async function endOpening() {
        if (openingCompleted) return;
        openingCompleted = true;

        console.log('🎬 Ending opening sequence...');

        // 오버레이 페이드 아웃
        openingOverlay.classList.add('hidden');

        // 메인 컨텐츠 페이드 인
        setTimeout(() => {
            mainContent.classList.add('visible');
            document.body.classList.remove('opening-active');
        }, 500);

        // 오프닝 종료 후 기타 사운드 재생
        setTimeout(async () => {
            console.log('🎸 Playing welcome guitar sound after opening...');
            try {
                await createGuitarStrum();
            } catch (e) {
                console.error('Failed to play guitar sound:', e);
            }
        }, 1000);

        // 오버레이 완전 제거
        setTimeout(() => {
            if (openingOverlay.parentNode) {
                openingOverlay.remove();
            }
        }, 2000);
    }

    // 영상 종료 시 자동으로 메인 페이지로
    openingVideo.addEventListener('ended', () => {
        console.log('🎬 Opening video ended');
        endOpening();
    });

    // 영상 로드 에러 처리
    openingVideo.addEventListener('error', (e) => {
        console.error('❌ Opening video error:', e);
        endOpening();
    });

    // 영상 재생 시작 로그
    openingVideo.addEventListener('play', () => {
        console.log('▶️ Opening video started playing with sound');
    });

    // 영상 볼륨 확인
    openingVideo.addEventListener('loadedmetadata', () => {
        console.log('📹 Opening video metadata loaded');
        console.log('🔊 Video muted:', openingVideo.muted);
        console.log('🔊 Video volume:', openingVideo.volume);

        // 볼륨 설정
        openingVideo.volume = 1.0;
        openingVideo.muted = false;
    });

    // 비디오가 로드되면 재생 시도
    openingVideo.addEventListener('canplay', () => {
        console.log('📹 Opening video ready to play');

        // 사용자 인터랙션 후 재생 (브라우저 정책)
        const playVideo = async () => {
            try {
                openingVideo.muted = false;
                openingVideo.volume = 1.0;
                await openingVideo.play();
                console.log('✅ Video playing with sound');
            } catch (error) {
                console.warn('⚠️ Autoplay with sound prevented, trying muted:', error);
                // 소리가 안되면 일단 음소거로 재생
                openingVideo.muted = true;
                await openingVideo.play();
                console.log('⚠️ Video playing muted - click to unmute');

                // 클릭하면 소리 켜기
                const unmute = () => {
                    openingVideo.muted = false;
                    openingVideo.volume = 1.0;
                    console.log('🔊 Video unmuted');
                    document.removeEventListener('click', unmute);
                };
                document.addEventListener('click', unmute, { once: true });
            }
        };

        playVideo();
    });
}

// DOM 로드 시 오프닝 초기화
document.addEventListener('DOMContentLoaded', function () {
    // 오프닝 초기화
    initializeOpening();

    // 메인 앱 초기화 (기존 코드)
    initializeApp();

    console.log('🎸 하나비 website initialized with opening sequence');
});

// ===== 기획자 관점 새로운 기능들 =====

// 팬 참여형 인터랙티브 기능
function initializeFanEngagement() {
    const fanMessageForm = document.getElementById('fanMessageForm');
    const fanMessages = document.getElementById('fanMessages');
    let messageId = 0;

    // 초기 더미 메시지들
    const initialMessages = [
        { name: '별빛팬', mood: '🎸', message: '새 앨범 너무 기대돼요! 하나비 최고!', time: '2분 전' },
        { name: '록스타', mood: '🔥', message: '라이브 공연 언제 또 하나요? 꼭 보러 갈게요!', time: '5분 전' },
        { name: '몽환러버', mood: '✨', message: '별빛 속삭임 들으면서 잠들어요.. 너무 좋아요', time: '8분 전' },
        { name: '음악덕후', mood: '💖', message: '하나비 덕분에 인디음악에 빠졌어요! 감사합니다', time: '12분 전' }
    ];

    // 초기 메시지 표시
    initialMessages.forEach(msg => displayMessage(msg));

    // 메시지 표시 함수
    function displayMessage(msg) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'fan-message bg-dark rounded-lg p-4 border-l-4 border-primary';
        messageDiv.innerHTML = `
                    <div class="flex items-start gap-3">
                        <span class="text-2xl">${msg.mood}</span>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-semibold text-primary">${msg.name}</span>
                                <span class="text-xs text-gray-400">${msg.time}</span>
                            </div>
                            <p class="text-gray-300 text-sm">${msg.message}</p>
                        </div>
                    </div>
                `;
        fanMessages.insertBefore(messageDiv, fanMessages.firstChild);

        // 최대 10개 메시지만 유지
        while (fanMessages.children.length > 10) {
            fanMessages.removeChild(fanMessages.lastChild);
        }
    }

    // 폼 제출 처리
    if (fanMessageForm) {
        fanMessageForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nameInput = document.getElementById('fanName');
            const moodSelect = document.getElementById('fanMood');
            const messageInput = document.getElementById('fanMessage');

            if (nameInput.value.trim() && messageInput.value.trim()) {
                const newMessage = {
                    name: nameInput.value.trim(),
                    mood: moodSelect.value,
                    message: messageInput.value.trim(),
                    time: '방금 전'
                };

                displayMessage(newMessage);

                // 통계 업데이트
                const totalMessages = document.getElementById('totalMessages');
                if (totalMessages) {
                    const current = parseInt(totalMessages.textContent.replace(',', ''));
                    totalMessages.textContent = (current + 1).toLocaleString();
                }

                // 폼 리셋
                nameInput.value = '';
                messageInput.value = '';

                // 성공 피드백
                showNotification('메시지가 전송되었습니다! ✨', 'success');

                // 애니메이션 효과
                anime({
                    targets: fanMessages.firstChild,
                    scale: [0.8, 1],
                    opacity: [0, 1],
                    duration: 500,
                    easing: 'easeOutElastic(1, .8)'
                });
            }
        });
    }

    // 투표 기능
    const votingOptions = document.querySelectorAll('.voting-option');
    const userVotes = new Set(); // 사용자가 이미 투표한 곡들

    votingOptions.forEach(option => {
        option.addEventListener('click', function () {
            const songId = this.dataset.song;

            if (userVotes.has(songId)) {
                showNotification('이미 이 곡에 투표하셨습니다!', 'warning');
                return;
            }

            userVotes.add(songId);

            // 투표 수 증가
            const voteElement = document.getElementById(`votes-${songId}`);
            if (voteElement) {
                const currentVotes = parseInt(voteElement.textContent.replace('표', ''));
                voteElement.textContent = `${currentVotes + 1}표`;

                // 프로그레스 바 업데이트 (간단한 계산)
                const progressBar = this.querySelector('.bg-gradient-to-r');
                if (progressBar) {
                    const currentWidth = parseInt(progressBar.style.width.replace('%', ''));
                    progressBar.style.width = `${Math.min(currentWidth + 1, 100)}%`;
                }
            }

            // 시각적 피드백
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);

            showNotification('투표가 완료되었습니다! 🗳️', 'success');
        });
    });

    console.log('✅ Fan engagement features initialized');
}

// 데이터 기반 분석 시스템
function initializeDataAnalytics() {
    // 실시간 통계 업데이트
    function updateLiveStats() {
        const stats = {
            onlineVisitors: document.getElementById('onlineVisitors'),
            todayViews: document.getElementById('todayViews'),
            fanRating: document.getElementById('fanRating')
        };

        // 랜덤 변화 시뮬레이션 (실제로는 서버에서 데이터를 받아옴)
        setInterval(() => {
            if (stats.onlineVisitors) {
                const current = parseInt(stats.onlineVisitors.textContent);
                const change = Math.floor(Math.random() * 10) - 5; // -5 ~ +5
                const newValue = Math.max(100, current + change);
                stats.onlineVisitors.textContent = newValue;

                // 변화 애니메이션
                anime({
                    targets: stats.onlineVisitors,
                    scale: [1, 1.1, 1],
                    duration: 600,
                    easing: 'easeOutElastic(1, .8)'
                });
            }
        }, 10000); // 10초마다 업데이트

        if (stats.todayViews) {
            setInterval(() => {
                const current = parseInt(stats.todayViews.textContent.replace(',', ''));
                const newValue = current + Math.floor(Math.random() * 3);
                stats.todayViews.textContent = newValue.toLocaleString();
            }, 15000); // 15초마다 업데이트
        }
    }

    // 사용자 행동 추적
    function trackUserBehavior() {
        const events = ['scroll', 'click', 'mouseover'];
        const sessionData = {
            startTime: Date.now(),
            interactions: 0,
            sectionsVisited: new Set(),
            timeSpent: {}
        };

        events.forEach(event => {
            document.addEventListener(event, function (e) {
                sessionData.interactions++;

                // 섹션 방문 추적
                const target = e.target.closest('section');
                if (target && target.id) {
                    sessionData.sectionsVisited.add(target.id);
                }
            });
        });

        // 이탈 시 데이터 전송
        window.addEventListener('beforeunload', function () {
            const sessionSummary = {
                duration: Date.now() - sessionData.startTime,
                interactions: sessionData.interactions,
                sectionsVisited: Array.from(sessionData.sectionsVisited),
                device: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
            };

            // 실제로는 서버로 전송
            console.log('📊 Session analytics:', sessionSummary);
        });
    }

    updateLiveStats();
    trackUserBehavior();

    console.log('📊 Data analytics system initialized');
}

// 소셜 미디어 통합 및 공유 기능
function initializeSocialIntegration() {
    const shareButtons = document.querySelectorAll('.share-btn');
    const socialCards = document.querySelectorAll('.social-card');

    // 공유 기능
    shareButtons.forEach(button => {
        button.addEventListener('click', function () {
            const platform = this.dataset.platform;
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent('하나비 (Hanabi) - 시네마틱한 인디 록 밴드');
            const description = encodeURIComponent('꿈과 현실의 경계를 흐리는 인디 록 밴드 하나비의 공식 웹사이트');

            let shareUrl = '';

            switch (platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${title}%20${url}`;
                    break;
                case 'copy':
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        showNotification('링크가 복사되었습니다! 🔗', 'success');
                    });
                    return;
            }

            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
                showNotification(`${platform}에 공유하기 창이 열렸습니다!`, 'success');
            }
        });
    });

    // 소셜 미디어 카드 클릭
    socialCards.forEach(card => {
        card.addEventListener('click', function () {
            const platform = this.querySelector('h4').textContent;
            showNotification(`${platform} 페이지로 이동합니다!`, 'info');

            // 실제로는 각 플랫폼의 실제 URL로 이동
            // window.open('실제_소셜미디어_URL', '_blank');
        });
    });

    console.log('🌐 Social media integration initialized');
}

// 콘텐츠 관리 및 업데이트 시스템
function initializeContentManagement() {
    // 최근 활동 업데이트
    function updateRecentActivity() {
        const recentActivity = document.getElementById('recentActivity');
        if (!recentActivity) return;

        const activities = [
            { icon: '🎵', text: '새로운 곡 "별빛 속삭임" 업로드', time: '2시간 전' },
            { icon: '📸', text: '스튜디오 레코딩 비하인드 사진', time: '6시간 전' },
            { icon: '🎤', text: '홍대 클럽 라이브 공연 예정', time: '1일 전' },
            { icon: '💬', text: '팬미팅 일정 공지', time: '2일 전' }
        ];

        recentActivity.innerHTML = activities.map(activity => `
                    <div class="flex items-center gap-3 p-3 bg-dark rounded-lg hover:bg-gray-700 transition-colors">
                        <span class="text-xl">${activity.icon}</span>
                        <div class="flex-1">
                            <p class="text-white text-sm">${activity.text}</p>
                            <p class="text-gray-400 text-xs">${activity.time}</p>
                        </div>
                    </div>
                `).join('');
    }

    // 추천 시스템
    function updateRecommendations() {
        const recommendations = document.getElementById('recommendations');
        if (!recommendations) return;

        const recs = [
            { icon: '🎧', text: 'Spotify에서 하나비 플레이리스트 듣기', action: 'spotify' },
            { icon: '🔔', text: '새 곡 알림 설정하기', action: 'notifications' },
            { icon: '👕', text: '한정판 굿즈 확인하기', action: 'merchandise' }
        ];

        recommendations.innerHTML = recs.map(rec => `
                    <button class="recommendation-btn w-full text-left p-3 bg-dark rounded-lg hover:bg-gray-700 transition-colors" data-action="${rec.action}">
                        <div class="flex items-center gap-3">
                            <span class="text-xl">${rec.icon}</span>
                            <span class="text-white text-sm">${rec.text}</span>
                        </div>
                    </button>
                `).join('');

        // 추천 버튼 이벤트
        recommendations.querySelectorAll('.recommendation-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const action = this.dataset.action;
                showNotification(`${action} 기능으로 이동합니다!`, 'info');
            });
        });
    }

    updateRecentActivity();
    updateRecommendations();

    console.log('📝 Content management system initialized');
}

// 사용자 여정 최적화
function initializeUserJourney() {
    const quickActions = document.querySelectorAll('.quick-action');

    // 빠른 액션 버튼들
    quickActions.forEach(button => {
        button.addEventListener('click', function () {
            const action = this.dataset.action;

            switch (action) {
                case 'newsletter':
                    // 뉴스레터 구독 모달 열기
                    showNewsletterModal();
                    break;
                case 'tour':
                    // 투어 알림 설정
                    showTourNotificationModal();
                    break;
                case 'merchandise':
                    // 굿즈 페이지로 이동
                    showMerchandiseModal();
                    break;
            }
        });
    });

    // 스크롤 기반 사용자 행동 분석
    let scrollBehavior = {
        maxScroll: 0,
        scrollSessions: [],
        currentSession: { start: Date.now(), scrolls: 0 }
    };

    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        scrollBehavior.maxScroll = Math.max(scrollBehavior.maxScroll, scrollPercent);
        scrollBehavior.currentSession.scrolls++;
    });

    // 페이지 이탈 시 스크롤 패턴 분석
    window.addEventListener('beforeunload', () => {
        scrollBehavior.currentSession.duration = Date.now() - scrollBehavior.currentSession.start;
        console.log('📈 Scroll behavior analysis:', scrollBehavior);
    });

    console.log('🎯 User journey optimization initialized');
}

// 유틸리티 함수들
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-semibold shadow-2xl transform translate-x-full transition-transform duration-300`;

    switch (type) {
        case 'success':
            notification.classList.add('bg-green-600');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-600');
            break;
        case 'error':
            notification.classList.add('bg-red-600');
            break;
        default:
            notification.classList.add('bg-blue-600');
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // 애니메이션으로 표시
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // 3초 후 제거
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function showNewsletterModal() {
    showNotification('뉴스레터 구독 기능이 곧 추가됩니다! 📧', 'info');
}

function showTourNotificationModal() {
    showNotification('투어 알림 설정이 활성화되었습니다! 🎤', 'success');
}

function showMerchandiseModal() {
    showNotification('굿즈 스토어가 곧 오픈됩니다! 👕', 'info');
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .catch(error => {
                console.error('❌ Service Worker registration failed:', error);
            });
    });
} else {
    console.warn('⚠️ Service Worker not supported in this browser');
}

function initializePracticeLog() {
    const grid = document.getElementById('practiceGrid');
    const totalPracticesEl = document.getElementById('totalPractices');
    const currentStreakEl = document.getElementById('currentStreak');

    if (!grid) return;

    // Configuration
    const startDate = new Date('2025-05-03'); // First Saturday of May 2025
    const endDate = new Date('2025-12-31');
    const today = new Date();
    const exceptionDate = '2025-11-22'; // Vocalist's Wedding

    let currentDate = new Date(startDate);
    let totalPractices = 0;
    let currentStreak = 0;
    let streakBroken = false;

    // Generate weeks
    const weeks = [];
    while (currentDate <= endDate) {
        weeks.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 7);
    }

    // Calculate stats first (backwards for streak)
    const pastWeeks = weeks.filter(date => date < today);
    for (let i = pastWeeks.length - 1; i >= 0; i--) {
        const dateStr = pastWeeks[i].toISOString().split('T')[0];
        if (dateStr === exceptionDate) {
            // Exception doesn't break streak if authorized, but here user said "streak"
            // Let's assume it doesn't count towards streak but doesn't reset it to 0?
            // Or maybe it breaks it? User said "never missed until now".
            // Since Nov 22 is tomorrow, the streak is valid up to today.
        } else {
            if (!streakBroken) currentStreak++;
        }
    }

    // Render Grid
    weeks.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        const isPast = date < today;
        const isException = dateStr === exceptionDate;

        const weekEl = document.createElement('div');
        weekEl.className = 'flex-shrink-0 w-8 h-8 rounded transition-all duration-300 hover:scale-110 cursor-pointer relative group';

        // Determine status and style
        if (isException) {
            weekEl.classList.add('bg-pink-500', 'shadow-[0_0_10px_rgba(236,72,153,0.5)]');
            weekEl.setAttribute('data-status', 'special');
        } else if (isPast) {
            weekEl.classList.add('bg-primary', 'shadow-[0_0_10px_rgba(139,92,246,0.5)]');
            weekEl.setAttribute('data-status', 'completed');
            totalPractices++;
        } else {
            weekEl.classList.add('bg-gray-800', 'border', 'border-gray-700');
            weekEl.setAttribute('data-status', 'planned');
        }

        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 border border-gray-700';

        let statusText = isException ? '💍 보컬 결혼식' : (isPast ? '✅ 합주 완료' : '📅 합주 예정');
        tooltip.textContent = `${date.getMonth() + 1}월 ${date.getDate()}일: ${statusText}`;

        weekEl.appendChild(tooltip);
        grid.appendChild(weekEl);
    });

    // Update Stats
    totalPracticesEl.textContent = totalPractices;

    // Animate Streak Counter
    let count = 0;
    const interval = setInterval(() => {
        if (count >= currentStreak) {
            clearInterval(interval);
            currentStreakEl.textContent = currentStreak + '주';
        } else {
            count++;
            currentStreakEl.textContent = count;
        }
    }, 50);
}
