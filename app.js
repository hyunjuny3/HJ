const TODAY = new Date();

const seriesColors = {
  F1: "#ff2d24",
  DTM: "#00c79a",
  WEC: "#4d8cff",
  IMSA: "#ffad32",
  "Porsche Cup": "#d7b56d",
};

const seriesSources = {
  F1: {
    site: "Formula1.com",
    calendar: "https://www.formula1.com/en/racing/2026",
    standings: "https://www.formula1.com/en/results/2026/drivers/",
    news: "https://www.formula1.com/en/latest/all",
  },
  DTM: {
    site: "DTM",
    calendar: "https://www.adac-motorsport.de/en/dtm/",
    standings: "https://www.dtm.com/en/standings",
    news: "https://www.dtm.com/en/news",
  },
  WEC: {
    site: "FIA WEC",
    calendar: "https://www.fia.com/events/world-endurance-championship/season-2026/fia-world-endurance-championship",
    standings: "https://www.fia.com/events/world-endurance-championship/season-2026/standings",
    news: "https://www.fiawec.com/en/news",
  },
  IMSA: {
    site: "IMSA",
    calendar: "https://www.imsa.com/weathertech/weathertech-2026-schedule/",
    standings: "https://www.imsa.com/weathertech/standings/",
    news: "https://www.imsa.com/news/",
  },
  "Porsche Cup": {
    site: "Porsche Motorsport",
    calendar: "https://racing.porsche.com/en-US/series/carrera-cup-north-america",
    standings: "https://racing.porsche.com/en-US/series/carrera-cup-north-america",
    news: "https://racing.porsche.com/en-US/series/carrera-cup-north-america",
  },
};

const formatter = new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" });
const fullFormatter = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric" });
let activeSeries = "all";
let query = "";

