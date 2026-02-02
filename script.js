// =================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===================
let gameState = {
    playerTeamName: '',
    selectedTrack: null,
    isRaceActive: false,
    isPaused: true,
    currentLap: 0,
    cars: [],
    totalLaps: 0,
    intervalId: null,
    simulationSpeed: 3,
    raceStartTime: 0,
    raceElapsedTime: 0,
    lastUpdateTime: 0,
    animationId: null
};

const tireConfigs = {
    soft: { name: 'Soft', color: '#FF0000', wearRate: 4.5, baseLapTime: 95.0, life: 15 },
    medium: { name: 'Medium', color: '#FFFF00', wearRate: 3.0, baseLapTime: 97.0, life: 25 },
    hard: { name: 'Hard', color: '#FFFFFF', wearRate: 1.8, baseLapTime: 99.0, life: 40 }
};

const f1Teams = [
    { name: 'Mercedes', color: '#00D2BE', drivers: ['Hamilton', 'Russell'] },
    { name: 'Ferrari', color: '#DC0000', drivers: ['Leclerc', 'Sainz'] },
    { name: 'Red Bull Racing', color: '#0600EF', drivers: ['Verstappen', 'Perez'] },
    { name: 'McLaren', color: '#FF8700', drivers: ['Norris', 'Piastri'] },
    { name: 'Aston Martin', color: '#006F62', drivers: ['Alonso', 'Stroll'] },
    { name: 'Alpine', color: '#0090FF', drivers: ['Gasly', 'Ocon'] },
    { name: 'Williams', color: '#005AFF', drivers: ['Albon', 'Sargeant'] },
    { name: 'AlphaTauri', color: '#2B4562', drivers: ['Ricciardo', 'Tsunoda'] },
    { name: 'Alfa Romeo', color: '#900000', drivers: ['Bottas', 'Zhou'] },
    { name: 'Haas', color: '#FFFFFF', drivers: ['Magnussen', 'Hulkenberg'] }
];

// =================== ИНИЦИАЛИЗАЦИЯ ===================
document.addEventListener('DOMContentLoaded', function() {
    populateTrackSelect();
    populateLiveTrackSelect();
    setupTrackPreview();
    drawEmptyTrack();
    
    // Запускаем анимацию независимо от состояния гонки
    requestAnimationFrame(updateAnimation);
    
    // Показываем модальное окно при загрузке
    document.getElementById('team-select-modal').style.display = 'flex';
});

// Заполняет выбор трасс в модальном окне
function populateTrackSelect() {
    const select = document.getElementById('track-select');
    tracks.forEach(track => {
        const option = document.createElement('option');
        option.value = track.id;
        option.textContent = `${track.name} (${track.country})`;
        select.appendChild(option);
    });
    if (tracks.length > 0) {
        select.value = tracks[0].id;
        updateTrackPreview(tracks[0]);
    }
}

// Заполняет выбор трасс во время гонки
function populateLiveTrackSelect() {
    const select = document.getElementById('live-track-select');
    tracks.forEach(track => {
        const option = document.createElement('option');
        option.value = track.id;
        option.textContent = track.name;
        select.appendChild(option);
    });
}

// Настраивает предпросмотр трассы
function setupTrackPreview() {
    const select = document.getElementById('track-select');
    select.addEventListener('change', function() {
        const track = tracks.find(t => t.id === this.value);
        if (track) updateTrackPreview(track);
    });
}

// Обновляет предпросмотр трассы
function updateTrackPreview(track) {
    document.getElementById('track-preview-name').textContent = track.name;
    document.getElementById('preview-lap-length').textContent = track.lapDistance + ' км';
    document.getElementById('preview-laps').textContent = track.totalLaps;
    
    const difficultyStars = '★'.repeat(Math.round(track.difficulty)) + '☆'.repeat(3 - Math.round(track.difficulty));
    document.getElementById('preview-difficulty').textContent = difficultyStars;
}

