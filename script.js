const employees = [
  { name: "Ava Patel", department: "Engineering", role: "Frontend Lead", score: 4.7, goals: 94, potential: "High", risk: "Low" },
  { name: "Marcus Lee", department: "Sales", role: "Account Executive", score: 4.2, goals: 88, potential: "High", risk: "Medium" },
  { name: "Nora Evans", department: "People", role: "HR Partner", score: 4.5, goals: 91, potential: "High", risk: "Low" },
  { name: "Diego Ramos", department: "Operations", role: "Logistics Manager", score: 3.8, goals: 79, potential: "Medium", risk: "Medium" },
  { name: "Maya Chen", department: "Engineering", role: "Backend Engineer", score: 4.9, goals: 98, potential: "High", risk: "Low" },
  { name: "Owen Brooks", department: "Finance", role: "FP&A Analyst", score: 3.5, goals: 72, potential: "Medium", risk: "High" },
  { name: "Lina Haddad", department: "Marketing", role: "Growth Manager", score: 4.1, goals: 86, potential: "Medium", risk: "Low" },
  { name: "Sam Turner", department: "Support", role: "Customer Success", score: 3.2, goals: 68, potential: "Medium", risk: "High" },
  { name: "Priya Nair", department: "Sales", role: "Sales Manager", score: 4.6, goals: 92, potential: "High", risk: "Low" },
  { name: "Jon Bell", department: "Operations", role: "Process Analyst", score: 3.9, goals: 83, potential: "Medium", risk: "Medium" },
  { name: "Sara Kim", department: "Finance", role: "Controller", score: 4.3, goals: 89, potential: "High", risk: "Low" },
  { name: "Elena Petrova", department: "Marketing", role: "Content Strategist", score: 3.7, goals: 76, potential: "Medium", risk: "Medium" }
];

const sampleAdditions = [
  { name: "Rohan Mehta", department: "Engineering", role: "QA Engineer", score: 4.0, goals: 84, potential: "Medium", risk: "Low" },
  { name: "Grace Miller", department: "Support", role: "Support Lead", score: 4.4, goals: 90, potential: "High", risk: "Low" },
  { name: "Amir Khan", department: "Sales", role: "Revenue Analyst", score: 3.6, goals: 75, potential: "Medium", risk: "Medium" }
];

let employeeData = [...employees];
let additionIndex = 0;
let selectedEmployeeName = "";

const departmentFilter = document.querySelector("#departmentFilter");
const bandFilter = document.querySelector("#bandFilter");
const searchInput = document.querySelector("#searchInput");
const employeeTable = document.querySelector("#employeeTable");
const employeeCount = document.querySelector("#employeeCount");
const departmentChart = document.querySelector("#departmentChart");
const riskDonut = document.querySelector("#riskDonut");
const riskLegend = document.querySelector("#riskLegend");
const toast = document.querySelector("#toast");
const navItems = document.querySelectorAll(".nav-item");

const formatPercent = (value) => `${Math.round(value)}%`;
const average = (items, selector) => items.length ? items.reduce((sum, item) => sum + selector(item), 0) / items.length : 0;

function getBand(score) {
  if (score >= 4.5) return "excellent";
  if (score >= 4) return "strong";
  if (score >= 3.5) return "steady";
  return "needs-focus";
}

function getFilteredEmployees() {
  const department = departmentFilter.value;
  const band = bandFilter.value;
  const query = searchInput.value.trim().toLowerCase();

  return employeeData.filter((employee) => {
    const matchesDepartment = department === "all" || employee.department === department;
    const matchesBand = band === "all" || getBand(employee.score) === band;
    const matchesQuery = !query || `${employee.name} ${employee.role}`.toLowerCase().includes(query);
    return matchesDepartment && matchesBand && matchesQuery;
  });
}

function populateDepartments() {
  const departments = [...new Set(employeeData.map((employee) => employee.department))].sort();
  const current = departmentFilter.value || "all";

  departmentFilter.innerHTML = `<option value="all">All departments</option>`;
  departments.forEach((department) => {
    const option = document.createElement("option");
    option.value = department;
    option.textContent = department;
    departmentFilter.appendChild(option);
  });

  departmentFilter.value = departments.includes(current) ? current : "all";
}

function updateMetrics(filtered) {
  const avgScore = average(filtered, (employee) => employee.score);
  const avgGoals = average(filtered, (employee) => employee.goals);
  const riskCount = filtered.filter((employee) => employee.risk !== "Low").length;
  const readyCount = filtered.filter((employee) => employee.score >= 4.3 && employee.goals >= 88 && employee.potential === "High").length;

  document.querySelector("#avgScore").textContent = avgScore.toFixed(1);
  document.querySelector("#avgGoals").textContent = formatPercent(avgGoals);
  document.querySelector("#riskRate").textContent = formatPercent(filtered.length ? (riskCount / filtered.length) * 100 : 0);
  document.querySelector("#promotionReady").textContent = readyCount;
  document.querySelector("#scoreTrend").textContent = filtered.length ? `${filtered.length} selected employees` : "No matching employees";
}