const baseEvents = [
  ["IMSA", "테스트", "Roar Before The Rolex 24", "2026-01-16", "2026-01-18", "Daytona International Speedway", "Daytona Beach, USA", "N/A"],
  ["IMSA", "레이스", "Rolex 24 At DAYTONA", "2026-01-21", "2026-01-25", "Daytona International Speedway", "Daytona Beach, USA", "24 Hours"],
  ["F1", "테스트", "Pre-Season Testing 1", "2026-02-11", "2026-02-13", "Bahrain International Circuit", "Sakhir, Bahrain", ""],
  ["F1", "테스트", "Pre-Season Testing 2", "2026-02-18", "2026-02-20", "Bahrain International Circuit", "Sakhir, Bahrain", ""],
  ["F1", "라운드 1", "Australian Grand Prix", "2026-03-06", "2026-03-08", "Albert Park", "Melbourne, Australia", ""],
  ["F1", "라운드 2", "Chinese Grand Prix", "2026-03-13", "2026-03-15", "Shanghai International Circuit", "Shanghai, China", ""],
  ["IMSA", "레이스", "Mobil 1 Twelve Hours of Sebring", "2026-03-18", "2026-03-21", "Sebring International Raceway", "Sebring, USA", "12 Hours"],
  ["Porsche Cup", "라운드 1", "12 Hours of Sebring Support", "2026-03-18", "2026-03-20", "Sebring International Raceway", "Sebring, USA", "Carrera Cup NA"],
  ["F1", "라운드 3", "Japanese Grand Prix", "2026-03-27", "2026-03-29", "Suzuka Circuit", "Suzuka, Japan", ""],
  ["WEC", "테스트", "Official Prologue", "2026-04-14", "2026-04-14", "Imola Circuit", "Imola, Italy", ""],
  ["IMSA", "레이스", "Acura Grand Prix of Long Beach", "2026-04-17", "2026-04-19", "Long Beach Street Circuit", "Long Beach, USA", "100 Minutes"],
  ["Porsche Cup", "라운드 2", "Grand Prix of Long Beach Support", "2026-04-17", "2026-04-19", "Long Beach Street Circuit", "Long Beach, USA", "Carrera Cup NA"],
  ["WEC", "라운드 1", "6 Hours of Imola", "2026-04-17", "2026-04-19", "Imola Circuit", "Imola, Italy", "6 Hours"],
  ["DTM", "라운드 1", "Red Bull Ring", "2026-04-24", "2026-04-26", "Red Bull Ring", "Spielberg, Austria", ""],
  ["IMSA", "레이스", "WeatherTech Raceway Laguna Seca", "2026-05-01", "2026-05-03", "WeatherTech Raceway Laguna Seca", "Monterey, USA", "2h 40m"],
  ["F1", "라운드 4", "Miami Grand Prix", "2026-05-01", "2026-05-03", "Miami International Autodrome", "Miami, USA", ""],
  ["Porsche Cup", "라운드 3", "Miami Grand Prix Support", "2026-05-01", "2026-05-03", "Miami International Autodrome", "Miami, USA", "Carrera Cup NA"],
  ["WEC", "라운드 2", "TotalEnergies 6 Hours of Spa-Francorchamps", "2026-05-07", "2026-05-09", "Circuit de Spa-Francorchamps", "Stavelot, Belgium", "6 Hours"],
  ["DTM", "라운드 2", "Circuit Zandvoort", "2026-05-22", "2026-05-24", "Circuit Zandvoort", "Zandvoort, Netherlands", ""],
  ["F1", "라운드 5", "Canadian Grand Prix", "2026-05-22", "2026-05-24", "Circuit Gilles Villeneuve", "Montreal, Canada", ""],
  ["IMSA", "레이스", "Chevrolet Detroit Grand Prix Presented By Lear", "2026-05-29", "2026-05-30", "Detroit Street Circuit", "Detroit, USA", "100 Minutes"],
  ["F1", "라운드 6", "Monaco Grand Prix", "2026-06-05", "2026-06-07", "Circuit de Monaco", "Monte Carlo, Monaco", ""],
  ["Porsche Cup", "라운드 1", "Porsche Supercup Monaco", "2026-06-04", "2026-06-07", "Circuit de Monaco", "Monte Carlo, Monaco", "Supercup"],
  ["F1", "라운드 7", "Barcelona-Catalunya Grand Prix", "2026-06-12", "2026-06-14", "Circuit de Barcelona-Catalunya", "Barcelona, Spain", ""],
  ["Porsche Cup", "라운드 2", "Porsche Supercup Spain", "2026-06-12", "2026-06-14", "Circuit de Barcelona-Catalunya", "Barcelona, Spain", "Supercup"],
  ["WEC", "라운드 3", "24 Hours of Le Mans", "2026-06-13", "2026-06-14", "Circuit de la Sarthe", "Le Mans, France", "24 Hours"],
  ["DTM", "라운드 3", "DEKRA Lausitzring", "2026-06-19", "2026-06-21", "Lausitzring", "Klettwitz, Germany", ""],
  ["IMSA", "레이스", "Sahlen's Six Hours of The Glen", "2026-06-25", "2026-06-28", "Watkins Glen International", "Watkins Glen, USA", "6 Hours"],
  ["Porsche Cup", "라운드 4", "Six Hours of the Glen Support", "2026-06-25", "2026-06-27", "Watkins Glen International", "Watkins Glen, USA", "Carrera Cup NA"],
  ["F1", "라운드 8", "Austrian Grand Prix", "2026-06-26", "2026-06-28", "Red Bull Ring", "Spielberg, Austria", ""],
  ["Porsche Cup", "라운드 3", "Porsche Supercup Austria", "2026-06-26", "2026-06-28", "Red Bull Ring", "Spielberg, Austria", "Supercup"],
  ["DTM", "라운드 4", "Norisring", "2026-07-03", "2026-07-05", "Norisring", "Nuremberg, Germany", ""],
  ["F1", "라운드 9", "British Grand Prix", "2026-07-03", "2026-07-05", "Silverstone Circuit", "Silverstone, United Kingdom", ""],
  ["IMSA", "레이스", "Chevrolet Grand Prix", "2026-07-10", "2026-07-12", "Canadian Tire Motorsport Park", "Bowmanville, Canada", "2h 40m"],
  ["WEC", "라운드 4", "Rolex 6 Hours of Sao Paulo", "2026-07-10", "2026-07-12", "Interlagos", "Sao Paulo, Brazil", "6 Hours"],
  ["F1", "라운드 10", "Belgian Grand Prix", "2026-07-17", "2026-07-19", "Circuit de Spa-Francorchamps", "Stavelot, Belgium", ""],
  ["Porsche Cup", "라운드 4", "Porsche Supercup Belgium", "2026-07-17", "2026-07-19", "Circuit de Spa-Francorchamps", "Stavelot, Belgium", "Supercup"],
  ["DTM", "라운드 5", "Motorsport Arena Oschersleben", "2026-07-24", "2026-07-26", "Motorsport Arena Oschersleben", "Oschersleben, Germany", ""],
  ["F1", "라운드 11", "Hungarian Grand Prix", "2026-07-24", "2026-07-26", "Hungaroring", "Mogyorod, Hungary", ""],
  ["Porsche Cup", "라운드 5", "Porsche Supercup Hungary", "2026-07-24", "2026-07-26", "Hungaroring", "Budapest, Hungary", "Supercup"],
  ["IMSA", "레이스", "Motul SportsCar Endurance Grand Prix", "2026-07-30", "2026-08-02", "Road America", "Elkhart Lake, USA", "6 Hours"],
  ["Porsche Cup", "라운드 5", "SportsCar Grand Prix Support", "2026-07-30", "2026-08-01", "Road America", "Elkhart Lake, USA", "Carrera Cup NA"],
  ["DTM", "라운드 6", "Nurburgring", "2026-08-14", "2026-08-16", "Nurburgring", "Nurburg, Germany", ""],
  ["F1", "라운드 12", "Dutch Grand Prix", "2026-08-21", "2026-08-23", "Circuit Zandvoort", "Zandvoort, Netherlands", ""],
  ["Porsche Cup", "라운드 6-7", "Porsche Supercup Dutch Double-Header", "2026-08-21", "2026-08-23", "Circuit Zandvoort", "Zandvoort, Netherlands", "Supercup"],
  ["IMSA", "레이스", "Michelin GT Challenge at VIR", "2026-08-21", "2026-08-23", "VIRginia International Raceway", "Alton, USA", "2h 40m"],
  ["F1", "라운드 13", "Italian Grand Prix", "2026-09-04", "2026-09-06", "Monza", "Monza, Italy", ""],
  ["Porsche Cup", "라운드 8", "Porsche Supercup Italy", "2026-09-04", "2026-09-06", "Autodromo Nazionale di Monza", "Monza, Italy", "Supercup"],
  ["WEC", "라운드 5", "Lone Star Le Mans", "2026-09-04", "2026-09-06", "Circuit of the Americas", "Austin, USA", ""],
  ["DTM", "라운드 7", "Sachsenring", "2026-09-11", "2026-09-13", "Sachsenring", "Hohenstein-Ernstthal, Germany", ""],
  ["F1", "라운드 14", "Spanish Grand Prix", "2026-09-11", "2026-09-13", "Madring", "Madrid, Spain", ""],
  ["IMSA", "레이스", "TireRack.com Battle On The Bricks", "2026-09-18", "2026-09-20", "Indianapolis Motor Speedway", "Indianapolis, USA", "2h 40m"],
  ["Porsche Cup", "라운드 6", "Battle on the Bricks Support", "2026-09-18", "2026-09-20", "Indianapolis Motor Speedway", "Indianapolis, USA", "Carrera Cup NA"],
  ["F1", "라운드 15", "Azerbaijan Grand Prix", "2026-09-24", "2026-09-26", "Baku City Circuit", "Baku, Azerbaijan", ""],
  ["WEC", "라운드 6", "6 Hours of Fuji", "2026-09-25", "2026-09-27", "Fuji Speedway", "Oyama, Japan", "6 Hours"],
  ["IMSA", "레이스", "Motul Petit Le Mans", "2026-09-30", "2026-10-03", "Michelin Raceway Road Atlanta", "Braselton, USA", "10 Hours"],
  ["Porsche Cup", "라운드 7", "Petit Le Mans Support", "2026-09-30", "2026-10-02", "Road Atlanta", "Braselton, USA", "Carrera Cup NA"],
  ["DTM", "라운드 8", "Hockenheimring Baden-Wurttemberg", "2026-10-09", "2026-10-11", "Hockenheimring", "Hockenheim, Germany", ""],
  ["F1", "라운드 16", "Singapore Grand Prix", "2026-10-09", "2026-10-11", "Marina Bay Street Circuit", "Singapore", ""],
  ["WEC", "라운드 7", "Qatar 1812 Km", "2026-10-22", "2026-10-24", "Lusail International Circuit", "Lusail, Qatar", "1812 km"],
  ["F1", "라운드 17", "United States Grand Prix", "2026-10-23", "2026-10-25", "Circuit of the Americas", "Austin, USA", ""],
  ["Porsche Cup", "라운드 8", "United States Grand Prix Support", "2026-10-23", "2026-10-25", "Circuit of the Americas", "Austin, USA", "Carrera Cup NA"],
  ["F1", "라운드 18", "Mexico City Grand Prix", "2026-10-30", "2026-11-01", "Autodromo Hermanos Rodriguez", "Mexico City, Mexico", ""],
  ["WEC", "라운드 8", "Bapco Energies 8 Hours of Bahrain", "2026-11-05", "2026-11-07", "Bahrain International Circuit", "Sakhir, Bahrain", "8 Hours"],
  ["F1", "라운드 19", "Sao Paulo Grand Prix", "2026-11-06", "2026-11-08", "Interlagos", "Sao Paulo, Brazil", ""],
  ["F1", "라운드 20", "Las Vegas Grand Prix", "2026-11-19", "2026-11-21", "Las Vegas Strip Circuit", "Las Vegas, USA", ""],
  ["F1", "라운드 21", "Qatar Grand Prix", "2026-11-27", "2026-11-29", "Lusail International Circuit", "Lusail, Qatar", ""],
  ["F1", "라운드 22", "Abu Dhabi Grand Prix", "2026-12-04", "2026-12-06", "Yas Marina Circuit", "Abu Dhabi, UAE", ""],
];