// =================== ЗАПУСК ИГРЫ ===================
function startGame() {
    const teamNameInput = document.getElementById('team-name').value.trim();
    const trackSelect = document.getElementById('track-select').value;

    if (!teamNameInput) {
        alert('Пожалуйста, введите название команды!');
        return;
    }

    gameState.playerTeamName = teamNameInput || 'Моя команда';
    gameState.selectedTrack = tracks.find(t => t.id === trackSelect);
    gameState.totalLaps = gameState.selectedTrack.totalLaps;
    gameState.raceStartTime = Date.now();

    // Скрываем модальное окно
    document.getElementById('team-select-modal').style.display = 'none';

    // Обновляем информацию о гонке
    updateRaceInfo();
    
    // Устанавливаем выбранную трассу в live-селекторе
    document.getElementById('live-track-select').value = trackSelect;

    // Инициализируем машины
    initializeCars();

    // Обновляем таблицу лидеров
    updateStandingsTable();

    // Рисуем трассу
    drawTrack();

    // Добавляем запись в лог
    addSimulationLog(`Сезон 2024 начался! Ваша команда: <strong>${gameState.playerTeamName}</strong>`);
    addSimulationLog(`Первая гонка: <strong>${gameState.selectedTrack.name}</strong> (${gameState.totalLaps} кругов)`);
    
    console.log(`Игра началась! Команда: ${gameState.playerTeamName}, Трасса: ${gameState.selectedTrack.name}`);
}

// =================== КЛАСС МАШИНЫ ===================
class Car {
    constructor(team, color, id, driver) {
        this.id = id;
        this.team = team;
        this.driver = driver;
        this.color = color;
        this.position = 0;
        this.lap = 0;
        this.progress = 0;
        this.speed = 2 + Math.random() * 1; // Скорость движения по трассе (пиксели)
        this.tire = 'medium';
        this.tireWear = 100;
        this.pitStopPlanned = false;
        this.pitStopLap = null;
        this.pitStopInProgress = false;
        this.pitStopCounter = 0;
        this.lastLapTime = 0;
        this.totalTime = 0;
        this.isInPit = false;
        this.pitStopTimeLeft = 0;
        this.targetTire = 'medium';
    }

    // Обновляет прогресс на трассе
    updateProgress(track) {
        if (this.isInPit) {
            // Если в пит-лейне, уменьшаем таймер
            if (this.pitStopTimeLeft > 0) {
                this.pitStopTimeLeft -= 0.1;
                if (this.pitStopTimeLeft <= 0) {
                    this.completePitStop();
                }
            }
            return;
        }
        
        // Двигаем машину по трассе
        this.progress += this.speed * (0.5 + Math.random() * 0.3);
        
        // Если проехали круг
        if (this.progress >= 100) {
            this.completeLap(track);
        }
        
        // Проверяем износ шин
        if (this.tireWear > 0) {
            this.tireWear -= tireConfigs[this.tire].wearRate * 0.05;
            if (this.tireWear < 0) this.tireWear = 0;
        }
        
        // Проверяем запланированный пит-стоп
        if (this.pitStopPlanned && gameState.currentLap >= this.pitStopLap && !this.isInPit) {
            this.startPitStop(track);
        }
    }
    
    // Завершает круг
    completeLap(track) {
        this.lap++;
        this.progress = 0;
        
        // Рассчитываем время круга
        const baseTime = tireConfigs[this.tire].baseLapTime;
        const wearMultiplier = 1 + (100 - this.tireWear) / 200;
        const difficultyMultiplier = track.difficulty;
        const randomFactor = 0.95 + Math.random() * 0.1;
        
        this.lastLapTime = baseTime * wearMultiplier * difficultyMultiplier * randomFactor;
        
        // Сильно замедляемся при изношенных шинах
        if (this.tireWear < 20) {
            this.lastLapTime *= 1.3;
        }
        if (this.tireWear <= 0) {
            this.lastLapTime *= 1.5;
        }
        
        this.totalTime += this.lastLapTime;
        
        // Добавляем в лог быстрые круги
        if (this.lastLapTime < baseTime * 0.98) {
            addSimulationLog(`<span style="color: #66ff66">Быстрый круг!</span> ${this.driver} (${this.team}): ${this.lastLapTime.toFixed(2)}с`);
        }
    }
    
    // Начинает пит-стоп
    startPitStop(track) {
        this.isInPit = true;
        this.pitStopInProgress = true;
        this.pitStopTimeLeft = track.pitLossTime / 10; // Упрощенная симуляция
        
        addSimulationLog(`<span style="color: #ff9900">ПИТ-СТОП:</span> ${this.driver} (${this.team}) заезжает на смену шин`);
    }
    
