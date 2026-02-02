// =================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ КАРЬЕРЫ ===================
// =================== ИСПРАВЛЕНИЕ МОДАЛЬНЫХ ОКОН ===================

// Получает путь к логотипу команды
function getTeamLogoPath(teamName) {
    const logoMap = {
        'Mercedes': 'data/assets/f1.png', // Используем общий логотип F1, если нет конкретного
        'Ferrari': 'data/assets/Ferrari.png',
        'Red Bull Racing': 'data/assets/RB_logo.png',
        'McLaren': 'data/assets/MacL_logo.jpg',
        'Aston Martin': 'data/assets/Aston_Martin.png',
        'Alpine': 'data/assets/Alpine_logo.png',
        'Williams': 'data/assets/Logo_Williams_F1.png',
        'AlphaTauri': 'data/assets/Alpha_Tauri_brand_logo.png',
        'Alfa Romeo': 'data/assets/Alfa-Romeo_logo.png',
        'Haas': 'data/assets/Haas_F1_Team_Logo.svg.png',
        'Cadilac': 'data/assets/f1.png' // Используем общий логотип, если нет конкретного
    };
    
    // Проверяем точное совпадение
    if (logoMap[teamName]) {
        return logoMap[teamName];
    }
    
    // Проверяем частичное совпадение (для пользовательских команд)
    for (const [key, path] of Object.entries(logoMap)) {
        if (teamName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(teamName.toLowerCase())) {
            return path;
        }
    }
    
    // Возвращаем общий логотип F1 по умолчанию
    return 'data/assets/f1.png';
}

// Показывает модальное окно
function showModal(modalId) {
    // Скрываем все модальные окна
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    
    // Показываем нужное окно
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}
// Инициализация игры (добавьте в начало)
function initGame() {
    console.log('Инициализация игры...');
    
    // Останавливаем анимацию если она запущена
    stopAnimation();
    
    // Сбрасываем состояние гонки
    careerState.raceStarted = false;
    careerState.raceFinished = false;
    careerState.isPaused = true;
    careerState.currentLap = 0;
    careerState.cars = [];
    
    // Очищаем интерфейс
    const canvas = document.getElementById('track-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0a1a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#4db8ff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Подготовка к гонке...', canvas.width / 2, canvas.height / 2);
    }
    
    // Очищаем таблицу
    const tbody = document.getElementById('standings-body');
    if (tbody) tbody.innerHTML = '';
    
    // Обновляем информацию
    updateRaceInfo();
    
    console.log('Игра инициализирована');
}
// Скрывает модальное окно
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Закрывает модальное окно при клике вне его
function setupModalCloseListeners() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                this.style.display = 'none';
            }
        });
    });
}

// Создает кнопку закрытия для модальных окон
function addCloseButtonsToModals() {
    document.querySelectorAll('.modal-content').forEach(content => {
        // Проверяем, нет ли уже кнопки закрытия
        if (!content.querySelector('.modal-close')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'modal-close';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = function() {
                this.closest('.modal').classList.remove('active');
                this.closest('.modal').style.display = 'none';
            };
            content.style.position = 'relative';
            content.appendChild(closeBtn);
        }
    });
}

// =================== ОБНОВЛЕННАЯ ИНИЦИАЛИЗАЦИЯ ===================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализируем игру...');
    
    // Настраиваем модальные окна
    setupModalCloseListeners();
    addCloseButtonsToModals();
    
    // Настраиваем обработчики событий для формы и стратегии
    setupFormHandlers();
    setupStrategyHandlers();

    // Пытаемся загрузить сохранённую карьеру
    const loaded = loadCareer();
    if (!loaded) {
        // Если сохранения нет — показываем окно создания карьеры
        showModal('career-setup-modal');
    }

    // Заполняем календарь
    populateCalendar();
    
    // Запускаем анимацию
    requestAnimationFrame(updateAnimation);
    
    console.log('Игра инициализирована');
});

// Клики по блокам стратегии
function setupStrategyHandlers() {
    document.querySelectorAll('.strategy-option').forEach(option => {
        option.addEventListener('click', () => {
            const id = option.id || '';
            const match = id.match(/strategy-(\d+)/);
            if (!match) return;
            selectStrategy(parseInt(match[1], 10));
        });
    });
}

// =================== СОХРАНЕНИЕ / ЗАГРУЗКА КАРЬЕРЫ ===================
// Подготавливает данные для сохранения (без временных полей и объектов гонки)
function getCareerSaveData() {
    const {
        raceInterval,
        animationId,
        currentTrack,
        cars,
        raceStarted,
        raceFinished,
        isPaused,
        currentLap,
        totalLaps,
        lastUpdate,
        raceStartTime,
        ...rest
    } = careerState;
    return rest;
}

// Сохраняет карьеру в localStorage
function saveCareer() {
    try {
        const data = getCareerSaveData();
        localStorage.setItem(CAREER_SAVE_KEY, JSON.stringify(data));
        addRaceLog('💾 Карьера сохранена');
        alert('Карьера сохранена!');
    } catch (e) {
        console.error('Ошибка сохранения карьеры:', e);
        alert('Не удалось сохранить карьеру. Проверьте настройки браузера.');
    }
}

// Загружает карьеру из localStorage
function loadCareer() {
    try {
        const raw = localStorage.getItem(CAREER_SAVE_KEY);
        if (!raw) {
            return false;
        }
        const data = JSON.parse(raw);
        
        // Сбрасываем текущее состояние и накатываем сохранённое
        careerState = Object.assign(
            JSON.parse(JSON.stringify(initialCareerState)),
            data,
            {
                // Гонка при загрузке всегда не в процессе
                raceStarted: false,
                raceFinished: false,
                isPaused: true,
                currentTrack: null,
                currentLap: 0,
                totalLaps: 0,
                cars: [],
                raceInterval: null,
                animationId: null,
                lastUpdate: 0,
                raceStartTime: null
            }
        );

        // Обновляем интерфейс под загруженную карьеру
        if (typeof updateTeamInfo === 'function') updateTeamInfo();
        if (typeof updateCareerTab === 'function') updateCareerTab();
        if (typeof updateCalendar === 'function') updateCalendar();
        if (typeof updateRaceInfo === 'function') updateRaceInfo();
        if (typeof drawTrack === 'function') drawTrack();

        console.log('Карьера загружена из localStorage', careerState);
        return true;
    } catch (e) {
        console.error('Ошибка загрузки карьеры:', e);
        return false;
    }
}

// Сброс карьеры и начало новой
function resetCareer() {
    if (!confirm('Удалить текущую карьеру и начать новую?')) return;

    try {
        localStorage.removeItem(CAREER_SAVE_KEY);
    } catch (e) {
        console.warn('Не удалось удалить сохранение карьеры:', e);
    }

    // Останавливаем возможную гонку
    if (careerState.raceInterval) {
        clearInterval(careerState.raceInterval);
        careerState.raceInterval = null;
    }
    if (typeof stopAnimation === 'function') {
        stopAnimation();
    }

    // Сбрасываем состояние
    careerState = JSON.parse(JSON.stringify(initialCareerState));

    // Очищаем UI гонки
    const raceLog = document.getElementById('race-log');
    if (raceLog) raceLog.innerHTML = '';
    const lapTimes = document.getElementById('lap-times');
    if (lapTimes) lapTimes.innerHTML = '';

    if (typeof updateTeamInfo === 'function') updateTeamInfo();
    if (typeof updateCareerTab === 'function') updateCareerTab();
    if (typeof updateCalendar === 'function') updateCalendar();
    if (typeof updateRaceInfo === 'function') updateRaceInfo();
    if (typeof drawTrack === 'function') drawTrack();

    // Показываем окно создания новой карьеры
    showModal('career-setup-modal');
}

// Настраивает обработчики событий формы
function setupFormHandlers() {
    // Обработчик для кнопки начала карьеры
    const startCareerBtn = document.querySelector('.start-career-btn');
    if (startCareerBtn) {
        startCareerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Кнопка начала карьеры нажата');
            startCareer();
        });
    }
    
    // Обработчики для полей ввода (чтобы Enter тоже работал)
    const inputs = document.querySelectorAll('#career-setup-modal input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                startCareer();
            }
        });
    });
    
    // Обработчик для селекта сложности
    const difficultyOptions = document.querySelectorAll('.difficulty-option input');
    difficultyOptions.forEach(option => {
        option.addEventListener('change', function() {
            console.log('Выбрана сложность:', this.value);
        });
    });
}
const CAREER_SAVE_KEY = 'f1_career_save_v1';

const initialCareerState = {
    // Основные данные
    season: 2024,
    currentRace: 1,
    totalRaces: 20,
    playerTeamName: 'Моя команда',
    driverNames: ['Пилот #1', 'Пилот #2'],
    
    // Прогресс
    raceStarted: false,
    raceFinished: false,
    isPaused: true,
    
    // Статистика
    teamPoints: 0,
    teamBudget: 50, // в миллионах евро
    teamUpgrades: {
        aero: 1,
        engine: 1,
        chassis: 1
    },
    
    // Гонка
    currentTrack: null,
    currentLap: 0,
    totalLaps: 0,
    cars: [],
    fastestLap: { driver: '', time: 9999, team: '' },
    
    // Чемпионат
    constructorsStandings: [],
    driversStandings: [],
    raceResults: [],
    difficulty: 'medium',
    
    // Игровой процесс
    simulationSpeed: 1,
    raceInterval: null,
    animationId: null,
    lastUpdate: 0,
    raceStartTime: null
};