function setEmployeeHighlight() {
  employeeTable.querySelectorAll("tr").forEach((row) => {
    row.classList.toggle("selected-row", row.dataset.name === selectedEmployeeName);
  });
}

function renderDepartmentChart(filtered) {
  const departments = [...new Set(filtered.map((employee) => employee.department))].sort();
  departmentChart.innerHTML = "";

  if (!departments.length) {
    departmentChart.innerHTML = `<p class="empty-state">No department data for this filter.</p>`;
    return;
  }

  departments.forEach((department) => {
    const team = filtered.filter((employee) => employee.department === department);
    const score = average(team, (employee) => employee.score);
    const width = Math.max(4, (score / 5) * 100);

    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span class="bar-label" title="${department}">${department}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${width}%"></span></span>
      <span class="bar-value">${score.toFixed(1)}</span>
    `;
    departmentChart.appendChild(row);
  });
}

function renderRiskDonut(filtered) {
  const total = filtered.length || 1;
  const counts = {
    Low: filtered.filter((employee) => employee.risk === "Low").length,
    Medium: filtered.filter((employee) => employee.risk === "Medium").length,
    High: filtered.filter((employee) => employee.risk === "High").length
  };

  const lowEnd = (counts.Low / total) * 100;
  const mediumEnd = lowEnd + (counts.Medium / total) * 100;

  riskDonut.style.background = `conic-gradient(
    var(--green) 0 ${lowEnd}%,
    var(--amber) ${lowEnd}% ${mediumEnd}%,
    var(--red) ${mediumEnd}% 100%
  )`;

  riskLegend.innerHTML = "";
  [
    ["Low", "var(--green)"],
    ["Medium", "var(--amber)"],
    ["High", "var(--red)"]
  ].forEach(([label, color]) => {
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `
      <span class="legend-label"><span class="dot" style="background:${color}"></span>${label}</span>
      <strong>${counts[label]}</strong>
    `;
    riskLegend.appendChild(item);
  });
}

function renderTable(filtered) {
  employeeTable.innerHTML = "";
  employeeCount.textContent = `${filtered.length} employee${filtered.length === 1 ? "" : "s"}`;

  if (!filtered.length) {
    employeeTable.innerHTML = `
      <tr>
        <td colspan="8">No employees match the selected filters.</td>
      </tr>
    `;
    return;
  }

  filtered.forEach((employee) => {
    const row = document.createElement("tr");
    row.dataset.name = employee.name;
    row.innerHTML = `
      <td><span class="employee-name">${employee.name}</span></td>
      <td>${employee.department}</td>
      <td>${employee.role}</td>
      <td><span class="score-pill">${employee.score.toFixed(1)}</span></td>
      <td>${employee.goals}%</td>
      <td><span class="potential-pill">${employee.potential}</span></td>
      <td><span class="risk-pill risk-${employee.risk.toLowerCase()}">${employee.risk}</span></td>
      <td><button class="table-action" type="button" data-name="${employee.name}">Review</button></td>
    `;
    employeeTable.appendChild(row);
  });

  setEmployeeHighlight();
}

function render() {
  const filtered = getFilteredEmployees();
  updateMetrics(filtered);
  renderDepartmentChart(filtered);
  renderRiskDonut(filtered);
  renderTable(filtered);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function exportReport() {
  const filtered = getFilteredEmployees();
  if (!filtered.length) {
    showToast("No employee data to export.");
    return;
  }

  const rows = [
    ["Name", "Department", "Role", "Score", "Goals", "Potential", "Risk"],
    ...filtered.map((employee) => [
      employee.name,
      employee.department,
      employee.role,
      employee.score,
      `${employee.goals}%`,
      employee.potential,
      employee.risk
    ])
  ];

  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "hr-performance-report.csv";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  showToast("CSV report exported.");
}

departmentFilter.addEventListener("change", render);
bandFilter.addEventListener("change", render);
searchInput.addEventListener("input", render);

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((navItem) => navItem.classList.remove("active"));
    item.classList.add("active");
    showToast(`${item.textContent.trim()} selected.`);
  });
});

document.querySelector("#resetFilters").addEventListener("click", () => {
  departmentFilter.value = "all";
  bandFilter.value = "all";
  searchInput.value = "";
  render();
  showToast("Filters reset.");
});

document.querySelector("#exportReport").addEventListener("click", exportReport);

document.querySelector("#addEmployee").addEventListener("click", () => {
  const nextEmployee = sampleAdditions[additionIndex % sampleAdditions.length];
  employeeData = [...employeeData, { ...nextEmployee, name: `${nextEmployee.name} ${Math.floor(additionIndex / sampleAdditions.length) + 1}` }];
  additionIndex += 1;
  populateDepartments();
  render();
  showToast("Sample employee added.");
});

employeeTable.addEventListener("click", (event) => {
  const button = event.target.closest(".table-action");
  if (!button) return;
  selectedEmployeeName = button.dataset.name;
  setEmployeeHighlight();
  showToast(`${button.dataset.name} opened for manager review.`);
});

populateDepartments();
render();
