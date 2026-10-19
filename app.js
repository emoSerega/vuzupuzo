let tg = window.Telegram.WebApp;
tg.expand();

// Данные
const DIRECTIONS = [
    "IT и программирование", "Медицина", "Юриспруденция", 
    "Экономика и финансы", "Инженерия и техника", "Гуманитарные науки"
];

const CITIES = [
    "Москва", "Санкт-Петербург", "Казань", "Новосибирск", 
    "Екатеринбург", "Нижний Новгород", "Томск", "Самара", 
    "Ростов-на-Дону", "Краснодар"
];

const container = document.getElementById("content");
const title = document.getElementById("title");

// --- ЭКРАН 1: ВЫБОР НАПРАВЛЕНИЯ ---
function showDirections() {
    title.innerText = "🎓 Выберите направление";
    container.innerHTML = "";
    tg.MainButton.hide(); // Скрываем нижнюю кнопку, пока не выбрано

    DIRECTIONS.forEach(dir => {
        let btn = document.createElement("button");
        btn.className = "btn";
        btn.innerText = dir;
        btn.onclick = () => showCities(dir); // Переход к выбору города
        container.appendChild(btn);
    });

    // Кнопка поиска по баллам
    let scoreBtn = document.createElement("button");
    scoreBtn.className = "btn score-btn";
    scoreBtn.innerText = "📊 Подбор по баллам";
    scoreBtn.onclick = showScoreInput;
    container.appendChild(scoreBtn);
}

// --- ЭКРАН 2: ВЫБОР ГОРОДА ---
function showCities(direction) {
    title.innerText = "🏙 Выберите город";
    container.innerHTML = "";
    
    // Кнопка "Назад"
    let backBtn = document.createElement("button");
    backBtn.className = "btn";
    backBtn.style.background = "#888";
    backBtn.innerText = "⬅️ Назад к направлениям";
    backBtn.onclick = showDirections;
    container.appendChild(backBtn);

    // Кнопка "Все города"
    let allBtn = document.createElement("button");
    allBtn.className = "btn all-btn";
    allBtn.innerText = "🌍 Все города";
    allBtn.onclick = () => sendData({ action: "show_universities", direction: direction, city: "Все" });
    container.appendChild(allBtn);

    CITIES.forEach(city => {
        let btn = document.createElement("button");
        btn.className = "btn";
        btn.innerText = city;
        btn.onclick = () => sendData({ action: "show_universities", direction: direction, city: city });
        container.appendChild(btn);
    });
}

// --- ЭКРАН 3: ВВОД БАЛЛОВ ---
function showScoreInput() {
    title.innerText = "📊 Подбор по баллам";
    container.innerHTML = "";
    
    // Кнопка "Назад"
    let backBtn = document.createElement("button");
    backBtn.className = "btn";
    backBtn.style.background = "#888";
    backBtn.innerText = "⬅️ Назад к направлениям";
    backBtn.onclick = showDirections;
    container.appendChild(backBtn);

    // Поле ввода
    let input = document.createElement("input");
    input.type = "number";
    input.id = "scoreInput";
    input.className = "input-score";
    input.placeholder = "Введите баллы (например, 240)";
    container.appendChild(input);

    // Кнопка найти
    let findBtn = document.createElement("button");
    findBtn.className = "btn score-btn";
    findBtn.innerText = "🔍 Найти вузы";
    findBtn.onclick = () => {
        let score = document.getElementById("scoreInput").value;
        if (!score) return alert("Введите баллы!");
        sendData({ action: "search_score", score: score });
    };
    container.appendChild(findBtn);
}

// --- ОТПРАВКА ДАННЫХ БОТУ ---
function sendData(data) {
    // Отправляем JSON строку в Telegram (бот её получит)
    tg.sendData(JSON.stringify(data));
}

// Инициализация при загрузке
window.onload = () => {
    showDirections();
};