// Текущее состояние карьеры (может перезаписываться при загрузке сохранения)
let careerState = JSON.parse(JSON.stringify(initialCareerState));

// Конфигурация шин с реалистичными параметрами
const tireConfigs = {
    soft: { 
        name: 'Soft', 
        color: '#FF0000', 
        wearRate: 3.0,       // Износ за круг
        baseLapTime: 95.0,   // Базовое время круга
        life: 15,            // Количество кругов жизни
        grip: 1.2,           // Коэффициент сцепления
        degradation: 0.8     // Скорость деградации
    },
    medium: { 
        name: 'Medium', 
        color: '#FFFF00', 
        wearRate: 1.8,
        baseLapTime: 97.0,
        life: 25,
        grip: 1.0,
        degradation: 0.5
    },
    hard: { 
        name: 'Hard', 
        color: '#FFFFFF', 
        wearRate: 1.0,
        baseLapTime: 99.0,
        life: 40,
        grip: 0.9,
        degradation: 0.3
    }
};

// Система очков F1
const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

// Команды F1 с реалистичными характеристиками
const f1Teams = [
    { 
        name: 'Mercedes', 
        color: '#00D2BE', 
        drivers: ['Antonelli', 'Russell'],
        performance: { aero: 0.9, engine: 0.95, chassis: 0.9, reliability: 0.95 }
    },
    { 
        name: 'Ferrari', 
        color: '#DC0000', 
        drivers: ['Leclerc', 'Hamilton'],
        performance: { aero: 0.95, engine: 0.9, chassis: 0.95, reliability: 0.9 }
    },
    { 
        name: 'Red Bull Racing', 
        color: '#0600EF', 
        drivers: ['Verstappen', 'Hajar'],
        performance: { aero: 0.98, engine: 0.92, chassis: 0.98, reliability: 0.92 }
    },
    { 
        name: 'McLaren', 
        color: '#FF8700', 
        drivers: ['Norris', 'Piastri'],
        performance: { aero: 0.85, engine: 0.85, chassis: 0.88, reliability: 0.88 }
    },
    { 
        name: 'Aston Martin', 
        color: '#006F62', 
        drivers: ['Alonso', 'Stroll'],
        performance: { aero: 0.87, engine: 0.82, chassis: 0.85, reliability: 0.85 }
    },
    { 
        name: 'Alpine', 
        color: '#0090FF', 
        drivers: ['Gasly', 'Ocon'],
        performance: { aero: 0.82, engine: 0.87, chassis: 0.82, reliability: 0.82 }
    },
    { 
        name: 'Williams', 
        color: '#005AFF', 
        drivers: ['Albon', 'Sainz'],
        performance: { aero: 0.75, engine: 0.8, chassis: 0.78, reliability: 0.8 }
    },
    { 
        name: 'AlphaTauri', 
        color: '#2B4562', 
        drivers: ['Ricciardo', 'Tsunoda'],
        performance: { aero: 0.78, engine: 0.75, chassis: 0.8, reliability: 0.78 }
    },
    { 
        name: 'Cadilac', 
        color: '#900000', 
        drivers: ['Bottas', 'Perez'],
        performance: { aero: 0.8, engine: 0.78, chassis: 0.75, reliability: 0.75 }
    },
    { 
        name: 'Haas', 
        color: '#FFFFFF', 
        drivers: ['Magnussen', 'Hulkenberg'],
        performance: { aero: 0.77, engine: 0.77, chassis: 0.77, reliability: 0.77 }
    }
];

// Начинает новую карьеру
// Начинает новую карьеру (ИСПРАВЛЕННАЯ ВЕРСИЯ)
function startCareer() {
    console.log('Функция startCareer вызвана');
    
    // Получаем значения из формы
    const teamNameInput = document.getElementById('career-team-name');
    const driver1Input = document.getElementById('driver1-name-input');
    const driver2Input = document.getElementById('driver2-name-input');
    const budgetSelect = document.getElementById('starting-budget');
    const difficultyRadio = document.querySelector('input[name="difficulty"]:checked');
    
    // Проверяем, что все элементы существуют
    if (!teamNameInput || !driver1Input || !driver2Input || !budgetSelect || !difficultyRadio) {
        console.error('Не найдены элементы формы:', {
            teamNameInput: !!teamNameInput,
            driver1Input: !!driver1Input,
            driver2Input: !!driver2Input,
            budgetSelect: !!budgetSelect,
            difficultyRadio: !!difficultyRadio
        });
        alert('Ошибка загрузки формы. Пожалуйста, обновите страницу.');
        return;
    }
    
    const teamName = teamNameInput.value.trim();
    const driver1 = driver1Input.value.trim();
    const driver2 = driver2Input.value.trim();
    const budget = parseInt(budgetSelect.value);
    const difficulty = difficultyRadio.value;
    
    console.log('Получены данные:', { teamName, driver1, driver2, budget, difficulty });
    
    // Валидация
    if (!teamName) {
        alert('Пожалуйста, введите название команды!');
        teamNameInput.focus();
        return;
    }
    
    if (!driver1) {
        alert('Пожалуйста, введите имя первого пилота!');
        driver1Input.focus();
        return;
    }
    
    if (!driver2) {
        alert('Пожалуйста, введите имя второго пилота!');
        driver2Input.focus();
        return;
    }
    
    if (driver1 === driver2) {
        alert('Имена пилотов должны быть разными!');
        driver1Input.focus();
        return;
    }
    
    // Сохраняем настройки
    careerState.playerTeamName = teamName;
    careerState.driverNames = [driver1, driver2];
    careerState.teamBudget = budget;
    careerState.difficulty = difficulty;
    
    console.log('Настройки сохранены:', careerState);
    
    try {
        // Инициализируем чемпионат
        initializeChampionship();
        
        // Скрываем модальное окно
        hideModal('career-setup-modal');
        console.log('Модальное окно скрыто');
        
        // Обновляем интерфейс
        updateTeamInfo();
        updateCareerTab();
        
        // Начинаем первую гонку
        setTimeout(() => {
            startNextRace();
        }, 100);
        
        // Добавляем запись в лог
        addRaceLog(`🎯 Начата новая карьера в сезоне ${careerState.season}`);
        addRaceLog(`🏎️ Команда: ${careerState.playerTeamName}`);
        addRaceLog(`👤 Пилоты: ${driver1} и ${driver2}`);
        addRaceLog(`💰 Бюджет: €${budget}M`);
        addRaceLog(`⚙️ Сложность: ${getDifficultyText(difficulty)}`);
        
    } catch (error) {
        console.error('Ошибка при начале карьеры:', error);
        alert('Произошла ошибка при запуске карьеры. Пожалуйста, обновите страницу и попробуйте снова.');
    }
}

// Возвращает текст сложности
function getDifficultyText(difficulty) {
    const texts = {
        easy: 'Лёгкая',
        medium: 'Средняя',
        hard: 'Сложная'
    };
    return texts[difficulty] || difficulty;
}

// Инициализирует таблицы чемпионата
function initializeChampionship() {
    // Кубок конструкторов
    careerState.constructorsStandings = f1Teams.map(team => ({
        team: team.name,
        points: 0,
        wins: 0,
        podiums: 0,
        color: team.color
    }));
    
    // Добавляем команду игрока
    careerState.constructorsStandings.push({
        team: careerState.playerTeamName,
        points: 0,
        wins: 0,
        podiums: 0,
        color: '#FF0000'
    });
    
    // Личный зачёт
    careerState.driversStandings = [];
    
    // Пилоты команд F1
    f1Teams.forEach(team => {
        team.drivers.forEach(driver => {
            careerState.driversStandings.push({
                driver: driver,
                team: team.name,
                points: 0,
                wins: 0,
                color: team.color
            });
        });
    });
    
    // Пилоты игрока
    careerState.driverNames.forEach((driver, index) => {
        careerState.driversStandings.push({
            driver: driver,
            team: careerState.playerTeamName,
            points: 0,
            wins: 0,
            color: '#FF0000'
        });
    });
}