let events = baseEvents.map(([series, type, title, start, end, circuit, location, note]) => ({
  series, type, title, start, end, circuit, location, note, sessions: makeSessions(series, start, end, note),
})).sort((a, b) => asDate(a.start) - asDate(b.start));

const standings = {
  F1: [
    ["Kimi Antonelli", "Mercedes", 72],
    ["George Russell", "Mercedes", 63],
    ["Charles Leclerc", "Ferrari", 49],
    ["Lewis Hamilton", "Ferrari", 41],
    ["Lando Norris", "McLaren", 25],
  ],
  DTM: [
    ["M. Engel", "Mercedes-AMG Team Ravenol", 44],
    ["L. Auer", "Mercedes-AMG Team Landgraf", 37],
    ["M. Wittmann", "Schubert Motorsport", 31],
    ["T. Preining", "Manthey Racing", 29],
    ["N. Thiim", "Comtoyou Racing", 17],
  ],
  WEC: [
    ["S. Buemi", "Toyota Gazoo Racing", 25],
    ["B. Hartley", "Toyota Gazoo Racing", 25],
    ["R. Hirakawa", "Toyota Gazoo Racing", 25],
    ["J. Calado", "Ferrari AF Corse", 19],
    ["A. Giovinazzi", "Ferrari AF Corse", 19],
  ],
  IMSA: [
    ["Julien Andlauer", "Porsche Penske", 755],
    ["Laurin Heinrich", "Porsche Penske", 755],
    ["Felipe Nasr", "Porsche Penske", 755],
    ["Jack Aitken", "Cadillac Whelen", 675],
    ["Earl Bamber", "Cadillac Whelen", 675],
  ],
  "Porsche Cup": [
    ["Tyler Maxson", "PCCNA", 56],
    ["Aaron Jeansonne", "PCCNA", 37],
    ["Callum Hedge", "PCCNA", 31],
    ["Tom Sargent", "PCCNA", 25],
    ["Porsche Supercup", "시즌 전", 0],
  ],
};