    // Завершает пит-стоп
    completePitStop() {
        this.tire = this.targetTire;
        this.tireWear = 100;
        this.isInPit = false;
        this.pitStopInProgress = false;
        this.pitStopPlanned = false;
        this.pitStopLap = null;
        this.pitStopCounter++;
        
        addSimulationLog(`<span style="color: #00ff88">${this.driver}</span> вышел из пит-лейна с новыми шинами ${tireConfigs[this.tire].name}`);
    }
}

// =================== УПРАВЛЕНИЕ ГОНКОЙ ===================
// Переключает состояние гонки (старт/пауза)
function toggleRace() {
    const button = document.getElementById('race-control-btn');
    
    if (!gameState.isRaceActive) {
        // Начинаем гонку
        gameState.isRaceActive = true;
        gameState.isPaused = false;
        gameState.raceStartTime = Date.now() - gameState.raceElapsedTime;
        
        button.innerHTML = '<i class="fas fa-pause"></i> Пауза';
        button.style.background = 'linear-gradient(to right, #ff9900, #ff6600)';
        
        document.getElementById('race-status').textContent = 'В процессе';
        document.getElementById('race-status').style.color = '#66ff66';
        
        addSimulationLog('<span style="color: #00ff88">Гонка началась!</span>');
    } else {
        // Пауза или продолжение
        gameState.isPaused = !gameState.isPaused;
        
        if (gameState.isPaused) {
            button.innerHTML = '<i class="fas fa-play"></i> Продолжить';
            button.style.background = 'linear-gradient(to right, #00cc66, #009944)';
            document.getElementById('race-status').textContent = 'Пауза';
            document.getElementById('race-status').style.color = '#ff9900';
            addSimulationLog('<span style="color: #ff9900">Гонка приостановлена</span>');
        } else {
            button.innerHTML = '<i class="fas fa-pause"></i> Пауза';
            button.style.background = 'linear-gradient(to right, #ff9900, #ff6600)';
            document.getElementById('race-status').textContent = 'В процессе';
            document.getElementById('race-status').style.color = '#66ff66';
            addSimulationLog('<span style="color: #00ff88">Гонка продолжена</span>');
            gameState.raceStartTime = Date.now() - gameState.raceElapsedTime;
        }
    }
}

// Устанавливает скорость симуляции
function setSimulationSpeed(speed) {
    gameState.simulationSpeed = speed;
    
    // Обновляем кнопки
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    addSimulationLog(`Скорость симуляции изменена: ${speed}x`);
}

// Запрашивает пит-стоп для пилота
function requestPitStop(driverIndex) {
    const playerCars = gameState.cars.filter(c => c.team === gameState.playerTeamName);
    
    if (driverIndex >= 0 && driverIndex < playerCars.length) {
        const car = playerCars[driverIndex];
        const selectElement = document.getElementById(`driver${driverIndex+1}-tire-select`);
        
        if (car.isInPit) {
            alert(`${car.driver} уже в пит-лейне!`);
            return;
        }
        
        car.pitStopPlanned = true;
        car.pitStopLap = gameState.currentLap + 1; // Заедет на следующем круге
        car.targetTire = selectElement.value;
        
        // Показываем таймер
        const timerElement = document.getElementById(`driver${driverIndex+1}-pit-timer`);
        timerElement.textContent = `Пит-стоп запланирован на круг ${car.pitStopLap}`;
        timerElement.style.color = '#ff9900';
        
        addSimulationLog(`Пит-стоп запланирован для ${car.driver} на круг ${car.pitStopLap}. Новые шины: ${tireConfigs[car.targetTire].name}`);
    }
}

// =================== ВИЗУАЛИЗАЦИЯ ===================
// Основной цикл анимации
function updateAnimation() {
    if (!gameState.isPaused && gameState.isRaceActive && gameState.selectedTrack) {
        // Обновляем время гонки
        gameState.raceElapsedTime = Date.now() - gameState.raceStartTime;
        updateRaceTimer();
        
        // Обновляем прогресс всех машин
        gameState.cars.forEach(car => {
            car.updateProgress(gameState.selectedTrack);
        });
        
        // Обновляем текущий круг (по самой быстрой машине)
        const maxLap = Math.max(...gameState.cars.map(c => c.lap));
        if (maxLap > gameState.currentLap) {
            gameState.currentLap = maxLap;
            updateRaceInfo();
            
            // Проверяем окончание гонки
            if (gameState.currentLap >= gameState.totalLaps) {
                endRace();
            }
        }
        
        // Пересчитываем позиции
        updatePositions();
        
        // Обновляем интерфейс
        drawTrack();
        updateStandingsTable();
        updateDriverPanels();
    }
    
    // Запрашиваем следующий кадр анимации
    gameState.animationId = requestAnimationFrame(updateAnimation);
}

