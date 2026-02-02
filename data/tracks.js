const tracks = [
    {
        id: 'monza',
        name: 'Autodromo Nazionale Monza',
        country: 'Italy',
        color: '#006400',
        lapDistance: 5.793,
        totalLaps: 53,
        pitLossTime: 25,
        difficulty: 0.8,
        // Уникальная конфигурация Monza - быстрая трасса с длинными прямыми
        coordinates: [
            { x: 400, y: 50 }, { x: 650, y: 80 }, { x: 750, y: 150 },
            { x: 750, y: 250 }, { x: 700, y: 350 }, { x: 600, y: 400 },
            { x: 450, y: 420 }, { x: 300, y: 400 }, { x: 200, y: 350 },
            { x: 150, y: 280 }, { x: 120, y: 200 }, { x: 150, y: 120 },
            { x: 250, y: 70 }
        ]
    },
    {
        id: 'silverstone',
        name: 'Silverstone Circuit',
        country: 'UK',
        color: '#1E90FF',
        lapDistance: 5.891,
        totalLaps: 52,
        pitLossTime: 28,
        difficulty: 0.9,
        // Silverstone - техничная трасса с быстрыми поворотами
        coordinates: [
            { x: 200, y: 100 }, { x: 400, y: 60 }, { x: 600, y: 80 },
            { x: 720, y: 150 }, { x: 750, y: 250 }, { x: 720, y: 350 },
            { x: 650, y: 400 }, { x: 500, y: 420 }, { x: 350, y: 400 },
            { x: 250, y: 350 }, { x: 180, y: 280 }, { x: 150, y: 200 },
            { x: 160, y: 140 }
        ]
    },
    {
        id: 'spa',
        name: 'Circuit de Spa-Francorchamps',
        country: 'Belgium',
        color: '#FFD700',
        lapDistance: 7.004,
        totalLaps: 44,
        pitLossTime: 30,
        difficulty: 1.0,
        // Spa - длинная трасса с элевацией
        coordinates: [
            { x: 100, y: 120 }, { x: 250, y: 60 }, { x: 450, y: 50 },
            { x: 650, y: 80 }, { x: 750, y: 150 }, { x: 780, y: 280 },
            { x: 750, y: 380 }, { x: 650, y: 420 }, { x: 500, y: 430 },
            { x: 350, y: 400 }, { x: 220, y: 350 }, { x: 140, y: 280 },
            { x: 100, y: 200 }
        ]
    },
    {
        id: 'monaco',
        name: 'Circuit de Monaco',
        country: 'Monaco',
        color: '#C0C0C0',
        lapDistance: 3.337,
        totalLaps: 78,
        pitLossTime: 22,
        difficulty: 1.2,
        // Monaco - узкая уличная трасса
        coordinates: [
            { x: 100, y: 400 }, { x: 150, y: 320 }, { x: 200, y: 260 },
            { x: 280, y: 220 }, { x: 380, y: 200 }, { x: 480, y: 210 },
            { x: 580, y: 240 }, { x: 650, y: 300 }, { x: 680, y: 360 },
            { x: 650, y: 410 }, { x: 580, y: 430 }, { x: 480, y: 420 },
            { x: 380, y: 400 }, { x: 280, y: 380 }, { x: 200, y: 360 },
            { x: 140, y: 420 }
        ]
    },
    {
        id: 'interlagos',
        name: 'Autódromo José Carlos Pace',
        country: 'Brazil',
        color: '#009900',
        lapDistance: 4.309,
        totalLaps: 71,
        pitLossTime: 26,
        difficulty: 0.9,
        // Interlagos - контрастная трасса
        coordinates: [
            { x: 150, y: 120 }, { x: 300, y: 80 }, { x: 480, y: 90 },
            { x: 620, y: 140 }, { x: 700, y: 220 }, { x: 720, y: 320 },
            { x: 680, y: 400 }, { x: 580, y: 440 }, { x: 450, y: 450 },
            { x: 320, y: 430 }, { x: 220, y: 380 }, { x: 160, y: 310 },
            { x: 140, y: 230 }, { x: 130, y: 170 }
        ]
    },
    {
        id: 'cota',
        name: 'Circuit of the Americas',
        country: 'USA',
        color: '#FF0000',
        lapDistance: 5.513,
        totalLaps: 56,
        pitLossTime: 27,
        difficulty: 0.9,
        // COTA - современная трасса с эсс-образными секциями
        coordinates: [
            { x: 100, y: 180 }, { x: 200, y: 100 }, { x: 350, y: 70 },
            { x: 500, y: 80 }, { x: 620, y: 120 }, { x: 700, y: 180 },
            { x: 750, y: 260 }, { x: 750, y: 340 }, { x: 700, y: 400 },
            { x: 600, y: 430 }, { x: 450, y: 440 }, { x: 300, y: 420 },
            { x: 180, y: 380 }, { x: 120, y: 320 }, { x: 100, y: 250 }
        ]
    },
    {
        id: 'suzuka',
        name: 'Suzuka International Racing Course',
        country: 'Japan',
        color: '#FF6B6B',
        lapDistance: 5.807,
        totalLaps: 53,
        pitLossTime: 26,
        difficulty: 1.1,
        // Suzuka - знаменитая восьмёрка
        coordinates: [
            { x: 400, y: 50 }, { x: 550, y: 80 }, { x: 680, y: 140 },
            { x: 750, y: 220 }, { x: 780, y: 320 }, { x: 750, y: 400 },
            { x: 680, y: 450 }, { x: 550, y: 470 }, { x: 400, y: 450 },
            { x: 250, y: 400 }, { x: 150, y: 320 }, { x: 120, y: 220 },
            { x: 150, y: 140 }, { x: 250, y: 80 }
        ]
    },
    {
        id: 'bahrain',
        name: 'Bahrain International Circuit',
        country: 'Bahrain',
        color: '#FFA500',
        lapDistance: 5.412,
        totalLaps: 57,
        pitLossTime: 25,
        difficulty: 0.85,
        // Bahrain - пустынная трасса
        coordinates: [
            { x: 200, y: 100 }, { x: 400, y: 70 }, { x: 600, y: 90 },
            { x: 720, y: 160 }, { x: 750, y: 260 }, { x: 720, y: 360 },
            { x: 620, y: 420 }, { x: 480, y: 440 }, { x: 340, y: 420 },
            { x: 220, y: 360 }, { x: 150, y: 260 }, { x: 180, y: 160 }
        ]
    },
    {
        id: 'barcelona',
        name: 'Circuit de Barcelona-Catalunya',
        country: 'Spain',
        color: '#FFD700',
        lapDistance: 4.675,
        totalLaps: 66,
        pitLossTime: 24,
        difficulty: 0.9,
        // Barcelona - тестовая трасса
        coordinates: [
            { x: 150, y: 120 }, { x: 320, y: 80 }, { x: 500, y: 90 },
            { x: 650, y: 140 }, { x: 720, y: 220 }, { x: 750, y: 320 },
            { x: 720, y: 400 }, { x: 630, y: 440 }, { x: 500, y: 450 },
            { x: 370, y: 430 }, { x: 260, y: 380 }, { x: 180, y: 310 },
            { x: 140, y: 230 }, { x: 130, y: 170 }
        ]
    },
    {
        id: 'hungaroring',
        name: 'Hungaroring',
        country: 'Hungary',
        color: '#00CED1',
        lapDistance: 4.381,
        totalLaps: 70,
        pitLossTime: 23,
        difficulty: 0.95,
        // Hungaroring - извилистая трасса
        coordinates: [
            { x: 200, y: 100 }, { x: 380, y: 70 }, { x: 550, y: 85 },
            { x: 680, y: 130 }, { x: 750, y: 200 }, { x: 770, y: 300 },
            { x: 740, y: 390 }, { x: 660, y: 440 }, { x: 540, y: 450 },
            { x: 420, y: 430 }, { x: 300, y: 380 }, { x: 200, y: 310 },
            { x: 140, y: 230 }, { x: 150, y: 150 }
        ]
    },
    {
        id: 'singapore',
        name: 'Marina Bay Street Circuit',
        country: 'Singapore',
        color: '#FF1493',
        lapDistance: 5.063,
        totalLaps: 61,
        pitLossTime: 25,
        difficulty: 1.15,
        // Singapore - ночная уличная трасса
        coordinates: [
            { x: 100, y: 350 }, { x: 150, y: 280 }, { x: 220, y: 230 },
            { x: 320, y: 200 }, { x: 440, y: 190 }, { x: 560, y: 200 },
            { x: 660, y: 240 }, { x: 720, y: 300 }, { x: 750, y: 370 },
            { x: 720, y: 420 }, { x: 640, y: 440 }, { x: 540, y: 430 },
            { x: 440, y: 400 }, { x: 360, y: 360 }, { x: 300, y: 310 },
            { x: 250, y: 380 }, { x: 180, y: 400 }
        ]
    },
    {
        id: 'abudhabi',
        name: 'Yas Marina Circuit',
        country: 'UAE',
        color: '#00FFFF',
        lapDistance: 5.554,
        totalLaps: 55,
        pitLossTime: 26,
        difficulty: 0.9,
        // Abu Dhabi - современная трасса
        coordinates: [
            { x: 150, y: 100 }, { x: 350, y: 60 }, { x: 550, y: 80 },
            { x: 700, y: 140 }, { x: 780, y: 240 }, { x: 780, y: 340 },
            { x: 720, y: 420 }, { x: 600, y: 450 }, { x: 460, y: 440 },
            { x: 330, y: 400 }, { x: 220, y: 340 }, { x: 150, y: 260 },
            { x: 120, y: 180 }
        ]
    },
    {
        id: 'redbullring',
        name: 'Red Bull Ring',
        country: 'Austria',
        color: '#FF0000',
        lapDistance: 4.318,
        totalLaps: 71,
        pitLossTime: 22,
        difficulty: 0.85,
        // Red Bull Ring - короткая быстрая трасса
        coordinates: [
            { x: 250, y: 80 }, { x: 450, y: 60 }, { x: 650, y: 90 },
            { x: 750, y: 160 }, { x: 780, y: 260 }, { x: 750, y: 360 },
            { x: 680, y: 420 }, { x: 550, y: 440 }, { x: 400, y: 430 },
            { x: 270, y: 380 }, { x: 180, y: 300 }, { x: 150, y: 200 },
            { x: 180, y: 120 }
        ]
    },
    {
        id: 'zandvoort',
        name: 'Circuit Zandvoort',
        country: 'Netherlands',
        color: '#FF8C00',
        lapDistance: 4.259,
        totalLaps: 72,
        pitLossTime: 23,
        difficulty: 1.0,
        // Zandvoort - прибрежная трасса с банками
        coordinates: [
            { x: 180, y: 100 }, { x: 380, y: 70 }, { x: 580, y: 85 },
            { x: 720, y: 140 }, { x: 780, y: 230 }, { x: 780, y: 330 },
            { x: 720, y: 410 }, { x: 600, y: 440 }, { x: 460, y: 440 },
            { x: 330, y: 400 }, { x: 220, y: 330 }, { x: 150, y: 240 },
            { x: 130, y: 150 }
        ]
    },
    {
        id: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari',
        country: 'Italy',
        color: '#8B0000',
        lapDistance: 4.909,
        totalLaps: 63,
        pitLossTime: 25,
        difficulty: 1.05,
        // Imola - классическая итальянская трасса
        coordinates: [
            { x: 200, y: 120 }, { x: 400, y: 80 }, { x: 600, y: 100 },
            { x: 720, y: 160 }, { x: 760, y: 260 }, { x: 740, y: 360 },
            { x: 660, y: 420 }, { x: 520, y: 440 }, { x: 380, y: 420 },
            { x: 260, y: 360 }, { x: 180, y: 280 }, { x: 140, y: 200 },
            { x: 160, y: 150 }
        ]
    },
    {
        id: 'miami',
        name: 'Miami International Autodrome',
        country: 'USA',
        color: '#FF69B4',
        lapDistance: 5.412,
        totalLaps: 57,
        pitLossTime: 26,
        difficulty: 0.9,
        // Miami - уличная трасса в США
        coordinates: [
            { x: 150, y: 150 }, { x: 350, y: 100 }, { x: 550, y: 110 },
            { x: 700, y: 170 }, { x: 770, y: 270 }, { x: 770, y: 370 },
            { x: 700, y: 440 }, { x: 560, y: 460 }, { x: 420, y: 450 },
            { x: 290, y: 410 }, { x: 190, y: 340 }, { x: 130, y: 260 },
            { x: 120, y: 200 }
        ]
    },
    {
        id: 'jeddah',
        name: 'Jeddah Corniche Circuit',
        country: 'Saudi Arabia',
        color: '#00FF00',
        lapDistance: 6.174,
        totalLaps: 50,
        pitLossTime: 28,
        difficulty: 1.1,
        // Jeddah - самая быстрая уличная трасса
        coordinates: [
            { x: 100, y: 200 }, { x: 250, y: 120 }, { x: 450, y: 80 },
            { x: 650, y: 100 }, { x: 780, y: 180 }, { x: 800, y: 300 },
            { x: 750, y: 400 }, { x: 640, y: 450 }, { x: 500, y: 460 },
            { x: 360, y: 430 }, { x: 240, y: 370 }, { x: 160, y: 290 },
            { x: 120, y: 240 }
        ]
    },
    {
        id: 'melbourne',
        name: 'Albert Park Circuit',
        country: 'Australia',
        color: '#00CED1',
        lapDistance: 5.278,
        totalLaps: 58,
        pitLossTime: 24,
        difficulty: 0.9,
        // Melbourne - парковая трасса
        coordinates: [
            { x: 200, y: 100 }, { x: 400, y: 70 }, { x: 600, y: 90 },
            { x: 720, y: 150 }, { x: 760, y: 250 }, { x: 740, y: 350 },
            { x: 660, y: 410 }, { x: 520, y: 430 }, { x: 380, y: 420 },
            { x: 260, y: 370 }, { x: 180, y: 290 }, { x: 140, y: 210 },
            { x: 160, y: 140 }
        ]
    },
    {
        id: 'shanghai',
        name: 'Shanghai International Circuit',
        country: 'China',
        color: '#FF4500',
        lapDistance: 5.451,
        totalLaps: 56,
        pitLossTime: 27,
        difficulty: 0.95,
        // Shanghai - трасса в форме иероглифа
        coordinates: [
            { x: 150, y: 130 }, { x: 350, y: 90 }, { x: 550, y: 100 },
            { x: 700, y: 160 }, { x: 770, y: 260 }, { x: 760, y: 360 },
            { x: 680, y: 430 }, { x: 540, y: 450 }, { x: 400, y: 440 },
            { x: 280, y: 390 }, { x: 190, y: 320 }, { x: 140, y: 240 },
            { x: 130, y: 180 }
        ]
    }
];