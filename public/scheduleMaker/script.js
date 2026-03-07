let scouts = [];

function addScout() {
  let name = document.getElementById("name").value;
  let late = Number(document.getElementById("late").value || 0);
  let early = Number(document.getElementById("early").value || 999);
  let group = document.getElementById("group").value;

  if (!name) return;

  scouts.push({
    name,
    late,
    early,
    group,
  });

  renderScouts();

  document.getElementById("name").value = "";
  document.getElementById("group").value = "";
}

function renderScouts() {
  let div = document.getElementById("scoutList");
  div.innerHTML = "";

  scouts.forEach((s) => {
    let p = document.createElement("div");
    p.innerText = `${s.name} | arrive ${s.late} | leave ${s.early} | group ${s.group || "-"}`;
    div.appendChild(p);
  });
}

function generate() {
  let matches = Number(document.getElementById("matches").value);
  let lunch = Number(document.getElementById("lunch").value);
  let dayEnd = Number(document.getElementById("dayEnd").value);

  let roles = ["Red1", "Red2", "Red3", "Blue1", "Blue2", "Blue3"];

  let schedule = Array.from({ length: matches }, () => Array(6).fill(""));

  let stats = {};

  scouts.forEach((s) => {
    stats[s.name] = { count: 0, last: -100 };
  });

  let groups = {};

  scouts.forEach((s) => {
    let key = s.group || s.name;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  let groupList = Object.values(groups);

  for (let m = 0; m < matches; m++) {
    // prioritize groups with lowest total assignments
    groupList.sort((a, b) => {
      let ac = a.reduce((sum, s) => sum + stats[s.name].count, 0);
      let bc = b.reduce((sum, s) => sum + stats[s.name].count, 0);
      return ac - bc;
    });

    for (let g of groupList) {
      let size = g.length;

      let earliest = Math.max(...g.map((s) => s.late));
      let latest = Math.min(...g.map((s) => s.early));

      if (m < earliest || m > latest) continue;

      // check consecutive rule
      let bad = false;

      for (let s of g) {
        let last = stats[s.name].last;
        let consecutive = m - last == 1;
        let breakAllowed = last == lunch || last == dayEnd;

        if (consecutive && !breakAllowed) {
          bad = true;
          break;
        }
      }

      if (bad) continue;

      let redOpen = schedule[m].slice(0, 3).filter((x) => !x).length;
      let blueOpen = schedule[m].slice(3).filter((x) => !x).length;

      let start = null;

      if (redOpen >= size) start = 0;
      else if (blueOpen >= size) start = 3;

      if (start === null) continue;

      for (let s of g) {
        let slot = schedule[m].findIndex(
          (v, i) => !v && i >= start && i < start + 3,
        );

        if (slot == -1) break;

        schedule[m][slot] = s.name;
        stats[s.name].last = m;
        stats[s.name].count++;
      }
    }
  }

  renderSchedule(schedule, roles);
}

function renderSchedule(schedule, roles) {
  let div = document.getElementById("schedule");

  let html = "<table>";

  html += "<tr><th>Match</th>";

  roles.forEach((r) => {
    html += `<th>${r}</th>`;
  });

  html += "</tr>";

  schedule.forEach((row, i) => {
    html += "<tr>";
    html += `<td>${i + 1}</td>`;

    row.forEach((cell) => {
      html += `<td>${cell}</td>`;
    });

    html += "</tr>";
  });

  html += "</table>";

  div.innerHTML = html;
}
