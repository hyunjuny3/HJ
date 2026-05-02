/**
 * @typedef {{ date?: string; time?: string }} ErgastSession
 * @typedef {{
 *   round: string;
 *   raceName: string;
 *   date: string;
 *   time?: string;
 *   Circuit?: { circuitName?: string; Location?: { locality?: string; country?: string } };
 *   FirstPractice?: ErgastSession;
 *   SecondPractice?: ErgastSession;
 *   ThirdPractice?: ErgastSession;
 *   Qualifying?: ErgastSession;
 *   Sprint?: ErgastSession;
 *   SprintQualifying?: ErgastSession;
 * }} ErgastRace
 * @typedef {{
 *   meeting_name: string;
 *   is_cancelled?: boolean;
 *   circuit_image?: string;
 *   circuit_short_name?: string;
 *   location?: string;
 * }} OpenF1Meeting
 * @typedef {{
 *   session_name: string;
 *   date_start: string;
 *   date_end: string;
 *   location: string;
 *   circuit_short_name: string;
 *   is_cancelled?: boolean;
 * }} OpenF1Session
 */

const JOLPI_BASE = "https://api.jolpi.ca/ergast/f1";
const OPENF1_BASE = "https://api.openf1.org/v1";

/** @type {number | undefined} */
let countdownTimerId;

/** @type {number} */
let standingsPollId = 0;

/** @type {number} */
let standingsMaxRound = 0;

const SESSION_KEYS = [
  ["FP1", "FirstPractice"],
  ["FP2", "SecondPractice"],
  ["FP3", "ThirdPractice"],
  ["스프린트 예선", "SprintQualifying"],
  ["스프린트", "Sprint"],
  ["예선", "Qualifying"],
];

