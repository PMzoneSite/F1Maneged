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
        // Координаты для отрисовки (схематично)
        coordinates: [
            { x: 100, y: 300 }, { x: 200, y: 150 }, { x: 350, y: 100 },
            { x: 500, y: 150 }, { x: 600, y: 250 }, { x: 650, y: 400 },
            { x: 550, y: 450 }, { x: 400, y: 400 }, { x: 250, y: 450 },
            { x: 150, y: 400 }
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
        coordinates: [
            { x: 150, y: 100 }, { x: 300, y: 80 }, { x: 450, y: 120 },
            { x: 550, y: 200 }, { x: 600, y: 300 }, { x: 550, y: 400 },
            { x: 450, y: 450 }, { x: 300, y: 420 }, { x: 180, y: 350 },
            { x: 120, y: 250 }
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
        coordinates: [
            { x: 100, y: 150 }, { x: 250, y: 100 }, { x: 400, y: 120 },
            { x: 550, y: 200 }, { x: 650, y: 300 }, { x: 600, y: 400 },
            { x: 450, y: 450 }, { x: 300, y: 400 }, { x: 200, y: 350 },
            { x: 120, y: 250 }
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
        coordinates: [
            { x: 100, y: 400 }, { x: 150, y: 300 }, { x: 200, y: 250 },
            { x: 300, y: 200 }, { x: 400, y: 180 }, { x: 500, y: 200 },
            { x: 600, y: 250 }, { x: 650, y: 350 }, { x: 600, y: 400 },
            { x: 500, y: 420 }, { x: 400, y: 400 }, { x: 300, y: 380 },
            { x: 200, y: 350 }
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
        coordinates: [
            { x: 150, y: 150 }, { x: 300, y: 100 }, { x: 450, y: 120 },
            { x: 550, y: 200 }, { x: 600, y: 300 }, { x: 550, y: 400 },
            { x: 450, y: 450 }, { x: 300, y: 420 }, { x: 200, y: 350 },
            { x: 150, y: 250 }
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
        coordinates: [
            { x: 100, y: 200 }, { x: 200, y: 100 }, { x: 350, y: 80 },
            { x: 500, y: 100 }, { x: 600, y: 180 }, { x: 650, y: 300 },
            { x: 600, y: 400 }, { x: 500, y: 450 }, { x: 350, y: 420 },
            { x: 200, y: 350 }, { x: 120, y: 250 }
        ]
    }
];