// =================== УПРАВЛЕНИЕ ГОНКАМИ ===================
// Начинает следующую гонку
// Начинает следующую гонку (ИСПРАВЛЕННАЯ)
function startNextRace() {
    console.log('Начинаем следующую гонку...');
    
    if (careerState.currentRace > careerState.totalRaces) {
        alert('Сезон завершён!');
        return;
    }
    
    // Инициализируем игру
    initGame();
    
    // Выбираем трассу для текущей гонки
    const trackIndex = (careerState.currentRace - 1) % tracks.length;
    careerState.currentTrack = tracks[trackIndex];
    careerState.totalLaps = careerState.currentTrack.totalLaps;
    
    console.log(`Гонка ${careerState.currentRace}: ${careerState.currentTrack.name}`);
    
    // Обновляем интерфейс
    updateRaceInfo();
    
    // Инициализируем машины
    initializeCars();
    
    // Рисуем трассу
    drawTrack();
    
    // Обновляем таблицу
    updateStandingsTable();
    
    // Переключаемся на вкладку гонки
    switchTab('race');
    
    // Активируем кнопки
    document.getElementById('start-race-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
    document.getElementById('next-race-btn').disabled = true;
    
    // Очищаем лог
    const raceLog = document.getElementById('race-log');
    if (raceLog) raceLog.innerHTML = '';
    
    // Очищаем время кругов
    const lapTimes = document.getElementById('lap-times');
    if (lapTimes) lapTimes.innerHTML = '';
    
    addRaceLog(`📍 Гонка ${careerState.currentRace}/${careerState.totalRaces}: ${careerState.currentTrack.name}`);
    addRaceLog(`📏 Дистанция: ${careerState.totalLaps} кругов`);
    
    // Выбираем стратегию по умолчанию
    selectStrategy(1);
    
    console.log('Гонка готова к старту');
}

// Начинает гонку
function startRace() {
    if (careerState.raceStarted) return;
    
    careerState.raceStarted = true;
    careerState.isPaused = false;
    careerState.lastUpdate = Date.now();
    careerState.raceStartTime = careerState.lastUpdate;
    
    // Обновляем кнопки
    document.getElementById('start-race-btn').disabled = true;
    document.getElementById('pause-btn').disabled = false;
    
    // Добавляем запись в лог
    addRaceLog(`🏁 СТАРТ ГОНКИ!`);
    const playerCar1 = getPlayerCar(0);
    const playerCar2 = getPlayerCar(1);
    if (playerCar1) {
        addRaceLog(`💨 ${careerState.driverNames[0]} стартует с ${playerCar1.position} позиции`);
    }
    if (playerCar2) {
        addRaceLog(`💨 ${careerState.driverNames[1]} стартует с ${playerCar2.position} позиции`);
    }
    if (!careerState.cars || careerState.cars.length === 0) {
        addRaceLog(`⚠️ Ошибка: машины не инициализированы. Сначала начните гонку из календаря/карьеры.`);
        careerState.raceStarted = false;
        careerState.isPaused = true;
        document.getElementById('start-race-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        return;
    }
    
    // Запускаем симуляцию
    if (careerState.raceInterval) clearInterval(careerState.raceInterval);
    // Быстрый тик + delta-время внутри simulateRace (скорость регулируется simulationSpeed)
    careerState.raceInterval = setInterval(simulateRace, 50);

    // Запускаем анимационный цикл (если был остановлен после финиша)
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(updateAnimation);
    }
}

// Ставит гонку на паузу/продолжает
function togglePause() {
    careerState.isPaused = !careerState.isPaused;
    
    const pauseBtn = document.getElementById('pause-btn');
    if (careerState.isPaused) {
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Продолжить';
        addRaceLog(`⏸️ Гонка приостановлена`);
    } else {
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Пауза';
        addRaceLog(`▶️ Гонка продолжена`);
        careerState.lastUpdate = Date.now();
    }
}

// Устанавливает скорость симуляции
function setSimulationSpeed(speed, evt) {
    careerState.simulationSpeed = speed;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const e = evt || window.event;
    if (e && e.target) {
        e.target.classList.add('active');
    }
    
    // Перезапускаем интервал с новой скоростью
    if (careerState.raceInterval && !careerState.isPaused) {
        clearInterval(careerState.raceInterval);
        careerState.raceInterval = setInterval(simulateRace, 1000 / speed);
    }
    
    addRaceLog(`⚡ Скорость симуляции: ${speed}x`);
}

// Выбирает стратегию
function selectStrategy(strategyNum) {
    // Убираем выделение со всех стратегий
    document.querySelectorAll('.strategy-option').forEach(el => {
        el.classList.remove('active');
    });
    
    // Выделяем выбранную стратегию
    document.getElementById(`strategy-${strategyNum}`).classList.add('active');
    
    // Применяем стратегию к пилотам
    const playerCars = careerState.cars.filter(c => c.team === careerState.playerTeamName);
    
    playerCars.forEach(car => {
        car.strategy = strategyNum;
        
        // Устанавливаем план пит-стопов в зависимости от стратегии
        switch(strategyNum) {
            case 1: // 1 остановка
                car.pitStopPlan = [
                    { lap: Math.floor(careerState.totalLaps * 0.4), tire: 'hard' }
                ];
                break;
            case 2: // 2 остановки
                car.pitStopPlan = [
                    { lap: Math.floor(careerState.totalLaps * 0.3), tire: 'medium' },
                    { lap: Math.floor(careerState.totalLaps * 0.65), tire: 'soft' }
                ];
                break;
            case 3: // Агрессивная
                car.pitStopPlan = [
                    { lap: Math.floor(careerState.totalLaps * 0.25), tire: 'soft' },
                    { lap: Math.floor(careerState.totalLaps * 0.55), tire: 'soft' }
                ];
                break;
        }
    });
    
    addRaceLog(`📊 Выбрана стратегия ${strategyNum}: ${document.getElementById(`strategy-${strategyNum}`).querySelector('.strategy-title').textContent}`);
}

// Запрашивает пит-стоп
function requestPitStop(driverIndex) {
    const car = getPlayerCar(driverIndex);
    
    if (!car || car.isInPit) return;
    
    const selectElement = document.getElementById(`driver${driverIndex+1}-tire-select`);
    const newTire = selectElement.value;
    
    car.requestManualPitStop(newTire);
    
    const timerElement = document.getElementById(`driver${driverIndex+1}-pit-timer`);
    timerElement.textContent = `Пит-стоп на следующем круге`;
    timerElement.style.color = '#ff9900';
    
    addRaceLog(`🔧 Ручной пит-стоп запланирован для ${car.driver}. Новые шины: ${tireConfigs[newTire].name}`);
}

// =================== КЛАСС МАШИНЫ (УЛУЧШЕННЫЙ) ===================
class Car {
    constructor(team, color, id, driver, performance) {
        this.id = id;
        this.team = team;
        this.driver = driver;
        this.color = color;
        
        // Позиция и прогресс
        this.position = 0;
        this.lap = 0;
        this.progress = 0;
        this.speed = 0.5 + Math.random() * 0.2; // ЗАМЕДЛЕННАЯ СКОРОСТЬ
        
        // Шины
        this.tire = 'medium';
        this.tireWear = 100;
        this.tireAge = 0;
        
        // Пилот-стопы
        this.pitStopPlan = [];
        this.nextPitStopIndex = 0;
        this.pitStopCounter = 0;
        this.isInPit = false;
        this.pitStopTimeLeft = 0;
        this.targetTire = 'medium';
        
        // Время
        this.lastLapTime = 0;
        this.totalTime = 0;
        this.bestLapTime = 9999;
        
        // Стратегия
        this.strategy = 1;
        this.aggression = 0.5 + Math.random() * 0.3;
        
        // Производительность
        this.performance = performance || { aero: 0.5, engine: 0.5, chassis: 0.5, reliability: 0.8 };
        this.carPerformance = this.calculateCarPerformance();
    }
    
    // Рассчитывает производительность машины
    calculateCarPerformance() {
        // Базовая производительность + характеристики команды + апгрейды игрока
        let performance = 0.5;
        
        if (this.team === careerState.playerTeamName) {
            // Для игрока учитываем апгрейды
            const upgrades = careerState.teamUpgrades;
            performance = 0.5 + 
                (upgrades.aero * 0.05) + 
                (upgrades.engine * 0.07) + 
                (upgrades.chassis * 0.04);
        } else {
            // Для AI используем их характеристики
            const team = f1Teams.find(t => t.name === this.team);
            if (team) {
                const perf = team.performance;
                performance = (perf.aero + perf.engine + perf.chassis) / 3;
            }
        }
        
        // Корректировка сложности
        switch(careerState.difficulty) {
            case 'easy':
                if (this.team === careerState.playerTeamName) performance *= 1.2;
                break;
            case 'hard':
                if (this.team === careerState.playerTeamName) performance *= 0.85;
                break;
        }
        
        return Math.min(0.95, Math.max(0.3, performance));
    }
    
    // Обновляет прогресс на трассе
    updateProgress(deltaSeconds = 1) {
        if (this.isInPit) {
            this.handlePitStop();
            return;
        }

        // Защита от NaN/Infinity, которые ломают отрисовку и сортировку позиций
        if (!Number.isFinite(this.progress)) this.progress = 0;
        
        // РАССЧИТЫВАЕМ СКОРОСТЬ С УЧЁТОМ ВСЕХ ФАКТОРОВ
        let speedMultiplier = this.carPerformance * 1.5; // Базовая производительность
        
        // Влияние шин
        const tireConfig = tireConfigs[this.tire];
        speedMultiplier *= tireConfig.grip;
        
        // Влияние износа шин
        const wearEffect = 1.0 - ((100 - this.tireWear) / 200);
        speedMultiplier *= wearEffect;
        
        // Агрессивность пилота
        speedMultiplier *= (0.8 + this.aggression * 0.4);
        
        // Случайность
        speedMultiplier *= (0.95 + Math.random() * 0.1);
        
        // Позиционный бонус (лидеры едут быстрее)
        const positionBonus = 1.0 - (this.position * 0.01);
        speedMultiplier *= positionBonus;
        
        // ИГРОК ПОЛУЧАЕТ ДОПОЛНИТЕЛЬНЫЙ БОНУС
        if (this.team === careerState.playerTeamName) {
            speedMultiplier *= 1.15; // Бонус для игрока
        }
        
        // ОБНОВЛЯЕМ ПРОГРЕСС (delta-based, чтобы скорость не зависела от частоты тика)
        // Подбор коэффициента так, чтобы гонка укладывалась примерно в ~3 минуты.
        const baseProgressPerSecond = 35; // чем больше — тем быстрее круги
        this.progress += this.speed * speedMultiplier * deltaSeconds * baseProgressPerSecond;
        
        // Обновляем износ шин (с учётом прошедшего времени)
        this.updateTireWear(deltaSeconds);
        
        // Проверяем завершение круга (wrap, чтобы не "телепортироваться" и не терять переполнение)
        while (this.progress >= 100) {
            this.progress -= 100;
            this.completeLap();
        }
        
        // Проверяем плановый пит-стоп
        this.checkScheduledPitStop();
    }
    
    // Обновляет износ шин
    updateTireWear(deltaSeconds = 1) {
        if (this.isInPit) return;
        
        const tireConfig = tireConfigs[this.tire];
        // Базовый износ сильно замедлен и зависит от прошедшего времени,
        // чтобы шины не «умирали» за несколько секунд.
        let wearRate = tireConfig.wearRate * 0.5;
        
        // Увеличиваем износ при агрессивной езде
        wearRate *= (0.8 + this.aggression * 0.4);
        
        // Учитываем производительность машины (лучшие машины меньше изнашивают шины)
        wearRate *= (1.2 - this.carPerformance * 0.4);
        
        // Масштабируем износ по времени
        this.tireWear -= wearRate * deltaSeconds;
        this.tireAge++;
        
        if (this.tireWear < 0) this.tireWear = 0;
    }
    
    // Завершает круг
    completeLap() {
        this.lap++;
        
        // Рассчитываем время круга
        const baseTime = tireConfigs[this.tire].baseLapTime;
        const track = careerState.currentTrack;
        
        // Множители
        let timeMultiplier = 1.0;
        
        // Производительность машины (лучшие машины быстрее)
        timeMultiplier *= (1.2 - this.carPerformance * 0.4);
        
        // Износ шин
        const wearMultiplier = 1.0 + ((100 - this.tireWear) / 100);
        timeMultiplier *= wearMultiplier;
        
        // Сложность трассы
        timeMultiplier *= track.difficulty;
        
        // Случайность
        timeMultiplier *= (0.98 + Math.random() * 0.04);
        
        // Рассчитываем время круга
        this.lastLapTime = baseTime * timeMultiplier;
        this.totalTime += this.lastLapTime;
        
        // Обновляем лучший круг
        if (this.lastLapTime < this.bestLapTime && this.lap > 1) {
            this.bestLapTime = this.lastLapTime;
            
            // Обновляем лучший круг гонки
            if (this.lastLapTime < careerState.fastestLap.time) {
                careerState.fastestLap = {
                    driver: this.driver,
                    time: this.lastLapTime,
                    team: this.team
                };
                updateFastestLap();
            }
        }
        
        // Добавляем в лог очень быстрые круги
        if (this.lastLapTime < baseTime * 0.96) {
            addRaceLog(`🚀 Быстрый круг! ${this.driver}: ${this.lastLapTime.toFixed(2)}с`);
        }
    }
    
    // Проверяет плановый пит-стоп
    checkScheduledPitStop() {
        if (this.isInPit || this.nextPitStopIndex >= this.pitStopPlan.length) return;
        
        const nextPit = this.pitStopPlan[this.nextPitStopIndex];
        if (careerState.currentLap >= nextPit.lap) {
            this.startPitStop(nextPit.tire);
            this.nextPitStopIndex++;
        }
    }
    
    // Начинает пит-стоп
    startPitStop(tireType) {
        this.isInPit = true;
        this.targetTire = tireType;
        this.pitStopTimeLeft = careerState.currentTrack.pitLossTime / 3; // Ускоренная симуляция
        
        addRaceLog(`🔧 ${this.driver} заезжает на пит-стоп. Новые шины: ${tireConfigs[tireType].name}`);
    }
    
    // Обрабатывает пит-стоп
    handlePitStop() {
        if (this.pitStopTimeLeft > 0) {
            this.pitStopTimeLeft -= 0.1;
        } else {
            this.completePitStop();
        }
    }
    
    // Завершает пит-стоп
    completePitStop() {
        this.tire = this.targetTire;
        this.tireWear = 100;
        this.tireAge = 0;
        this.isInPit = false;
        this.pitStopCounter++;
        
        addRaceLog(`✅ ${this.driver} вышел из пит-лейна на ${tireConfigs[this.tire].name} шинах`);
        
        // Сбрасываем таймер на интерфейсе
        const driverIndex = careerState.driverNames.indexOf(this.driver);
        if (driverIndex >= 0) {
            document.getElementById(`driver${driverIndex+1}-pit-timer`).textContent = '';
        }
    }
    
    // Запрашивает ручной пит-стоп
    requestManualPitStop(tireType) {
        if (this.isInPit) return;
        
        // Отменяем запланированные пит-стопы после этого
        this.pitStopPlan = [];
        this.nextPitStopIndex = 0;
        
        // Создаём немедленный пит-стоп
        this.startPitStop(tireType);
    }
}

// =================== СИМУЛЯЦИЯ ГОНКИ ===================
// Основная функция симуляции
function simulateRace() {
    if (careerState.isPaused || !careerState.raceStarted || careerState.raceFinished) return;

    const now = Date.now();
    const last = careerState.lastUpdate || now;
    const deltaSeconds = Math.max(0.001, (now - last) / 1000) * (careerState.simulationSpeed || 1);
    careerState.lastUpdate = now;

    // Ограничение длительности гонки (макс. 3 минуты реального времени)
    const MAX_RACE_DURATION_MS = 3 * 60 * 1000;
    if (careerState.raceStartTime && (now - careerState.raceStartTime) >= MAX_RACE_DURATION_MS) {
        finishRace();
        return;
    }
    
    // Обновляем все машины
    careerState.cars.forEach(car => {
        car.updateProgress(deltaSeconds);
    });
    
    // Обновляем текущий круг (по самой быстрой машине)
    const maxLap = Math.max(...careerState.cars.map(c => c.lap));
    if (maxLap > careerState.currentLap) {
        careerState.currentLap = maxLap;
        updateRaceInfo();
        
        // Добавляем время круга в лог для пилотов игрока
        careerState.cars
            .filter(c => c.team === careerState.playerTeamName)
            .forEach(car => {
                if (car.lap === careerState.currentLap) {
                    addLapTime(car.driver, car.lastLapTime);
                }
            });
        
        // Проверяем окончание гонки
        if (careerState.currentLap >= careerState.totalLaps) {
            finishRace();
        }
    }
    
    // Пересчитываем позиции
    updatePositions();
    
    // Обновляем интерфейс
    drawTrack();
    updateStandingsTable();
    updateDriverPanels();
}

// Завершает гонку
function finishRace() {
    careerState.raceFinished = true;
    careerState.isPaused = true;
    
    // Останавливаем симуляцию
    if (careerState.raceInterval) {
        clearInterval(careerState.raceInterval);
        careerState.raceInterval = null;
    }

    // Полностью останавливаем анимацию, чтобы машины не "ехали" после финиша
    stopAnimation();
    
    // Обновляем кнопки
    document.getElementById('pause-btn').disabled = true;
    document.getElementById('next-race-btn').disabled = false;
    
    // Подсчитываем результаты
    calculateRaceResults();
    
    // Обновляем чемпионат
    updateChampionship();
    
    // Обновляем финансы
    updateFinances();
    
    // Показываем результаты
    showRaceResults();
    
    // Переходим к следующей гонке
    careerState.currentRace++;
    
    // Если сезон завершён
    if (careerState.currentRace > careerState.totalRaces) {
        finishSeason();
    }
}

// Подсчитывает результаты гонки
function calculateRaceResults() {
    // Сортируем машины по пройденной дистанции и времени
    careerState.cars.sort((a, b) => {
        const aDistance = a.lap * 100 + a.progress;
        const bDistance = b.lap * 100 + b.progress;
        if (bDistance !== aDistance) return bDistance - aDistance;
        return a.totalTime - b.totalTime;
    });
    
    // Сохраняем результаты
    const raceResult = {
        track: careerState.currentTrack.name,
        round: careerState.currentRace,
        results: careerState.cars.map((car, index) => ({
            position: index + 1,
            driver: car.driver,
            team: car.team,
            points: index < 10 ? pointsSystem[index] : 0,
            time: car.totalTime,
            bestLap: car.bestLapTime,
            pitStops: car.pitStopCounter
        }))
    };
    
    careerState.raceResults.push(raceResult);
    
    // Добавляем в лог
    addRaceLog(`🏁 ФИНИШ! Победитель: ${raceResult.results[0].driver} (${raceResult.results[0].team})`);
    
    // Пилоты игрока
    const playerResults = raceResult.results.filter(r => r.team === careerState.playerTeamName);
    playerResults.forEach(result => {
        if (result.position <= 3) {
            addRaceLog(`🎉 ${result.driver} финишировал на ${result.position} месте!`);
        } else if (result.position <= 10) {
            addRaceLog(`👍 ${result.driver} финишировал ${result.position} и заработал ${result.points} очков`);
        }
    });
}

// Обновляет чемпионат
function updateChampionship() {
    const lastRace = careerState.raceResults[careerState.raceResults.length - 1];
    
    // Обновляем кубок конструкторов
    lastRace.results.forEach(result => {
        const teamStanding = careerState.constructorsStandings.find(s => s.team === result.team);
        if (teamStanding) {
            teamStanding.points += result.points;
            if (result.position === 1) teamStanding.wins++;
            if (result.position <= 3) teamStanding.podiums++;
        }
    });
    
    // Обновляем личный зачёт
    lastRace.results.forEach(result => {
        const driverStanding = careerState.driversStandings.find(s => s.driver === result.driver && s.team === result.team);
        if (driverStanding) {
            driverStanding.points += result.points;
            if (result.position === 1) driverStanding.wins++;
        }
    });
    
    // Сортируем таблицы
    careerState.constructorsStandings.sort((a, b) => b.points - a.points);
    careerState.driversStandings.sort((a, b) => b.points - a.points);
    
    // Обновляем очки команды игрока
    const playerTeam = careerState.constructorsStandings.find(s => s.team === careerState.playerTeamName);
    if (playerTeam) {
        careerState.teamPoints = playerTeam.points;
    }
    
    // Обновляем интерфейс
    updateCareerTab();
}

// Обновляет финансы
function updateFinances() {
    const lastRace = careerState.raceResults[careerState.raceResults.length - 1];
    const playerResults = lastRace.results.filter(r => r.team === careerState.playerTeamName);
    
    // Призовые за гонку
    let prizeMoney = 1; // База 1 млн
    
    // Бонусы за позиции
    playerResults.forEach(result => {
        if (result.position === 1) prizeMoney += 5;
        else if (result.position === 2) prizeMoney += 3;
        else if (result.position === 3) prizeMoney += 2;
        else if (result.position <= 5) prizeMoney += 1;
        else if (result.position <= 10) prizeMoney += 0.5;
    });
    
    // Бонус за быстрый круг
    if (careerState.fastestLap.team === careerState.playerTeamName) {
        prizeMoney += 0.5;
    }
    
    // Доход от спонсоров
    const sponsorIncome = 2;
    
    // Общий доход
    const totalIncome = prizeMoney + sponsorIncome;
    careerState.teamBudget += totalIncome;
    
    // Добавляем в лог
    addRaceLog(`💰 Финансовый отчёт: +€${totalIncome.toFixed(1)}M (Призовые: €${prizeMoney}M, Спонсоры: €${sponsorIncome}M)`);
    
    // Обновляем интерфейс
    updateTeamInfo();
}

// Завершает сезон
function finishSeason() {
    addRaceLog(`🎊 СЕЗОН ${careerState.season} ЗАВЕРШЁН!`);
    addRaceLog(`🏆 Победитель Кубка конструкторов: ${careerState.constructorsStandings[0].team}`);
    addRaceLog(`🥇 Чемпион мира: ${careerState.driversStandings[0].driver}`);
    
    // Показываем итоги сезона
    setTimeout(() => {
        alert(`Сезон ${careerState.season} завершён!\n\n` +
              `Кубок конструкторов:\n` +
              `1. ${careerState.constructorsStandings[0].team} - ${careerState.constructorsStandings[0].points} очков\n` +
              `2. ${careerState.constructorsStandings[1].team} - ${careerState.constructorsStandings[1].points} очков\n` +
              `3. ${careerState.constructorsStandings[2].team} - ${careerState.constructorsStandings[2].points} очков\n\n` +
              `Ваша команда "${careerState.playerTeamName}" заняла ${careerState.constructorsStandings.findIndex(s => s.team === careerState.playerTeamName) + 1} место с ${careerState.teamPoints} очками!`);
    }, 1000);
}

// =================== ИНТЕРФЕЙС ===================
// Инициализирует машины для гонки
// Инициализирует машины для гонки (ИСПРАВЛЕННАЯ)
function initializeCars() {
    console.log('Инициализация машин...');
    
    // Очищаем массив машин
    careerState.cars = [];
    
    // Проверяем, что у нас есть имена пилотов
    if (!careerState.driverNames || careerState.driverNames.length < 2) {
        console.error('Не заданы имена пилотов');
        careerState.driverNames = ['Пилот #1', 'Пилот #2'];
    }
    
    const playerTeamColor = '#FF0000';
    
    // Производительность игрока с учётом апгрейдов
    const playerPerformance = {
        aero: 0.5 + ((careerState.teamUpgrades?.aero || 1) * 0.1),
        engine: 0.5 + ((careerState.teamUpgrades?.engine || 1) * 0.12),
        chassis: 0.5 + ((careerState.teamUpgrades?.chassis || 1) * 0.08),
        reliability: 0.8
    };
    
    console.log('Создаём машины игрока:', careerState.driverNames);
    
    // Создаём машины игрока
    try {
        careerState.cars.push(new Car(
            careerState.playerTeamName, 
            playerTeamColor, 
            0, 
            careerState.driverNames[0],
            playerPerformance
        ));
        
        careerState.cars.push(new Car(
            careerState.playerTeamName, 
            playerTeamColor, 
            1, 
            careerState.driverNames[1],
            playerPerformance
        ));
    } catch (error) {
        console.error('Ошибка создания машин игрока:', error);
        return;
    }
    
    // Создаём машины соперников
    let carId = 2;
    
    if (f1Teams && f1Teams.length > 0) {
        f1Teams.forEach(team => {
            if (team.drivers && team.drivers.length > 0) {
                team.drivers.forEach(driverName => {
                    try {
                        careerState.cars.push(new Car(
                            team.name, 
                            team.color, 
                            carId, 
                            driverName,
                            team.performance
                        ));
                        carId++;
                    } catch (error) {
                        console.error(`Ошибка создания машины ${driverName}:`, error);
                    }
                });
            }
        });
    }
    
    console.log(`Создано ${careerState.cars.length} машин`);
    
    // Проверяем, что машины созданы
    if (careerState.cars.length === 0) {
        console.error('Не удалось создать ни одной машины');
        return;
    }
    
    // Случайный стартовый порядок с учетом производительности
    careerState.cars.sort((a, b) => {
        const perfDiff = (b.carPerformance || 0.5) - (a.carPerformance || 0.5);
        return perfDiff + (Math.random() * 0.2 - 0.1);
    });
    
    // Назначаем позиции
    careerState.cars.forEach((car, index) => {
        car.position = index + 1;
        car.id = index;
        
        // Случайный тип стартовых шин
        const tireTypes = ['soft', 'medium', 'hard'];
        car.tire = tireTypes[Math.floor(Math.random() * tireTypes.length)];
        car.tireWear = 90 + Math.random() * 10;
        
        // Устанавливаем стратегию по умолчанию
        car.strategy = 1;
        car.pitStopPlan = [
            { lap: Math.floor((careerState.totalLaps || 50) * 0.4), tire: 'hard' }
        ];
    });
    
    console.log('Машины инициализированы:', careerState.cars.length);
}

// Обновляет позиции машин
function updatePositions() {
    // Сортируем по пройденной дистанции
    careerState.cars.sort((a, b) => {
        const aDistance = a.lap * 100 + a.progress;
        const bDistance = b.lap * 100 + b.progress;
        if (bDistance !== aDistance) return bDistance - aDistance;
        return a.totalTime - b.totalTime;
    });
    
    // Назначаем позиции
    careerState.cars.forEach((car, index) => {
        car.position = index + 1;
    });
}

// Обновляет информацию о гонке
function updateRaceInfo() {
    const raceNameEl = document.getElementById('current-race-name');
    const trackStatsEl = document.getElementById('track-stats');
    const currentLapEl = document.getElementById('current-lap');
    const totalLapsEl = document.getElementById('total-laps');

    const track = careerState.currentTrack;
    const totalLaps = careerState.totalLaps || (track ? track.totalLaps : 0);

    // Если трасса ещё не выбрана (например, во время initGame), показываем заглушки
    if (!track) {
        if (raceNameEl) raceNameEl.textContent = '—';
        if (trackStatsEl) trackStatsEl.textContent = 'Длина круга: — | Кругов: —';
        if (currentLapEl) currentLapEl.textContent = String(careerState.currentLap || 0);
        if (totalLapsEl) totalLapsEl.textContent = String(totalLaps || 0);
    } else {
        if (raceNameEl) raceNameEl.textContent = track.name;
        if (trackStatsEl) trackStatsEl.textContent =
            `Длина круга: ${track.lapDistance} км | Кругов: ${totalLaps}`;
        if (currentLapEl) currentLapEl.textContent = String(careerState.currentLap || 0);
        if (totalLapsEl) totalLapsEl.textContent = String(totalLaps || 0);
    }
    
    // Прогресс гонки
    const progressPercent = Math.min(100, (careerState.currentLap / careerState.totalLaps) * 100);
    
    // Статус гонки
    let statusText = 'Не начата';
    let statusColor = '#ff9900';
    
    if (careerState.raceStarted) {
        if (careerState.raceFinished) {
            statusText = 'Завершена';
            statusColor = '#ff6666';
        } else if (careerState.isPaused) {
            statusText = 'Пауза';
            statusColor = '#ffcc00';
        } else {
            statusText = 'В процессе';
            statusColor = '#66ff66';
        }
    }
    
    document.getElementById('race-status').textContent = statusText;
    document.getElementById('race-status').style.color = statusColor;
}

// Обновляет таблицу позиций
function updateStandingsTable() {
    const tbody = document.getElementById('standings-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    careerState.cars.forEach((car, index) => {
        const row = document.createElement('tr');
        
        // Подсветка пилотов игрока
        if (car.team === careerState.playerTeamName) {
            row.classList.add('player-team');
        }
        
        // Рассчитываем интервал до лидера
        let interval = '-';
        if (index > 0) {
            const leader = careerState.cars[0];
            if (car.lap < leader.lap) {
                interval = `+${leader.lap - car.lap}L`;
            } else {
                const timeDiff = car.totalTime - leader.totalTime;
                if (timeDiff < 60) {
                    interval = `+${timeDiff.toFixed(1)}s`;
                } else {
                    const minutes = Math.floor(timeDiff / 60);
                    const seconds = timeDiff % 60;
                    interval = `+${minutes}:${seconds.toFixed(1)}`;
                }
            }
        }
        
        // Иконка пит-лейна
        let tireIcon = '';
        if (car.isInPit) {
            tireIcon = '⏳';
        }
        
        const logoPath = getTeamLogoPath(car.team);
        row.innerHTML = `
            <td class="pos-col">${car.position}</td>
            <td class="driver-col">${car.driver}</td>
            <td class="team-col" style="display: flex; align-items: center; gap: 8px;">
                <img src="${logoPath}" alt="${car.team}" style="width: 24px; height: 24px; object-fit: contain;" onerror="this.src='data/assets/f1.png'">
                ${car.team}
            </td>
            <td class="interval-col">${interval}</td>
            <td class="tire-col" style="color: ${tireConfigs[car.tire].color}">
                ${tireIcon} ${tireConfigs[car.tire].name}
            </td>
            <td class="pits-col">${car.pitStopCounter}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Обновляет панели пилотов
// Обновляет панели пилотов (ИСПРАВЛЕННАЯ)
function updateDriverPanels() {
    // Проверяем, есть ли машины
    if (!careerState.cars || careerState.cars.length === 0) return;
    
    const playerCars = careerState.cars.filter(c => c.team === careerState.playerTeamName);
    
    playerCars.forEach((car, index) => {
        const idx = index + 1;
        
        // Проверяем, существуют ли элементы DOM
        const nameElement = document.getElementById(`driver${idx}-name`);
        const tireElement = document.getElementById(`driver${idx}-tire`);
        const wearElement = document.getElementById(`driver${idx}-wear`);
        const wearBarElement = document.getElementById(`driver${idx}-wear-bar`);
        const pitsElement = document.getElementById(`driver${idx}-pits`);
        const posElement = document.getElementById(`driver${idx}-pos`);
        const statusElement = document.getElementById(`driver${idx}-status`);
        const timerElement = document.getElementById(`driver${idx}-pit-timer`);
        
        if (!nameElement || !tireElement || !wearElement || !wearBarElement || 
            !pitsElement || !posElement || !statusElement) return;
        
        // Обновляем данные
        nameElement.textContent = car.driver;
        tireElement.textContent = tireConfigs[car.tire].name;
        tireElement.style.color = tireConfigs[car.tire].color;
        
        const wearPercent = Math.max(0, Math.floor(car.tireWear));
        wearElement.textContent = wearPercent + '%';
        wearBarElement.style.width = wearPercent + '%';
        
        // Цвет износа
        let wearColor = '#00ff00';
        if (wearPercent < 50) wearColor = '#ffff00';
        if (wearPercent < 20) wearColor = '#ff0000';
        wearBarElement.style.backgroundColor = wearColor;
        
        pitsElement.textContent = car.pitStopCounter;
        posElement.textContent = car.position;
        
        // Статус
        if (car.isInPit) {
            statusElement.textContent = 'В пит-лейне';
            statusElement.style.background = 'rgba(255, 153, 0, 0.3)';
            statusElement.style.color = '#ff9900';
            
            // Таймер
            if (timerElement && car.pitStopTimeLeft > 0) {
                timerElement.textContent = `Осталось: ${car.pitStopTimeLeft.toFixed(1)}с`;
            }
        } else {
            statusElement.textContent = 'На трассе';
            statusElement.style.background = 'rgba(0, 200, 0, 0.2)';
            statusElement.style.color = '#66ff66';
            if (timerElement) timerElement.textContent = '';
        }
    });
}

// Обновляет лучший круг
function updateFastestLap() {
    const fastest = careerState.fastestLap;
    if (fastest.driver) {
        document.getElementById('fastest-lap-driver').textContent = fastest.driver;
        document.getElementById('fastest-lap-time').textContent = ` (${fastest.time.toFixed(2)}с)`;
    }
}

// Добавляет время круга
function addLapTime(driver, time) {
    const container = document.getElementById('lap-times');
    const entry = document.createElement('div');
    entry.className = 'lap-time-entry';
    entry.innerHTML = `
        <span class="lap-time-driver">${driver}</span>
        <span class="lap-time-value">${time.toFixed(2)}с</span>
    `;
    
    container.insertBefore(entry, container.firstChild);
    
    // Ограничиваем количество записей
    const entries = container.querySelectorAll('.lap-time-entry');
    if (entries.length > 10) {
        entries[entries.length - 1].remove();
    }
}

// Добавляет запись в лог гонки
function addRaceLog(message) {
    const container = document.getElementById('race-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] ${message}`;
    
    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;
    
    // Ограничиваем количество записей
    const entries = container.querySelectorAll('.log-entry');
    if (entries.length > 20) {
        entries[0].remove();
    }
}

// =================== УПРАВЛЕНИЕ КОМАНДОЙ ===================
// Обновляет информацию команды
function updateTeamInfo() {
    document.getElementById('team-name-edit').value = careerState.playerTeamName;
    document.getElementById('driver1-name-edit').value = careerState.driverNames[0];
    document.getElementById('driver2-name-edit').value = careerState.driverNames[1];
    
    document.getElementById('season-year').textContent = careerState.season;
    document.getElementById('race-number').textContent = `${careerState.currentRace}/${careerState.totalRaces}`;
    document.getElementById('team-points').textContent = careerState.teamPoints;
    
    // Бюджет и апгрейды
    document.getElementById('team-budget').textContent = careerState.teamBudget.toFixed(1);
    document.getElementById('budget-amount').textContent = careerState.teamBudget.toFixed(1);
    document.getElementById('aero-level').textContent = careerState.teamUpgrades.aero;
    document.getElementById('engine-level').textContent = careerState.teamUpgrades.engine;
    document.getElementById('chassis-level').textContent = careerState.teamUpgrades.chassis;
    
    // Производительность
    const performance = calculateTeamPerformance();
    document.getElementById('speed-value').textContent = Math.round(performance.speed) + '%';
    document.getElementById('speed-bar').style.width = performance.speed + '%';
    document.getElementById('cornering-value').textContent = Math.round(performance.cornering) + '%';
    document.getElementById('cornering-bar').style.width = performance.cornering + '%';
    document.getElementById('tire-value').textContent = Math.round(performance.tire) + '%';
    document.getElementById('tire-bar').style.width = performance.tire + '%';
}

// Рассчитывает производительность команды
function calculateTeamPerformance() {
    const upgrades = careerState.teamUpgrades;
    
    return {
        speed: 50 + (upgrades.engine * 10) + (upgrades.aero * 5),
        cornering: 50 + (upgrades.chassis * 8) + (upgrades.aero * 7),
        tire: 50 + (upgrades.chassis * 12)
    };
}

// Обновляет имя команды
function updateTeamName() {
    const newName = document.getElementById('team-name-edit').value.trim();
    if (newName && newName !== careerState.playerTeamName) {
        careerState.playerTeamName = newName;
        
        // Обновляем в чемпионате
        const teamStanding = careerState.constructorsStandings.find(s => s.team === newName);
        if (!teamStanding) {
            const oldStanding = careerState.constructorsStandings.find(s => s.team === careerState.playerTeamName);
            if (oldStanding) oldStanding.team = newName;
        }
        
        // Обновляем водителей
        careerState.driversStandings
            .filter(s => s.team === careerState.playerTeamName)
            .forEach(s => s.team = newName);
        
        updateTeamInfo();
        updateCareerTab();
        
        addRaceLog(`🏷️ Команда переименована в "${newName}"`);
    }
}

// Обновляет имя пилота
function updateDriverName(driverIndex) {
    const inputId = driverIndex === 0 ? 'driver1-name-edit' : 'driver2-name-edit';
    const newName = document.getElementById(inputId).value.trim();
    
    if (newName && newName !== careerState.driverNames[driverIndex]) {
        const oldName = careerState.driverNames[driverIndex];
        careerState.driverNames[driverIndex] = newName;
        
        // Обновляем в чемпионате
        const driverStanding = careerState.driversStandings.find(s => 
            s.driver === oldName && s.team === careerState.playerTeamName
        );
        if (driverStanding) {
            driverStanding.driver = newName;
        }
        
        // Обновляем текущую гонку
        const car = getPlayerCar(driverIndex);
        if (car) {
            car.driver = newName;
        }
        
        updateTeamInfo();
        updateStandingsTable();
        updateDriverPanels();
        
        addRaceLog(`👤 Пилот переименован: "${oldName}" → "${newName}"`);
    }
}

// Покупает апгрейд
function buyUpgrade(type) {
    const costs = { aero: 5, engine: 8, chassis: 4 };
    const cost = costs[type];
    
    if (careerState.teamBudget >= cost) {
        careerState.teamBudget -= cost;
        careerState.teamUpgrades[type]++;
        
        updateTeamInfo();
        
        // Пересчитываем производительность машин
        careerState.cars
            .filter(car => car.team === careerState.playerTeamName)
            .forEach(car => {
                car.carPerformance = car.calculateCarPerformance();
            });
        
        addRaceLog(`⚙️ Улучшена ${getUpgradeName(type)} до уровня ${careerState.teamUpgrades[type]}`);
    } else {
        alert(`Недостаточно средств! Нужно €${cost}M, доступно €${careerState.teamBudget.toFixed(1)}M`);
    }
}

// Возвращает название апгрейда
function getUpgradeName(type) {
    const names = {
        aero: 'аэродинамика',
        engine: 'двигатель',
        chassis: 'шасси'
    };
    return names[type] || type;
}

// =================== КАРЬЕРНЫЙ РЕЖИМ ===================
// Переключает вкладки
// =================== КАРЬЕРНЫЙ РЕЖИМ ===================

// Переключает вкладки
function switchTab(tabName) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.remove('active');
    });

    // Убираем активность со всех кнопок
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('active');
    });

    // Показываем выбранную вкладку
    document.getElementById(`${tabName}-tab-content`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Обновляем данные если нужно
    if (tabName === 'career') {
        updateCareerTab();
    } else if (tabName === 'calendar') {
        updateCalendar();
    }
} // ← ДОБАВЬТЕ ЭТУ ЗАКРЫВАЮЩУЮ СКОБКУ!