/** @param {string} path */
async function fetchJson(path) {
  const res = await fetch(path, { mode: "cors" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

/** @param {string} date @param {string} [time] */
function toIso(date, time) {
  if (!date) return null;
  if (time) return `${date}T${time}`;
  return `${date}T12:00:00Z`;
}

/** @param {string} iso */
function formatLocal(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ko-KR", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(d);
}

/** @param {ErgastRace} race */
function collectSessions(race) {
  /** @type {{ label: string; iso: string }[]} */
  const rows = [];
  for (const [label, key] of SESSION_KEYS) {
    const s = race[key];
    if (s?.date) {
      const iso = toIso(s.date, s.time);
      if (iso) rows.push({ label, iso });
    }
  }
  const mainIso = toIso(race.date, race.time);
  if (mainIso) rows.push({ label: "결승", iso: mainIso });
  rows.sort((a, b) => new Date(a.iso) - new Date(b.iso));
  return rows;
}

/** Ergast 이름과 OpenF1 `meeting_name` 이 다른 경우 */
const OPENF1_MEETING_ALIASES = {
  "Brazilian Grand Prix": "São Paulo Grand Prix",
};

/** @param {string} raceName @param {OpenF1Meeting[]} meetings */
function findOpenF1Meeting(raceName, meetings) {
  const direct = meetings.find((m) => m.meeting_name === raceName);
  if (direct) return direct;
  const alt = OPENF1_MEETING_ALIASES[raceName];
  if (alt) return meetings.find((m) => m.meeting_name === alt) ?? null;
  return null;
}

/** @returns {number[]} */
function seasonOptions() {
  const y = new Date().getFullYear();
  return [y - 1, y, y + 1];
}

/** @param {number} target @param {Date} now */
function formatCountdown(target, now) {
  let ms = target.getTime() - now.getTime();
  if (ms <= 0) return "지금 또는 이미 시작됨";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts = [];
  if (d > 0) parts.push(`${d}일`);
  if (h > 0 || d > 0) parts.push(`${h}시간`);
  parts.push(`${m}분`);
  return parts.join(" ");
}

/** @param {OpenF1Session[]} sessions */
function describeLiveSessions(sessions) {
  const now = new Date();
  const live = sessions.find(
    (s) =>
      !s.is_cancelled &&
      new Date(s.date_start) <= now &&
      now <= new Date(s.date_end),
  );
  if (live) {
    return `진행 중 · ${live.session_name} · ${live.location} (${live.circuit_short_name})`;
  }
  const upcoming = sessions
    .filter((s) => !s.is_cancelled && new Date(s.date_start) > now)
    .sort((a, b) => new Date(a.date_start) - new Date(b.date_start))[0];
  if (upcoming) {
    return `다음 세션 · ${upcoming.session_name} · ${formatLocal(upcoming.date_start)}`;
  }
  const last = sessions
    .filter((s) => !s.is_cancelled)
    .sort((a, b) => new Date(b.date_end) - new Date(a.date_end))[0];
  if (last && now > new Date(last.date_end)) {
    return `최근 미팅 세션 종료 · ${last.location}`;
  }
  return null;
}

function stopStandingsPoll() {
  if (standingsPollId) {
    window.clearInterval(standingsPollId);
    standingsPollId = 0;
  }
}

/** @param {number} y */
function isCalendarYear(y) {
  return y === new Date().getFullYear();
}

/** @param {string} s */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** @param {string} name */
function shortRaceName(name) {
  return name.replace(/\s+Grand Prix$/i, "").trim() || name;
}

/** @param {unknown} data */
function firstRaceFromResults(data) {
  const races = data?.MRData?.RaceTable?.Races;
  return Array.isArray(races) ? races[0] : races || null;
}

/** @param {number} year @param {number} round */
async function loadRoundPoints(year, round) {
  const [raceRes, sprintRes] = await Promise.all([
    fetchJson(`${JOLPI_BASE}/${year}/${round}/results.json`).catch(() => null),
    fetchJson(`${JOLPI_BASE}/${year}/${round}/sprint.json`).catch(() => null),
  ]);
  const race = firstRaceFromResults(raceRes);
  const sprintRace = firstRaceFromResults(sprintRes);
  /** @type {{ driverId: string; round: number; kind: string; label: string; raceName: string; pts: number }[]} */
  const out = [];
  if (sprintRace?.SprintResults) {
    for (const res of sprintRace.SprintResults) {
      const id = res.Driver?.driverId;
      if (!id) continue;
      out.push({
        driverId: id,
        round,
        kind: "sprint",
        label: `R${round} 스프린트`,
        raceName: sprintRace.raceName || "",
        pts: Number(res.points ?? 0),
      });
    }
  }
  if (race?.Results) {
    for (const res of race.Results) {
      const id = res.Driver?.driverId;
      if (!id) continue;
      out.push({
        driverId: id,
        round,
        kind: "race",
        label: `R${round} 결승`,
        raceName: race.raceName || "",
        pts: Number(res.points ?? 0),
      });
    }
  }
  return out;
}

/** @param {number} year @param {number} maxRound */
async function fetchPointsBreakdown(year, maxRound) {
  const flat = [];
  const batch = 6;
  for (let start = 1; start <= maxRound; start += batch) {
    const end = Math.min(start + batch - 1, maxRound);
    const promises = [];
    for (let r = start; r <= end; r++) promises.push(loadRoundPoints(year, r));
    const parts = await Promise.all(promises);
    for (const p of parts) flat.push(...p);
  }
  const map = new Map();
  for (const e of flat) {
    if (!map.has(e.driverId)) map.set(e.driverId, []);
    map.get(e.driverId).push(e);
  }
  for (const [, arr] of map) {
    arr.sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      const asp = a.kind === "sprint" ? 0 : 1;
      const bsp = b.kind === "sprint" ? 0 : 1;
      return asp - bsp;
    });
  }
  return map;
}

/** @param {number} year */
async function fetchDriverStandingsList(year) {
  const data = await fetchJson(`${JOLPI_BASE}/${year}/driverStandings.json`).catch(() => null);
  const lists = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
  return Array.isArray(lists) ? lists : [];
}

async function fetchOpenF1DriverMap() {
  const rows = await fetchJson(`${OPENF1_BASE}/drivers?session_key=latest`).catch(() => []);
  /** @type {Map<string, { headshot_url?: string; team_colour?: string; team_name?: string }>} */
  const m = new Map();
  for (const row of rows) {
    const code = row.name_acronym?.toUpperCase?.();
    if (code && !m.has(code)) m.set(code, row);
  }
  return m;
}

/** @param {{ givenName?: string; familyName?: string }} d */
function driverInitials(d) {
  const a = (d.givenName || "").trim();
  const b = (d.familyName || "").trim();
  const i1 = a ? a[0] : "";
  const i2 = b ? b[0] : "";
  return (i1 + i2).toUpperCase() || "?";
}

/**
 * @param {object[]} standings
 * @param {Map<string, object[]>} breakdown
 * @param {Map<string, object>} o1
 */
function renderStandingsSection(standings, breakdown, o1) {
  standingsListEl.innerHTML = "";
  const frag = document.createDocumentFragment();

  for (const row of standings) {
    const d = row.Driver;
    if (!d) continue;
    const code = (d.code || "").toUpperCase();
    const o1d = code ? o1.get(code) : null;
    const headshot = o1d?.headshot_url || "";
    const teamHex = o1d?.team_colour ? `#${o1d.team_colour}` : "";
    const teamName = o1d?.team_name || row.Constructors?.[0]?.name || "";
    const pts = row.points ?? "0";
    const wins = row.wins ?? "0";
    const pos = row.position ?? "";
    const entries = breakdown.get(d.driverId) || [];
    const rowsHtml = entries.length
      ? `<table class="standings-break"><tbody>${entries
          .map(
            (e) => `
          <tr>
            <th>${escapeHtml(e.label)} · ${escapeHtml(shortRaceName(e.raceName))}</th>
            <td class="${e.pts > 0 ? "pt-positive" : "pt-zero"}">+${e.pts}</td>
          </tr>`,
          )
          .join("")}</tbody></table>`
      : '<p class="standings-status" style="margin:0.35rem 0 0">이 드라이버의 라운드별 기록을 찾지 못했습니다.</p>';

    const li = document.createElement("li");
    li.className = "standings-driver";
    li.innerHTML = `
      <div class="standings-head-row">
        <span class="standings-pos">${escapeHtml(String(pos))}</span>
        <div class="standings-photo-wrap">
          ${
            headshot
              ? `<img class="standings-photo" src="${escapeHtml(headshot)}" alt="" width="48" height="48" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.classList.add('is-visible')" />`
              : ""
          }
          <span class="standings-initials ${headshot ? "" : "is-visible"}">${escapeHtml(driverInitials(d))}</span>
        </div>
        <div class="standings-id">
          <div class="standings-name">${escapeHtml(`${d.givenName ?? ""} ${d.familyName ?? ""}`.trim())}</div>
          <div class="standings-team">
            <span class="standings-team-bar" style="background:${teamHex || "#555"}"></span>
            <span>${escapeHtml(teamName)}</span>
          </div>
        </div>
        <div class="standings-pts">
          <div class="standings-pts-val">${escapeHtml(String(pts))}</div>
          <div class="standings-pts-sub">${escapeHtml(String(wins))} 승</div>
        </div>
      </div>
      <details class="standings-body">
        <summary>라운드별 포인트 (${entries.length}건)</summary>
        ${rowsHtml}
      </details>
    `;
    frag.appendChild(li);
  }

  standingsListEl.appendChild(frag);
}

/**
 * @param {number} year
 * @param {{ quiet?: boolean }} [opts]
 */
async function refreshStandings(year, opts = {}) {
  const quiet = opts.quiet ?? false;
  const standingsEl = $("standings");
  const liveBadge = $("standings-live-badge");
  standingsEl.hidden = false;
  liveBadge.hidden = !isCalendarYear(year);

  if (!quiet) {
    standingsStatusEl.textContent = "포인트·라운드별 기록 불러오는 중…";
    standingsListEl.innerHTML = "";
  }

  try {
    const maxR = Math.max(standingsMaxRound, 1);
    const [o1, standingRows, breakdown] = await Promise.all([
      fetchOpenF1DriverMap(),
      fetchDriverStandingsList(year),
      fetchPointsBreakdown(year, maxR),
    ]);

    if (!standingRows.length) {
      standingsStatusEl.textContent =
        year > new Date().getFullYear()
          ? "아직 챔피언십이 시작되지 않았습니다."
          : "스탠딩 데이터가 없습니다.";
      standingsListEl.innerHTML = "";
      return;
    }

    standingsStatusEl.textContent = isCalendarYear(year)
      ? "합산: 각 라운드 결승·스프린트(Jolpi). 사진·팀 바는 OpenF1 최신 세션 기준. 약 90초마다 자동 갱신."
      : "과거 시즌 확정 기록입니다. 라운드별 행은 해당 연도 레이스·스프린트 결과 합산입니다.";

    renderStandingsSection(standingRows, breakdown, o1);
  } catch (e) {
    console.error(e);
    if (!quiet) standingsStatusEl.textContent = "챔피언십 정보를 불러오지 못했습니다.";
  }
}

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el;
}

const seasonEl = $("season");
const statusEl = $("status");
const raceListEl = $("race-list");
const nextRaceEl = $("next-race");
const liveStripEl = $("live-strip");
const liveTextEl = $("live-text");
const standingsStatusEl = $("standings-status");
const standingsListEl = $("standings-list");

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle("error", isError);
}

function populateSeasons() {
  seasonEl.innerHTML = "";
  for (const y of seasonOptions()) {
    const opt = document.createElement("option");
    opt.value = String(y);
    opt.textContent = `${y}`;
    seasonEl.appendChild(opt);
  }
  const current = new Date().getFullYear();
  seasonEl.value = String(current);
}

/** @param {ErgastRace[]} races @param {OpenF1Meeting[]} meetings */
function renderNextRace(races, meetings) {
  const now = new Date();
  let next = null;
  let nextIso = null;
  for (const r of races) {
    const sessions = collectSessions(r);
    const endIso = sessions.length ? sessions[sessions.length - 1].iso : toIso(r.date, r.time);
    if (!endIso) continue;
    if (new Date(endIso) > now) {
      next = r;
      const startIso = sessions[0]?.iso ?? toIso(r.date, r.time);
      nextIso = startIso;
      break;
    }
  }
  if (!next || !nextIso) {
    nextRaceEl.hidden = true;
    return;
  }
  const meet = findOpenF1Meeting(next.raceName, meetings);
  const cancelled = meet?.is_cancelled ?? false;
  nextRaceEl.hidden = false;
  const trackImg = meet?.circuit_image
    ? `<div class="next-track-visual"><img class="next-track-img" src="${escapeHtml(meet.circuit_image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" /></div>`
    : "";
  nextRaceEl.innerHTML = `
    <h2>다음 라운드</h2>
    ${trackImg}
    <p class="title">${next.raceName}${cancelled ? '<span class="cancel-badge">취소됨 (OpenF1)</span>' : ""}</p>
    <p class="meta">${next.Circuit?.Location?.locality ?? ""}, ${next.Circuit?.Location?.country ?? ""}${meet?.circuit_short_name ? ` · 트랙 ${escapeHtml(meet.circuit_short_name)}` : ""}</p>
    <p class="countdown" id="countdown"></p>
  `;
  const cd = $("countdown");
  if (countdownTimerId) window.clearInterval(countdownTimerId);
  const tick = () => {
    cd.textContent = formatCountdown(new Date(nextIso), new Date());
  };
  tick();
  countdownTimerId = window.setInterval(tick, 60_000);
}

/** @param {ErgastRace[]} races @param {OpenF1Meeting[]} meetings */
function renderRaceList(races, meetings) {
  raceListEl.innerHTML = "";
  const now = new Date();
  let nextRoundFound = false;

  for (const race of races) {
    const sessions = collectSessions(race);
    const endTime = sessions.length
      ? new Date(sessions[sessions.length - 1].iso)
      : race.date
        ? new Date(toIso(race.date, race.time))
        : null;
    const isPast = endTime && endTime < now;
    const isNext = !isPast && !nextRoundFound;
    if (isNext) nextRoundFound = true;

    const meet = findOpenF1Meeting(race.raceName, meetings);
    const cancelled = meet?.is_cancelled ?? false;

    const li = document.createElement("li");
    li.className = "race-item";
    if (isNext) li.classList.add("is-next");
    if (cancelled) li.classList.add("is-cancelled");
    if (isPast) li.classList.add("is-past");

    const details = document.createElement("details");
    const mainIso = toIso(race.date, race.time);
    const head = document.createElement("summary");
    head.className = "race-head";
    head.innerHTML = `
      <span class="round-badge">R${race.round}</span>
      <div class="race-title-wrap">
        <p class="race-title">${race.raceName}${isPast ? '<span class="past-badge">종료</span>' : ""}${cancelled ? '<span class="cancel-badge">취소</span>' : ""}</p>
        <p class="race-sub">${race.Circuit?.circuitName ?? ""}</p>
      </div>
      <div class="race-when">${mainIso ? formatLocal(mainIso) : ""}</div>
    `;

    const body = document.createElement("div");
    body.className = "race-body";
    const trackImg = meet?.circuit_image
      ? `<div class="track-visual"><img class="track-img" src="${escapeHtml(meet.circuit_image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" /></div>`
      : "";
    let tableHtml =
      trackImg + "<table class='session-table'><tbody>";
    for (const row of sessions) {
      const sessionPast = new Date(row.iso) < now;
      tableHtml += `<tr class="session-row${sessionPast ? " session-row--past" : ""}"><th>${row.label}</th><td><span class="session-time">${formatLocal(row.iso)}</span>${sessionPast ? '<span class="session-done" aria-hidden="true">✓</span>' : ""}</td></tr>`;
    }
    tableHtml += "</tbody></table>";
    body.innerHTML = tableHtml;

    details.appendChild(head);
    details.appendChild(body);
    li.appendChild(details);
    raceListEl.appendChild(li);
  }
}

let liveTimer = 0;

async function refreshLiveStrip() {
  try {
    const sessions = await fetchJson(`${OPENF1_BASE}/sessions?meeting_key=latest`);
    if (!Array.isArray(sessions) || sessions.length === 0) {
      liveStripEl.hidden = true;
      return;
    }
    const text = describeLiveSessions(sessions);
    if (text) {
      liveTextEl.textContent = text;
      liveStripEl.hidden = false;
    } else {
      liveStripEl.hidden = true;
    }
  } catch {
    liveStripEl.hidden = true;
  }
}

async function loadSeason(year) {
  setStatus("일정을 불러오는 중…");
  raceListEl.innerHTML = "";
  nextRaceEl.hidden = true;
  stopStandingsPoll();

  try {
    const [ergastData, meetings] = await Promise.all([
      fetchJson(`${JOLPI_BASE}/${year}.json`),
      fetchJson(`${OPENF1_BASE}/meetings?year=${year}`).catch(() => []),
    ]);

    const races =
      ergastData?.MRData?.RaceTable?.Races ??
      ergastData?.MRData?.RaceTable?.Race ??
      [];

    const raceArr = Array.isArray(races) ? races : races ? [races] : [];

    if (raceArr.length === 0) {
      setStatus(`${year} 시즌 데이터가 없습니다.`);
      return;
    }

    const meetingsArr = Array.isArray(meetings) ? meetings : [];

    setStatus(`${year} 시즌 · 드롭다운에서 세션별 현지 시간을 확인하세요.`);
    renderNextRace(raceArr, meetingsArr);
    renderRaceList(raceArr, meetingsArr);

    standingsMaxRound = raceArr.length;
    void refreshStandings(year);
    if (isCalendarYear(year)) {
      standingsPollId = window.setInterval(() => {
        void refreshStandings(year, { quiet: true });
      }, 90_000);
    }
  } catch (e) {
    console.error(e);
    setStatus(
      e instanceof Error ? e.message : "불러오기에 실패했습니다. 로컬 서버로 열었는지 확인하세요.",
      true,
    );
  }
}

function main() {
  populateSeasons();

  seasonEl.addEventListener("change", () => {
    loadSeason(Number(seasonEl.value));
  });

  $("refresh").addEventListener("click", () => {
    loadSeason(Number(seasonEl.value));
    refreshLiveStrip();
  });

  loadSeason(Number(seasonEl.value));

  refreshLiveStrip();
  liveTimer = window.setInterval(refreshLiveStrip, 30_000);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {});
  }
}

main();
