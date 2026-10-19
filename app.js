let tg = window.Telegram.WebApp;
tg.expand();

tg.MainButton.textColor = "#FFFFFF";
tg.MainButton.color = "#2cab37";

// Данные: направление -> список вузов
const DATA = {
    "IT и программирование": [
        { id: "1", name: "МГТУ им. Баумана", city: "Москва" },
        { id: "2", name: "МФТИ", city: "Москва" },
        { id: "3", name: "ИТМО", city: "Санкт-Петербург" }
    ],
    "Медицина": [
        { id: "4", name: "Сеченовский", city: "Москва" },
        { id: "5", name: "Пироговка", city: "Москва" },
        { id: "6", name: "Павлова", city: "Санкт-Петербург" }
    ],
    "Юриспруденция": [
        { id: "7", name: "МГУ (юрфак)", city: "Москва" },
        { id: "8", name: "МГЮА им. Кутафина", city: "Москва" },
        { id: "9", name: "СПбГУ (юрфак)", city: "Санкт-Петербург" }
    ],
    "Экономика и финансы": [
        { id: "10", name: "ВШЭ", city: "Москва" },
        { id: "11", name: "Финансовый", city: "Москва" },
        { id: "12", name: "СПбГЭУ", city: "Санкт-Петербург" }
    ],
    "Инженерия и техника": [
        { id: "13", name: "Бауманка", city: "Москва" },
        { id: "14", name: "МИСиС", city: "Москва" },
        { id: "15", name: "Политех", city: "Санкт-Петербург" }
    ],
    "Гуманитарные науки": [
        { id: "16", name: "МГУ (истфак)", city: "Москва" },
        { id: "17", name: "РГГУ", city: "Москва" },
        { id: "18", name: "СПбГУ (филфак)", city: "Санкт-Петербург" }
    ]
};

// Эмодзи для красоты
const ICONS = {
    "IT и программирование": "💻",
    "Медицина": "🩺",
    "Юриспруденция": "⚖️",
    "Экономика и финансы": "📊",
    "Инженерия и техника": "⚙️",
    "Гуманитарные науки": "📚"
};

let selectedItem = "";

// Рендерим кнопки направлений
const container = document.getElementById("directions");

Object.keys(DATA).forEach(direction => {
    const item = document.createElement("div");
    item.className = "item";

    // Создаем кнопку
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = ICONS[direction] + " " + direction;

    btn.addEventListener("click", function () {
        // Сбрасываем предыдущий выбор
        tg.MainButton.hide();
        selectedItem = direction;

        tg.MainButton.setText("Показать вузы: " + direction);
        tg.MainButton.show();
    });

    item.appendChild(btn);
    container.appendChild(item);
});

// Отправка данных в бота
Telegram.WebApp.onEvent("mainButtonClicked", function () {
    tg.sendData(JSON.stringify({ direction: selectedItem }));
});