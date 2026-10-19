let tg = window.Telegram.WebApp;
tg.expand();
tg.MainButton.textColor = "#FFFFFF";
tg.MainButton.color = "#2cab37";

// Данные (для красоты, чтобы кнопки не были пустыми до запроса в бота)
const DIRECTIONS = [
    "IT и программирование", "Медицина", "Юриспруденция", 
    "Экономика и финансы", "Инженерия и техника", "Гуманитарные науки"
];
const CITIES = ["Москва", "Санкт-Петербург", "Казань", "Новосибирск", "Екатеринбург", "Нижний Новгород", "Томск", "Самара", "Ростов-на-Дону", "Краснодар"];

let selectedData = { direction: "", city: "", action: "" };

const container = document.getElementById("content");
const title = document.getElementById("title");

// --- ЭКРАН 1: НАПРАВЛЕНИЯ ---
function showDirections() {
    title.innerText = "🎓 Выберите направление";
    container.innerHTML = "";
    tg.MainButton.hide();

    DIRECTIONS.forEach(dir => {
        let btn = document.createElement("button");
        btn.className = "btn";
        btn.innerText = dir;
        btn.onclick = () => showCities(dir);
        container.appendChild(btn);
    });
}

// --- ЭКРАН 2: ГОРОДА ---
function showCities(direction) {
    title.innerText = "🏙 Выберите город";
    container.innerHTML = "";
    tg.MainButton.hide();
    selectedData.direction = direction;
    selectedData.action = "show_universities";

    // Добавляем кнопку "Все города"
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

// --- КНОПКА ВВОДА БАЛЛОВ ---
function showScoreInput() {
    title.innerText = "📊 Подбор по баллам";
    container.innerHTML = `
        <input type="number" id="scoreInput" placeholder="Введите баллы (например 240)" class="input-score">
        <button class="btn" onclick="submitScore()">Найти вузы</button>
    `;
    tg.MainButton.hide();
}

function submitScore() {
    let score = document.getElementById("scoreInput").value;
    if (!score) return alert("Введите баллы!");
    sendData({ action: "search_score", score: score });
}

// --- ОТПРАВКА ДАННЫХ В БОТА ---
function sendData(data) {
    tg.sendData(JSON.stringify(data));
}

// Инициализация
window.onload = () => {
    showDirections();
    
    // Добавляем кнопку "Поиск по баллам" на главный экран
    let scoreBtn = document.createElement("button");
    scoreBtn.className = "btn score-btn";
    scoreBtn.innerText = "📊 Подбор по баллам";
    scoreBtn.onclick = showScoreInput;
    container.appendChild(scoreBtn);
};