// Обновляет вкладку карьеры
function updateCareerTab() {
    document.getElementById('races-completed').textContent = 
        `${careerState.raceResults.length}/${careerState.totalRaces}`;
    document.getElementById('career-team-points').textContent = careerState.teamPoints;
    document.getElementById('team-budget').textContent = careerState.teamBudget.toFixed(1);
    
    // Позиция в кубке конструкторов
    const teamIndex = careerState.constructorsStandings.findIndex(
        s => s.team === careerState.playerTeamName
    );
    document.getElementById('team-standing').textContent = 
        teamIndex >= 0 ? `${teamIndex + 1}-е место` : '-';
    
    // Обновляем таблицы
    updateConstructorsStandings();
    updateDriversStandings();
    updateRaceResults();
}

// Обновляет кубок конструкторов
function updateConstructorsStandings() {
    const tbody = document.getElementById('constructors-standings');
    tbody.innerHTML = '';
    
    careerState.constructorsStandings.forEach((standing, index) => {
        const row = document.createElement('tr');
        
        if (standing.team === careerState.playerTeamName) {
            row.classList.add('team-row');
        }
        
        const logoPath = getTeamLogoPath(standing.team);
        row.innerHTML = `
            <td>${index + 1}</td>
            <td style="display: flex; align-items: center; gap: 8px;">
                <img src="${logoPath}" alt="${standing.team}" style="width: 24px; height: 24px; object-fit: contain;" onerror="this.src='data/assets/f1.png'">
                <span style="color: ${standing.color}">●</span> ${standing.team}
            </td>
            <td>${standing.points}</td>
            <td>${standing.wins}</td>
            <td>${standing.podiums}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Обновляет личный зачёт
function updateDriversStandings() {
    const tbody = document.getElementById('drivers-standings');
    tbody.innerHTML = '';
    
    careerState.driversStandings.forEach((standing, index) => {
        const row = document.createElement('tr');
        
        if (standing.team === careerState.playerTeamName) {
            row.classList.add('team-row');
        }
        
        const logoPath = getTeamLogoPath(standing.team);
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><span style="color: ${standing.color}">●</span> ${standing.driver}</td>
            <td style="display: flex; align-items: center; gap: 8px;">
                <img src="${logoPath}" alt="${standing.team}" style="width: 24px; height: 24px; object-fit: contain;" onerror="this.src='data/assets/f1.png'">
                ${standing.team}
            </td>
            <td>${standing.points}</td>
            <td>${standing.wins}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Обновляет результаты гонок
function updateRaceResults() {
    const container = document.getElementById('race-results');
    container.innerHTML = '';
    
    if (careerState.raceResults.length === 0) {
        container.innerHTML = '<div class="no-results">Гонки ещё не проводились</div>';
        return;
    }
    
    careerState.raceResults.forEach(result => {
        const item = document.createElement('div');
        item.className = 'result-item';
        
        // Определяем класс в зависимости от лучшего результата пилота игрока
        const playerResults = result.results.filter(r => r.team === careerState.playerTeamName);
        const bestPosition = Math.min(...playerResults.map(r => r.position));
        
        if (bestPosition === 1) {
            item.classList.add('win');
        } else if (bestPosition <= 3) {
            item.classList.add('podium');
        } else if (bestPosition <= 10) {
            item.classList.add('points');
        }
        
        // Позиции пилотов игрока
        const positionsHtml = playerResults.map(player => `
            <div class="result-position">
                <div class="position-number">${player.position}</div>
                <div class="position-points">${player.points} очков</div>
            </div>
        `).join('');
        
        item.innerHTML = `
            <div class="result-info">
                <div class="result-track">${result.round}. ${result.track}</div>
                <div class="result-winner">Победитель: ${result.results[0].driver}</div>
            </div>
            <div class="result-positions">
                ${positionsHtml}
            </div>
        `;
        
        container.appendChild(item);
    });
}

// =================== КАЛЕНДАРЬ ===================
// Заполняет календарь
function populateCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= careerState.totalRaces; i++) {
        const trackIndex = (i - 1) % tracks.length;
        const track = tracks[trackIndex];
        
        const event = document.createElement('div');
        event.className = 'calendar-event';
        
        // Определяем статус
        let status = 'upcoming';
        let statusText = 'Предстоящая';
        
        if (i < careerState.currentRace) {
            status = 'completed';
            statusText = 'Завершена';
            event.classList.add('completed');
        } else if (i === careerState.currentRace) {
            status = 'current';
            statusText = 'Текущая';
            event.classList.add('current');
            document.getElementById('current-race-index').textContent = i;
        }
        
        event.innerHTML = `
            <div class="calendar-event-header">
                <div class="event-round">Этап ${i}</div>
                <div class="event-status status-${status}">${statusText}</div>
            </div>
            <div class="event-name">${track.name}</div>
            <div class="event-country">${track.country}</div>
            <div class="event-stats">
                <div class="event-stat">
                    <div class="event-stat-name">Длина круга</div>
                    <div class="event-stat-value">${track.lapDistance} км</div>
                </div>
                <div class="event-stat">
                    <div class="event-stat-name">Кругов</div>
                    <div class="event-stat-value">${track.totalLaps}</div>
                </div>
                <div class="event-stat">
                    <div class="event-stat-name">Сложность</div>
                    <div class="event-stat-value">${'★'.repeat(Math.round(track.difficulty))}</div>
                </div>
                <div class="event-stat">
                    <div class="event-stat-name">Пит-стоп</div>
                    <div class="event-stat-value">${track.pitLossTime}с</div>
                </div>
            </div>
            <div class="event-actions">
                ${i === careerState.currentRace ? 
                    '<button class="small-btn" onclick="startNextRace()">Начать гонку</button>' : 
                    ''
                }
            </div>
        `;
        
        grid.appendChild(event);
    }
}

// Обновляет календарь
function updateCalendar() {
    populateCalendar();
}

// =================== ВИЗУАЛИЗАЦИЯ ===================
// Вычисляет позицию на трассе по прогрессу (0-100)
function getTrackPosition(track, progress) {
    if (!track.coordinates || track.coordinates.length < 2) {
        return null;
    }
    
    const totalPoints = track.coordinates.length;
    const normalizedProgress = Math.max(0, Math.min(100, progress)) / 100;
    const totalDistance = normalizedProgress * totalPoints;
    
    const segmentIndex = Math.floor(totalDistance) % totalPoints;
    const nextIndex = (segmentIndex + 1) % totalPoints;
    const segmentProgress = totalDistance - Math.floor(totalDistance);
    
    const p1 = track.coordinates[segmentIndex];
    const p2 = track.coordinates[nextIndex];
    
    // Интерполяция между точками
    const x = p1.x + (p2.x - p1.x) * segmentProgress;
    const y = p1.y + (p2.y - p1.y) * segmentProgress;
    
    // Вычисляем направление движения для ориентации машины
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const angle = Math.atan2(dy, dx);
    
    return { x, y, angle };
}

// Рисует трассу и машины с качественной инфографикой
function drawTrack() {
    const canvas = document.getElementById('track-canvas');
    if (!canvas) {
        console.error('Canvas не найден');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Canvas context не доступен');
        return;
    }
    
    if (!careerState.currentTrack) {
        // Рисуем пустой экран
        ctx.fillStyle = '#0a1a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#4db8ff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Трасса не выбрана', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const track = careerState.currentTrack;
    
    // Очищаем холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем градиентный фон
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a1a2a');
    gradient.addColorStop(1, '#1a2a3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Масштабируем координаты трассы под размер canvas
    if (track.coordinates && track.coordinates.length >= 2) {
        // Находим границы трассы
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        track.coordinates.forEach(coord => {
            minX = Math.min(minX, coord.x);
            minY = Math.min(minY, coord.y);
            maxX = Math.max(maxX, coord.x);
            maxY = Math.max(maxY, coord.y);
        });
        
        const trackWidth = maxX - minX;
        const trackHeight = maxY - minY;
        
        // Вычисляем масштаб с отступами
        const padding = 60;
        const scaleX = (canvas.width - padding * 2) / trackWidth;
        const scaleY = (canvas.height - padding * 2) / trackHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // Центрируем трассу
        const offsetX = (canvas.width - (trackWidth * scale)) / 2 - minX * scale;
        const offsetY = (canvas.height - (trackHeight * scale)) / 2 - minY * scale;
        
        // Функция преобразования координат
        const transform = (coord) => ({
            x: coord.x * scale + offsetX,
            y: coord.y * scale + offsetY
        });
        
        // Рисуем трассу с градиентом и тенью
        ctx.save();
        
        // Тень трассы
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // Внешняя граница трассы (широкая)
        ctx.beginPath();
        const firstPoint = transform(track.coordinates[0]);
        ctx.moveTo(firstPoint.x, firstPoint.y);
        
        for (let i = 1; i < track.coordinates.length; i++) {
            const point = transform(track.coordinates[i]);
            ctx.lineTo(point.x, point.y);
        }
        ctx.closePath();
        
        // Градиент для трассы
        const trackGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        trackGradient.addColorStop(0, track.color || '#FFFFFF');
        trackGradient.addColorStop(1, (track.color || '#FFFFFF') + '80');
        
        ctx.strokeStyle = trackGradient;
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        // Внутренняя линия трассы
        ctx.beginPath();
        ctx.moveTo(firstPoint.x, firstPoint.y);
        for (let i = 1; i < track.coordinates.length; i++) {
            const point = transform(track.coordinates[i]);
            ctx.lineTo(point.x, point.y);
        }
        ctx.closePath();
        
        ctx.strokeStyle = (track.color || '#FFFFFF') + '40';
        ctx.lineWidth = 8;
        ctx.stroke();
        
        // Разделительная линия
        ctx.beginPath();
        ctx.moveTo(firstPoint.x, firstPoint.y);
        for (let i = 1; i < track.coordinates.length; i++) {
            const point = transform(track.coordinates[i]);
            ctx.lineTo(point.x, point.y);
        }
        ctx.closePath();
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.setLineDash([15, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.restore();
        
        // Стартовая линия
        const startPoint = transform(track.coordinates[0]);
        const secondPoint = transform(track.coordinates[1]);
        const startAngle = Math.atan2(secondPoint.y - startPoint.y, secondPoint.x - startPoint.x);
        const lineLength = 30;
        const perpAngle = startAngle + Math.PI / 2;
        
        ctx.beginPath();
        ctx.moveTo(
            startPoint.x + Math.cos(perpAngle) * lineLength,
            startPoint.y + Math.sin(perpAngle) * lineLength
        );
        ctx.lineTo(
            startPoint.x - Math.cos(perpAngle) * lineLength,
            startPoint.y - Math.sin(perpAngle) * lineLength
        );
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Рисуем машины с плавной анимацией
        if (careerState.cars && careerState.cars.length > 0) {
            // Сортируем машины по позиции для правильного порядка отрисовки
            const sortedCars = [...careerState.cars].sort((a, b) => a.position - b.position);
            
            sortedCars.forEach((car, index) => {
                const trackPos = getTrackPosition(track, car.progress);
                if (!trackPos) return;
                
                const x = trackPos.x;
                const y = trackPos.y;
                const angle = trackPos.angle;
                
                // Смещение для разных дорожек (чтобы машины не накладывались)
                const idNum = typeof car.id === 'number' ? car.id : (parseInt(String(car.id), 10) || 0);
                const laneOffset = (Math.abs(idNum) % 3 - 1) * 8;
                const perpAngle = angle + Math.PI / 2;
                const offsetX = Math.cos(perpAngle) * laneOffset;
                const offsetY = Math.sin(perpAngle) * laneOffset;
                
                const finalX = x + offsetX;
                const finalY = y + offsetY;
                
                ctx.save();
                
                // Тень машины
                ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                
                // Поворачиваем контекст для ориентации машины
                ctx.translate(finalX, finalY);
                ctx.rotate(angle);
                
                // Рисуем машину (прямоугольник с закругленными краями)
                const carWidth = 16;
                const carHeight = 10;
                
                // Градиент для машины
                const carGradient = ctx.createLinearGradient(-carWidth/2, -carHeight/2, carWidth/2, carHeight/2);
                if (car.isInPit) {
                    carGradient.addColorStop(0, '#ff9900');
                    carGradient.addColorStop(1, '#cc7700');
                } else {
                    const baseColor = car.color || '#FF0000';
                    carGradient.addColorStop(0, baseColor);
                    carGradient.addColorStop(1, baseColor + 'CC');
                }
                
                ctx.fillStyle = carGradient;
                ctx.beginPath();
                ctx.roundRect(-carWidth/2, -carHeight/2, carWidth, carHeight, 3);
                ctx.fill();
                
                // Обводка
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Номер позиции
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'transparent';
                ctx.fillText(car.position || '?', 0, 0);
                
                ctx.restore();
            });
        }
        
        // Инфографика: название трассы и страна
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 300, 60);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(track.name, 20, 15);
        
        ctx.fillStyle = '#88c1ff';
        ctx.font = '14px Arial';
        ctx.fillText(`${track.country} • ${track.lapDistance} км`, 20, 40);
    }
    
    // Отображаем время гонки в секундах (если гонка идёт)
    if (careerState.raceStarted && !careerState.raceFinished && careerState.cars && careerState.cars.length > 0) {
        const leader = careerState.cars[0];
        if (leader && leader.totalTime > 0) {
            const totalSeconds = Math.floor(leader.totalTime);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Рисуем фон для текста
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(canvas.width - 140, 10, 130, 50);
            
            // Рисуем время
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            ctx.fillText(`Время: ${timeString}`, canvas.width - 10, 15);
            
            // Текущий круг
            ctx.fillStyle = '#88c1ff';
            ctx.font = '14px Arial';
            ctx.fillText(`Круг: ${careerState.currentLap}/${careerState.totalLaps}`, canvas.width - 10, 40);
        }
    }
}

// Полифилл для roundRect (если не поддерживается)
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

// Цикл анимации (ИСПРАВЛЕННАЯ - без рекурсии)
let animationFrameId = null;

function updateAnimation() {
    // Рендер-цикл: НЕ меняем физику/круги здесь (это делает simulateRace).
    // Если гонка не идёт — рисуем один раз актуальное состояние и полностью останавливаемся.
    if (!careerState.raceStarted || careerState.isPaused || careerState.raceFinished) {
        if (careerState.cars && careerState.cars.length > 0) {
            drawTrack();
            updateStandingsTable();
            updateDriverPanels();
        }
        animationFrameId = null;
        return;
    }

    // Гонка идёт — просто обновляем UI/отрисовку
    if (careerState.cars && careerState.cars.length > 0) {
        drawTrack();
        updateStandingsTable();
        updateDriverPanels();
    }

    animationFrameId = requestAnimationFrame(updateAnimation);
}

// Останавливает анимацию
function stopAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// =================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===================
// Возвращает машину пилота игрока
// Возвращает машину пилота игрока (ИСПРАВЛЕННАЯ)
function getPlayerCar(driverIndex) {
    if (!careerState.cars || careerState.cars.length === 0) return null;
    
    const playerCars = careerState.cars.filter(car => 
        car.team === careerState.playerTeamName
    );
    
    if (driverIndex >= 0 && driverIndex < playerCars.length) {
        return playerCars[driverIndex];
    }
    
    return null;
}

// Показывает результаты гонки
function showRaceResults() {
    const results = careerState.raceResults[careerState.raceResults.length - 1];
    
    let message = `Гонка ${careerState.currentRace - 1}. ${results.track}\n\n`;
    message += 'Топ-10:\n';
    
    for (let i = 0; i < Math.min(10, results.results.length); i++) {
        const result = results.results[i];
        message += `${result.position}. ${result.driver} (${result.team}) - ${result.points} очков\n`;
    }
    
    // Результаты пилотов игрока
    const playerResults = results.results.filter(r => r.team === careerState.playerTeamName);
    if (playerResults.length > 0) {
        message += '\nВаши пилоты:\n';
        playerResults.forEach(result => {
            message += `${result.position}. ${result.driver} - ${result.points} очков\n`;
        });
    }
    
    // Быстрый круг
    if (careerState.fastestLap.driver) {
        message += `\nБыстрый круг: ${careerState.fastestLap.driver} (${careerState.fastestLap.time.toFixed(2)}с)`;
    }
    
    setTimeout(() => {
        alert(message);
    }, 500);
}

// Переходит к следующей гонке
function nextRace() {
    startNextRace();
}