const pointBreakdowns = {
  F1: {
    rounds: ["Australia", "China", "Japan", "Miami"],
    rows: [
      { driver: "Kimi Antonelli", team: "Mercedes", points: [25, 22, 25, 0] },
      { driver: "George Russell", team: "Mercedes", points: [18, 18, 18, 9] },
      { driver: "Charles Leclerc", team: "Ferrari", points: [15, 10, 15, 9] },
      { driver: "Lewis Hamilton", team: "Ferrari", points: [8, 15, 10, 8] },
      { driver: "Lando Norris", team: "McLaren", points: [10, 8, 7, 0] },
    ],
    note: "Miami는 진행 전/진행 중이라 0으로 보류",
  },
  DTM: {
    rounds: ["Red Bull Ring R1", "Red Bull Ring R2"],
    rows: [
      { driver: "M. Engel", team: "Mercedes-AMG Team Ravenol", points: [19, 25] },
      { driver: "L. Auer", team: "Mercedes-AMG Team Landgraf", points: [20, 17] },
      { driver: "M. Wittmann", team: "Schubert Motorsport", points: [10, 21] },
      { driver: "T. Preining", team: "Manthey Racing", points: [26, 3] },
      { driver: "N. Thiim", team: "Comtoyou Racing", points: [5, 12] },
    ],
    note: "DTM은 2레이스 주말 기준",
  },
  WEC: {
    rounds: ["Imola"],
    rows: [
      { driver: "S. Buemi", team: "Toyota Gazoo Racing", points: [25] },
      { driver: "B. Hartley", team: "Toyota Gazoo Racing", points: [25] },
      { driver: "R. Hirakawa", team: "Toyota Gazoo Racing", points: [25] },
      { driver: "J. Calado", team: "Ferrari AF Corse", points: [19] },
      { driver: "A. Giovinazzi", team: "Ferrari AF Corse", points: [19] },
    ],
    note: "WEC는 드라이버 조별 동점 표기가 많음",
  },
  IMSA: {
    rounds: ["Daytona", "Sebring", "Long Beach", "Laguna Seca"],
    rows: [
      { driver: "Julien Andlauer", team: "Porsche Penske", points: [380, 375, 0, 0] },
      { driver: "Laurin Heinrich", team: "Porsche Penske", points: [380, 375, 0, 0] },
      { driver: "Felipe Nasr", team: "Porsche Penske", points: [380, 375, 0, 0] },
      { driver: "Jack Aitken", team: "Cadillac Whelen", points: [340, 335, 0, 0] },
      { driver: "Earl Bamber", team: "Cadillac Whelen", points: [340, 335, 0, 0] },
    ],
    note: "Long Beach/Laguna Seca 이후 공식표 갱신 필요",
  },
  "Porsche Cup": {
    rounds: ["Sebring R1", "Sebring R2", "Long Beach R1", "Long Beach R2", "Miami R1", "Miami R2"],
    rows: [
      { driver: "Tyler Maxson", team: "PCCNA", points: [28, 28, 0, 0, 0, 0] },
      { driver: "Aaron Jeansonne", team: "PCCNA", points: [17, 20, 0, 0, 0, 0] },
      { driver: "Callum Hedge", team: "PCCNA", points: [14, 17, 0, 0, 0, 0] },
      { driver: "Tom Sargent", team: "PCCNA", points: [0, 0, 25, 25, 0, 0] },
      { driver: "Porsche Supercup", team: "Season starts Monaco", points: [0, 0, 0, 0, 0, 0] },
    ],
    note: "Carrera Cup NA와 Supercup을 같은 Porsche Cup 뷰에 묶음",
  },
};

let activeDetailSeries = "F1";
let lastPointerAt = 0;

const newsItems = [
  ["Porsche Cup", "Preview: Carrera Cup heads to South Beach for Miami F1 Grand Prix", "2026-04-27", seriesSources["Porsche Cup"].news],
  ["DTM", "Red Bull Ring 개막전 이후 DTM 포인트 테이블 업데이트", "2026-04-27", seriesSources.DTM.standings],
  ["F1", "Miami Grand Prix 주말 진행 중", "2026-05-01", seriesSources.F1.news],
  ["WEC", "Spa 6 Hours가 다음 WEC 라운드", "2026-05-01", seriesSources.WEC.news],
  ["IMSA", "Laguna Seca 주말 일정 진행", "2026-05-01", seriesSources.IMSA.news],
];

function asDate(value) {
  return new Date(`${value}T00:00:00+09:00`);
}