// Рисует трассу и машины
function drawTrack() {
    if (!gameState.selectedTrack) return;
    
    const canvas = document.getElementById('track-canvas');
    const ctx = canvas.getContext('2d');
    const track = gameState.selectedTrack;
    
    // Очищаем холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем трассу
    ctx.beginPath();
    ctx.moveTo(track.coordinates[0].x, track.coordinates[0].y);
    
    for (let i = 1; i < track.coordinates.length; i++) {
        ctx.lineTo(track.coordinates[i].x, track.coordinates[i].y);
    }
    
    // Замыкаем трассу
    ctx.lineTo(track.coordinates[0].x, track.coordinates[0].y);
    
    ctx.strokeStyle = track.color;
    ctx.lineWidth = 6;
    ctx.stroke();
    
    // Рисуем дополнительные линии для красоты
    ctx.strokeStyle = track.color + '80'; // Полупрозрачный
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Рисуем машины
    gameState.cars.forEach(car => {
        const progress = car.progress / 100;
        const totalPoints = track.coordinates.length;
        const segment = progress * totalPoints;
        const segmentIndex = Math.floor(segment) % totalPoints;
        const nextIndex = (segmentIndex + 1) % totalPoints;
        const segmentProgress = segment - segmentIndex;
        
        const x1 = track.coordinates[segmentIndex].x;
        const y1 = track.coordinates[segmentIndex].y;
        const x2 = track.coordinates[nextIndex].x;
        const y2 = track.coordinates[nextIndex].y;
        
        const x = x1 + (x2 - x1) * segmentProgress;
        const y = y1 + (y2 - y1) * segmentProgress;
        
        // Рисуем машину
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        
        if (car.isInPit) {
            // Машина в пит-лейне
            ctx.fillStyle = '#ff9900';
        } else {
            ctx.fillStyle = car.color;
        }
        
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Номер позиции
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(car.position, x, y);
    });
    
    // Рисуем стартовую линию
    const startX = track.coordinates[0].x;
    const startY = track.coordinates[0].y;
    const endX = track.coordinates[1].x;
    const endY = track.coordinates[1].y;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Рисует пустую трассу
function drawEmptyTrack() {
    const canvas = document.getElementById('track-canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#0a1a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#4db8ff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Создайте команду, чтобы начать гонку', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#88c1ff';
    ctx.fillText('Выберите название команды и первую трассу сезона', canvas.width / 2, canvas.height / 2 + 40);
}

// =================== ИНТЕРФЕЙС ===================
// Обновляет информацию о гонке
function updateRaceInfo() {
    if (!gameState.selectedTrack) return;
    
    document.getElementById('track-name').textContent = gameState.selectedTrack.name;
    document.getElementById('current-lap').textContent = gameState.currentLap;
    document.getElementById('total-laps').textContent = gameState.totalLaps;
    
    // Прогресс гонки
    const progressPercent = Math.min(100, (gameState.currentLap / gameState.totalLaps) * 100);
    document.getElementById('race-progress-bar').style.width = progressPercent + '%';
    document.getElementById('race-progress-text').textContent = Math.round(progressPercent) + '%';
}

// Обновляет таймер гонки
function updateRaceTimer() {
    const totalSeconds = Math.floor(gameState.raceElapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    document.getElementById('race-time').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Обновляет таблицу позиций
function updateStandingsTable() {
    const tbody = document.getElementById('standings-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Сортируем машины по позициям
    const sortedCars = [...gameState.cars].sort((a, b) => {
        if (a.lap !== b.lap) return b.lap - a.lap;
        if (a.progress !== b.progress) return b.progress - a.progress;
        return a.totalTime - b.totalTime;
    });
    
    // Обновляем позиции
    sortedCars.forEach((car, index) => {
        car.position = index + 1;
        
        const row = document.createElement('tr');
        if (car.team === gameState.playerTeamName) {
            row.classList.add('player-team');
        }
        
        // Рассчитываем интервал до лидера
        let interval = '-';
        if (index > 0) {
            const leader = sortedCars[0];
            if (car.lap < leader.lap) {
                interval = `+${leader.lap - car.lap}L`;
            } else {
                const timeDiff = car.totalTime - leader.totalTime;
                interval = `+${timeDiff.toFixed(1)}s`;
            }
        }
        
        row.innerHTML = `
            <td class="pos-col">${car.position}</td>
            <td class="driver-col">${car.driver}</td>
            <td class="team-col">${car.team}</td>
            <td class="interval-col">${interval}</td>
            <td class="tire-col" style="color: ${tireConfigs[car.tire].color}">${tireConfigs[car.tire].name}</td>
            <td class="pits-col">${car.pitStopCounter}</td>
            <td class="lastlap-col">${car.lastLapTime > 0 ? car.lastLapTime.toFixed(2) + 's' : '-'}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Обновляет позиции машин
function updatePositions() {
    // Сортируем по пройденной дистанции
    gameState.cars.sort((a, b) => {
        const aDistance = a.lap * 100 + a.progress;
        const bDistance = b.lap * 100 + b.progress;
        return bDistance - aDistance;
    });
    
    // Назначаем позиции
    gameState.cars.forEach((car, index) => {
        car.position = index + 1;
    });
}

// Обновляет панели управления пилотами
function updateDriverPanels() {
    const playerCars = gameState.cars.filter(c => c.team === gameState.playerTeamName);
    
    playerCars.forEach((car, index) => {
        const idx = index + 1;
        
        // Обновляем шины и износ
        document.getElementById(`driver${idx}-tire`).textContent = tireConfigs[car.tire].name;
        document.getElementById(`driver${idx}-tire`).style.color = tireConfigs[car.tire].color;
        
        const wearPercent = Math.max(0, Math.floor(car.tireWear));
        document.getElementById(`driver${idx}-wear`).textContent = wearPercent + '%';
        document.getElementById(`driver${idx}-wear-bar`).style.width = wearPercent + '%';
        
        // Цвет полоски износа в зависимости от состояния
        let wearColor = '#00ff00'; // Зеленый
        if (wearPercent < 50) wearColor = '#ffff00'; // Желтый
        if (wearPercent < 20) wearColor = '#ff0000'; // Красный
        
        document.getElementById(`driver${idx}-wear-bar`).style.backgroundColor = wearColor;
        
        // Обновляем статус
        const statusElement = document.getElementById(`driver${idx}-status`);
        if (car.isInPit) {
            statusElement.textContent = 'В пит-лейне';
            statusElement.style.background = 'rgba(255, 153, 0, 0.3)';
            statusElement.style.color = '#ff9900';
            
            // Обновляем таймер пит-стопа
            const timerElement = document.getElementById(`driver${idx}-pit-timer`);
            if (car.pitStopTimeLeft > 0) {
                timerElement.textContent = `Осталось: ${car.pitStopTimeLeft.toFixed(1)}с`;
            }
        } else {
            statusElement.textContent = 'На трассе';
            statusElement.style.background = 'rgba(0, 200, 0, 0.2)';
            statusElement.style.color = '#66ff66';
        }
        
        // Обновляем счетчик пит-стопов
        document.getElementById(`driver${idx}-pits`).textContent = car.pitStopCounter;
    });
}

// =================== УПРАВЛЕНИЕ ТРАССАМИ ===================
// Показывает селектор трасс
function showTrackSelector() {
    const grid = document.getElementById('tracks-grid-container');
    grid.innerHTML = '';
    
    tracks.forEach(track => {
        const card = document.createElement('div');
        card.className = 'track-card';
        if (gameState.selectedTrack && track.id === gameState.selectedTrack.id) {
            card.classList.add('selected');
        }
        
        card.innerHTML = `
            <div class="track-card-header">
                <div class="track-card-name">${track.name}</div>
                <div class="track-card-country">${track.country}</div>
            </div>
            <div class="track-card-stats">
                <div class="track-card-stat">
                    <div class="track-card-stat-name">Длина круга</div>
                    <div class="track-card-stat-value">${track.lapDistance} км</div>
                </div>
                <div class="track-card-stat">
                    <div class="track-card-stat-name">Кругов</div>
                    <div class="track-card-stat-value">${track.totalLaps}</div>
                </div>
                <div class="track-card-stat">
                    <div class="track-card-stat-name">Сложность</div>
                    <div class="track-card-stat-value">${'★'.repeat(Math.round(track.difficulty))}</div>
                </div>
                <div class="track-card-stat">
                    <div class="track-card-stat-name">Пит-стоп</div>
                    <div class="track-card-stat-value">${track.pitLossTime}с</div>
                </div>
            </div>
            <button class="track-card-select-btn" onclick="selectTrack('${track.id}')">
                Выбрать эту трассу
            </button>
        `;
        
        grid.appendChild(card);
    });
    
    document.getElementById('track-select-modal').style.display = 'flex';
}

// Скрывает селектор трасс
function hideTrackSelector() {
    document.getElementById('track-select-modal').style.display = 'none';
}

// Выбирает трассу
function selectTrack(trackId) {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    
    gameState.selectedTrack = track;
    gameState.totalLaps = track.totalLaps;
    
    // Сбрасываем прогресс гонки
    gameState.currentLap = 0;
    gameState.raceElapsedTime = 0;
    gameState.raceStartTime = Date.now();
    
    // Переинициализируем машины
    initializeCars();
    
    // Обновляем интерфейс
    updateRaceInfo();
    document.getElementById('live-track-select').value = trackId;
    
    addSimulationLog(`Трасса изменена на: <strong>${track.name}</strong>`);
    
    hideTrackSelector();
}

// Меняет трассу во время гонки
function changeTrackLive(trackId) {
    if (!trackId) return;
    
    if (gameState.isRaceActive && !gameState.isPaused) {
        if (!confirm('Изменить трассу во время гонки? Текущий прогресс будет сброшен.')) {
            document.getElementById('live-track-select').value = gameState.selectedTrack.id;
            return;
        }
    }
    
    selectTrack(trackId);
}

// =================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===================
// Инициализирует машины
function initializeCars() {
    gameState.cars = [];
    
    // Машины игрока
    const playerTeamColor = '#FF0000';
    gameState.cars.push(new Car(gameState.playerTeamName, playerTeamColor, 0, 'Пилот #1'));
    gameState.cars.push(new Car(gameState.playerTeamName, playerTeamColor, 1, 'Пилот #2'));
    
    // Машины соперников
    let carId = 2;
    f1Teams.forEach(team => {
        team.drivers.forEach(driverName => {
            gameState.cars.push(new Car(team.name, team.color, carId, driverName));
            carId++;
        });
    });
    
    // Случайный стартовый порядок
    shuffleArray(gameState.cars);
    gameState.cars.forEach((car, index) => {
        car.position = index + 1;
        car.id = index;
        
        // Случайный тип стартовых шин
        const tireTypes = ['soft', 'medium', 'hard'];
        car.tire = tireTypes[Math.floor(Math.random() * tireTypes.length)];
        car.tireWear = 70 + Math.random() * 25; // Начинаем с частично изношенных шин
    });
}

// Завершает гонку
function endRace() {
    gameState.isRaceActive = false;
    gameState.isPaused = true;
    
    const button = document.getElementById('race-control-btn');
    button.innerHTML = '<i class="fas fa-flag-checkered"></i> Гонка завершена';
    button.style.background = 'linear-gradient(to right, #666666, #444444)';
    button.disabled = true;
    
    document.getElementById('race-status').textContent = 'Завершена';
    document.getElementById('race-status').style.color = '#ff6666';
    
    const winner = gameState.cars[0];
    addSimulationLog(`<span style="color: #ffcc00"><strong>ГОНКА ЗАВЕРШЕНА!</strong> Победитель: ${winner.driver} (${winner.team})</span>`);
    
    // Показываем подиум
    setTimeout(() => {
        alert(`Гонка завершена!\n\nПодиум:\n1. ${winner.driver} (${winner.team})\n2. ${gameState.cars[1].driver} (${gameState.cars[1].team})\n3. ${gameState.cars[2].driver} (${gameState.cars[2].team})`);
    }, 500);
}

// Добавляет запись в лог симуляции
function addSimulationLog(message) {
    const logContainer = document.getElementById('simulation-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}] ${message}`;
    
    logContainer.appendChild(entry);
    
    // Автопрокрутка вниз
    logContainer.scrollTop = logContainer.scrollHeight;
    
    // Ограничиваем количество записей
    const entries = logContainer.querySelectorAll('.log-entry');
    if (entries.length > 50) {
        entries[0].remove();
    }
}

// Очищает лог симуляции
function clearSimulationLog() {
    document.getElementById('simulation-log').innerHTML = '';
}

// Перемешивает массив
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}