function makeSessions(series, start, end, note) {
  const startDate = asDate(start);
  const endDate = asDate(end);
  const plus = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };
  const fmt = (date, time) => `${formatter.format(date)} ${time}`;
  if (series === "F1") {
    return [
      ["FP1", fmt(startDate, "20:30")],
      ["FP2", fmt(startDate, "24:00")],
      ["FP3", fmt(plus(startDate, 1), "19:30")],
      ["Qualifying", fmt(plus(startDate, 1), "23:00")],
      ["Race", fmt(endDate, "22:00")],
    ];
  }
  if (series === "DTM") {
    return [
      ["Practice 1", fmt(startDate, "17:05")],
      ["Practice 2", fmt(startDate, "21:55")],
      ["Qualifying 1", fmt(plus(startDate, 1), "16:40")],
      ["Race 1", fmt(plus(startDate, 1), "20:30")],
      ["Qualifying 2", fmt(endDate, "16:30")],
      ["Race 2", fmt(endDate, "20:30")],
    ];
  }
  if (series === "Porsche Cup") {
    return [
      ["Practice", fmt(startDate, "TBA")],
      ["Qualifying", fmt(plus(startDate, 1), "TBA")],
      ["Race 1", fmt(plus(startDate, 1), "TBA")],
      ["Race 2", fmt(endDate, "TBA")],
    ];
  }
  return [
    ["Practice 1", fmt(startDate, "TBA")],
    ["Practice 2", fmt(startDate, "TBA")],
    ["Qualifying", fmt(plus(startDate, 1), "TBA")],
    [note && note.includes("24") ? "Endurance Race" : "Race", fmt(endDate, "TBA")],
  ];
}

function dateRange(event) {
  const start = asDate(event.start);
  const end = asDate(event.end);
  if (event.start === event.end) return fullFormatter.format(start);
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function eventStatus(event) {
  const now = new Date();
  if (asDate(event.end) < now) return "past";
  if (asDate(event.start) <= now && now <= asDate(event.end)) return "live";
  return "future";
}

function searchable(event) {
  return `${event.series} ${event.type} ${event.title} ${event.circuit} ${event.location} ${event.note || ""}`.toLowerCase();
}

function filteredEvents() {
  return events.filter((event) => {
    const matchesSeries = activeSeries === "all" || event.series === activeSeries;
    const matchesQuery = searchable(event).includes(query.trim().toLowerCase());
    return matchesSeries && matchesQuery;
  });
}

function countdownTo(date) {
  const diff = asDate(date) - new Date();
  if (diff <= 0) return "진행 중";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return `${days}일 ${hours}시간`;
}

function renderOverview() {
  const now = new Date();
  const upcoming = events.filter((event) => asDate(event.end) >= now);
  const next = upcoming[0];
  document.querySelector("#totalEvents").textContent = events.length;
  document.querySelector("#upcomingEvents").textContent = upcoming.length;
  document.querySelector("#nextCountdown").textContent = next ? countdownTo(next.start) : "-";
  document.querySelector("#nextEventName").textContent = next ? `${next.series} ${next.title}` : "다음 일정";
}

function renderCalendar() {
  const items = filteredEvents();
  document.querySelector("#resultCount").textContent = `${items.length}개 표시`;
  document.querySelector("#calendarList").innerHTML = items.map((event, index) => {
    const start = asDate(event.start);
    const status = eventStatus(event);
    const note = event.note ? `<span>${event.note}</span>` : "";
    const sessions = event.sessions.map(([name, time]) => `
      <div class="session">
        <strong>${name}</strong>
        <span class="session-time">${time}</span>
      </div>
    `).join("");
    return `
      <article class="event-card ${status}" data-event-index="${index}" style="--series-color:${seriesColors[event.series]}">
        <div class="datebox">
          <div>
            <strong>${String(start.getDate()).padStart(2, "0")}</strong>
            <span>${start.toLocaleString("en-US", { month: "short" })}</span>
          </div>
        </div>
        <div>
          <div class="event-title">
            <span class="badge">${event.series}</span>
            <span class="type">${event.type}</span>
            ${status === "live" ? `<span class="type">진행 중</span>` : ""}
            <h3>${event.title}</h3>
          </div>
          <p class="event-meta">
            <span>${dateRange(event)}</span>
            <span>${event.location}</span>
            <span>${countdownTo(event.start)}</span>
            ${note}
          </p>
        </div>
        <div class="event-track">${event.circuit}<br><a href="${seriesSources[event.series].calendar}" target="_blank" rel="noreferrer">공식 일정</a></div>
        <div class="sessions">${sessions}</div>
      </article>
    `;
  }).join("");
}

function renderNext() {
  const now = new Date();
  const nextEvents = events.filter((event) => asDate(event.end) >= now).slice(0, 7);
  document.querySelector("#nextList").innerHTML = nextEvents.map((event) => `
    <div class="compact-item" style="--series-color:${seriesColors[event.series]}">
      <strong>${event.series} · ${event.title}</strong>
      <div class="compact-meta">${dateRange(event)} · ${countdownTo(event.start)} 남음 · ${event.circuit}</div>
    </div>
  `).join("");
}

function overlaps(a, b) {
  return asDate(a.start) <= asDate(b.end) && asDate(b.start) <= asDate(a.end);
}

function renderClashes() {
  const pairs = [];
  for (let i = 0; i < events.length; i += 1) {
    for (let j = i + 1; j < events.length; j += 1) {
      if (events[i].series !== events[j].series && overlaps(events[i], events[j]) && asDate(events[j].end) >= new Date()) {
        pairs.push([events[i], events[j]]);
      }
    }
  }
  document.querySelector("#clashList").innerHTML = pairs.slice(0, 9).map(([a, b]) => `
    <div class="compact-item" style="--series-color:${seriesColors[a.series]}">
      <strong>${a.series} ${a.title} / ${b.series} ${b.title}</strong>
      <div class="compact-meta">${dateRange(a)} · ${a.location} / ${b.location}</div>
    </div>
  `).join("");
}

function renderStandings() {
  document.querySelector("#standingsGrid").innerHTML = Object.entries(standings).map(([series, rows]) => `
    <article class="standing-card" style="--series-color:${seriesColors[series]}">
      <h3><span>${series}</span><span class="badge">${rows[0][2]} pts</span></h3>
      <ol>
        ${rows.map(([name, team, points], index) => `
          <li>
            <span>${index + 1}</span>
            <span><strong>${name}</strong><br><small>${team}</small></span>
            <span class="pts">${points}</span>
          </li>
        `).join("")}
      </ol>
    </article>
  `).join("");
}

function renderPointBreakdown() {
  const data = pointBreakdowns[activeDetailSeries];
  const headers = data.rounds.map((round) => `<th>${round}</th>`).join("");
  const rows = data.rows.map((row) => {
    const total = row.points.reduce((sum, value) => sum + value, 0);
    return `
      <tr>
        <td><strong>${row.driver}</strong></td>
        <td>${row.team}</td>
        ${row.points.map((value) => `<td>${value || "-"}</td>`).join("")}
        <td class="points-total">${total}</td>
      </tr>
    `;
  }).join("");
  document.querySelector("#pointsBreakdown").innerHTML = `
    <table class="points-table">
      <thead>
        <tr>
          <th>Driver</th>
          <th>Team</th>
          ${headers}
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="compact-meta" style="padding:0 14px 14px">${data.note}</p>
  `;
}

function renderNewsAndLinks() {
  document.querySelector("#newsList").innerHTML = newsItems.map(([series, title, date, url]) => `
    <a class="news-item" href="${url}" target="_blank" rel="noreferrer" style="--series-color:${seriesColors[series]}">
      <strong>${series} · ${title}</strong>
      <span class="news-date">${date}</span>
    </a>
  `).join("");
  document.querySelector("#linksList").innerHTML = Object.entries(seriesSources).map(([series, source]) => `
    <a href="${source.calendar}" target="_blank" rel="noreferrer">${series}<br><small>${source.site}</small></a>
  `).join("");
}

function onPress(element, handler) {
  element.addEventListener("pointerup", (event) => {
    lastPointerAt = Date.now();
    handler(event);
  });
  element.addEventListener("click", (event) => {
    if (Date.now() - lastPointerAt < 450) return;
    handler(event);
  });
}

function bindControls() {
  document.querySelectorAll(".filter-btn").forEach((button) => {
    onPress(button, () => {
      activeSeries = button.dataset.series;
      document.querySelectorAll(".filter-btn").forEach((item) => item.classList.toggle("active", item === button));
      renderCalendar();
    });
  });

  document.querySelector("#searchInput").addEventListener("input", (event) => {
    query = event.target.value;
    renderCalendar();
  });

  onPress(document.querySelector("#calendarList"), (event) => {
    if (event.target.closest("a")) return;
    const card = event.target.closest(".event-card");
    if (!card) return;
    card.classList.toggle("open");
  });

  const panel = document.querySelector("#settingsPanel");
  onPress(document.querySelector("#settingsOpen"), () => {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
  });
  onPress(document.querySelector("#settingsClose"), () => {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  });
  document.querySelector("#darkToggle").addEventListener("change", (event) => {
    document.body.classList.toggle("light", !event.target.checked);
  });
  document.querySelector("#fontSelect").addEventListener("change", (event) => {
    document.body.classList.remove("font-mono", "font-serif", "font-wide");
    if (event.target.value !== "system") document.body.classList.add(`font-${event.target.value}`);
  });
  document.querySelector("#fontSize").addEventListener("input", (event) => {
    document.documentElement.style.setProperty("--font-scale", `${event.target.value}px`);
  });
  document.querySelector("#accentSelect").addEventListener("change", (event) => {
    const accents = { soft: "#ff5b56", medium: "#f2c94c", hard: "#dfe7f5" };
    document.documentElement.style.setProperty("--accent", accents[event.target.value]);
  });

  document.querySelectorAll(".detail-tab").forEach((button) => {
    onPress(button, () => {
      activeDetailSeries = button.dataset.detailSeries;
      document.querySelectorAll(".detail-tab").forEach((item) => item.classList.toggle("active", item === button));
      renderPointBreakdown();
    });
  });
}

renderOverview();
renderNext();
renderClashes();
renderStandings();
renderPointBreakdown();
renderNewsAndLinks();
renderCalendar();
bindControls();


// ============================================================
// LIVE DATA MODULE — 완전 자동화
// ============================================================

const OPENF1   = "https://api.openf1.org/v1";
const JOLPICA  = "https://api.jolpi.ca/ergast/f1";
const RSS2JSON = "https://api.rss2json.com/v1/api.json";
let liveRefreshTimer = null;

// ── 유틸 ────────────────────────────────────────────────────
function fmtSession(session) {
  if (!session?.date) return "TBA";
  if (!session?.time) {
    return new Date(session.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  }
  const dt = new Date(`${session.date}T${session.time}`);
  return dt.toLocaleString("ko-KR", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Seoul",
  });
}

// ── F1 일정 API ─────────────────────────────────────────────
async function fetchF1ScheduleFromAPI() {
  const res = await fetch(`${JOLPICA}/2026.json?limit=30`);
  const json = await res.json();
  const races = json.MRData?.RaceTable?.Races || [];
  if (!races.length) return null;

  return races.map(race => {
    const hasSprint = !!race.Sprint;
    const sess = [];
    if (race.FirstPractice?.date)  sess.push(["FP1", fmtSession(race.FirstPractice)]);
    if (hasSprint) {
      if (race.SecondPractice?.date) sess.push(["Sprint Qualifying", fmtSession(race.SecondPractice)]);
      sess.push(["Sprint Race", fmtSession(race.Sprint)]);
    } else {
      if (race.SecondPractice?.date) sess.push(["FP2", fmtSession(race.SecondPractice)]);
      if (race.ThirdPractice?.date)  sess.push(["FP3", fmtSession(race.ThirdPractice)]);
    }
    if (race.Qualifying?.date) sess.push(["Qualifying", fmtSession(race.Qualifying)]);
    sess.push(["Race", fmtSession({ date: race.date, time: race.time })]);

    return {
      series: "F1",
      type: `라운드 ${race.round}`,
      title: race.raceName,
      start: race.FirstPractice?.date || race.date,
      end: race.date,
      circuit: race.Circuit.circuitName,
      location: `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
      note: hasSprint ? "Sprint Weekend" : "",
      sessions: sess,
    };
  });
}

// ── F1 드라이버 순위 ─────────────────────────────────────────
async function fetchF1LiveStandings() {
  const res = await fetch(`${JOLPICA}/current/driverStandings.json`);
  const json = await res.json();
  const list = json.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
  if (!list?.length) return null;
  return list.slice(0, 5).map(s => [
    `${s.Driver.givenName} ${s.Driver.familyName}`,
    s.Constructors?.[0]?.name || "–",
    parseFloat(s.points),
  ]);
}

// ── F1 포인트 브레이크다운 ───────────────────────────────────
async function fetchF1ResultsBreakdown() {
  const res = await fetch(`${JOLPICA}/2026/results.json?limit=300`);
  const json = await res.json();
  const races = json.MRData?.RaceTable?.Races || [];
  if (!races.length) return null;

  const rounds = [];
  const driverData = {};

  races.forEach(race => {
    const label = race.raceName
      .replace(" Grand Prix", "")
      .replace("Grand Prix", "")
      .trim();
    rounds.push(label);
    (race.Results || []).forEach(r => {
      const name = `${r.Driver.givenName} ${r.Driver.familyName}`;
      if (!driverData[name]) driverData[name] = { team: r.Constructor.name, pts: {} };
      driverData[name].pts[label] = parseInt(r.points) || 0;
    });
  });

  const rows = Object.entries(driverData)
    .map(([driver, d]) => ({
      driver,
      team: d.team,
      points: rounds.map(r => d.pts[r] || 0),
    }))
    .sort((a, b) =>
      b.points.reduce((s, p) => s + p, 0) - a.points.reduce((s, p) => s + p, 0)
    )
    .slice(0, 8);

  return { rounds, rows, note: "Jolpica API 실시간 레이스 결과 기준" };
}

// ── 뉴스 RSS (전 시리즈) ─────────────────────────────────────
const newsFeeds = {
  F1:           "https://www.motorsport.com/rss/f1/news/",
  DTM:          "https://www.motorsport.com/rss/dtm/news/",
  WEC:          "https://www.motorsport.com/rss/wec/news/",
  IMSA:         "https://www.motorsport.com/rss/imsa/news/",
  "Porsche Cup":"https://www.motorsport.com/rss/porsche-supercup/news/",
};

async function fetchAllNewsFromRSS() {
  const results = [];
  await Promise.allSettled(
    Object.entries(newsFeeds).map(async ([series, rssUrl]) => {
      const url = `${RSS2JSON}?rss_url=${encodeURIComponent(rssUrl)}&count=4`;
      const res = await fetch(url);
      const json = await res.json();
      (json.items || []).forEach(item => {
        results.push([series, item.title, item.pubDate?.slice(0, 10) || "", item.link]);
      });
    })
  );
  return results.sort((a, b) => b[2].localeCompare(a[2]));
}

// ── F1 라이브 세션 (OpenF1) ──────────────────────────────────
async function fetchLatestF1Session() {
  const res = await fetch(`${OPENF1}/sessions?session_key=latest`);
  const json = await res.json();
  return Array.isArray(json) ? json[0] : null;
}
async function fetchLivePositions(key) {
  const res = await fetch(`${OPENF1}/position?session_key=${key}`);
  return await res.json();
}
async function fetchSessionDrivers(key) {
  const res = await fetch(`${OPENF1}/drivers?session_key=${key}`);
  return await res.json();
}

function isSessionLive(session) {
  if (!session?.date_start) return false;
  const now = new Date();
  const start = new Date(session.date_start);
  const end = session.date_end
    ? new Date(session.date_end)
    : new Date(start.getTime() + 4 * 3600000);
  return start <= now && now <= end;
}

function setLiveIndicator(message, state) {
  const el = document.querySelector("#liveIndicator");
  if (!el) return;
  el.textContent = message;
  el.dataset.state = state;
}

function renderLivePanel(session, positions, drivers) {
  const panel = document.querySelector("#livePanel");
  if (!panel) return;
  if (!session) {
    panel.innerHTML = `<p class="compact-meta" style="padding:18px 0">F1 세션 데이터 없음</p>`;
    return;
  }

  const driverMap = {};
  (drivers || []).forEach(d => { driverMap[d.driver_number] = d; });

  let posHtml = "";
  if (positions?.length) {
    const latestPos = {};
    positions.forEach(p => {
      if (!latestPos[p.driver_number] || p.date > latestPos[p.driver_number].date)
        latestPos[p.driver_number] = p;
    });
    const sorted = Object.values(latestPos)
      .sort((a, b) => a.position - b.position)
      .slice(0, 10);
    posHtml = `<ol class="live-pos-list">${sorted.map(p => {
      const d = driverMap[p.driver_number];
      const color = d?.team_colour ? `#${d.team_colour}` : "var(--accent)";
      return `<li>
        <span class="live-pos-num">${p.position}</span>
        <span class="live-pos-abbr" style="color:${color}">${d?.name_acronym || "#" + p.driver_number}</span>
        <span class="live-pos-name">${d?.full_name || ""}</span>
      </li>`;
    }).join("")}</ol>`;
  } else {
    posHtml = `<p class="compact-meta" style="margin-top:14px">포지션 데이터 없음</p>`;
  }

  const sessionDate = new Date(session.date_start).toLocaleString("ko-KR", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
  panel.innerHTML = `
    <div class="live-session-header">
      <div>
        <strong>${session.country_name || ""} GP</strong>
        <span class="live-session-name">${session.session_name || ""}</span>
      </div>
      <div class="compact-meta">${sessionDate}<br>${session.circuit_short_name || ""}</div>
    </div>
    ${posHtml}
    <p class="compact-meta live-updated">업데이트: ${new Date().toLocaleTimeString("ko-KR")}</p>`;
}

async function refreshLiveSession() {
  try {
    const session = await fetchLatestF1Session();
    if (isSessionLive(session)) {
      setLiveIndicator("🔴 LIVE", "live");
      const [positions, drivers] = await Promise.all([
        fetchLivePositions(session.session_key),
        fetchSessionDrivers(session.session_key),
      ]);
      renderLivePanel(session, positions, drivers);
      clearTimeout(liveRefreshTimer);
      liveRefreshTimer = setTimeout(refreshLiveSession, 30000);
    } else {
      setLiveIndicator("● 대기중", "standby");
      renderLivePanel(session, null, null);
    }
  } catch (e) {
    setLiveIndicator("○ 오프라인", "offline");
    const panel = document.querySelector("#livePanel");
    if (panel) panel.innerHTML = `<p class="compact-meta" style="padding:14px 0">연결 실패</p>`;
  }
}

// ── 전체 초기화 ──────────────────────────────────────────────
async function initLiveData() {
  await Promise.allSettled([

    // 1) F1 일정 (스프린트 포함)
    (async () => {
      const f1 = await fetchF1ScheduleFromAPI();
      if (f1?.length) {
        const nonF1 = events.filter(e => e.series !== "F1");
        events = [...nonF1, ...f1].sort((a, b) => asDate(a.start) - asDate(b.start));
        renderOverview(); renderNext(); renderClashes(); renderCalendar();
      }
    })(),

    // 2) F1 드라이버 순위
    (async () => {
      const s = await fetchF1LiveStandings();
      if (s) { standings.F1 = s; renderStandings(); }
    })(),

    // 3) F1 포인트 브레이크다운
    (async () => {
      const b = await fetchF1ResultsBreakdown();
      if (b) {
        pointBreakdowns.F1 = b;
        if (activeDetailSeries === "F1") renderPointBreakdown();
      }
    })(),

    // 4) 뉴스 RSS (전 시리즈)
    (async () => {
      const news = await fetchAllNewsFromRSS();
      if (news?.length) {
        newsItems.length = 0;
        news.forEach(item => newsItems.push(item));
        renderNewsAndLinks();
      }
    })(),

    // 5) F1 라이브 세션
    refreshLiveSession(),
  ]);

  // 주기적 갱신
  setInterval(async () => {
    const s = await fetchF1LiveStandings().catch(() => null);
    if (s) { standings.F1 = s; renderStandings(); }
  }, 5 * 60 * 1000);

  setInterval(async () => {
    const news = await fetchAllNewsFromRSS().catch(() => null);
    if (news?.length) {
      newsItems.length = 0;
      news.forEach(item => newsItems.push(item));
      renderNewsAndLinks();
    }
  }, 15 * 60 * 1000);
}

initLiveData();

// 1분마다 카운트다운·상태 자동 갱신
setInterval(() => {
  renderOverview();
  renderNext();
  renderClashes();
  renderCalendar();
}, 60000);
