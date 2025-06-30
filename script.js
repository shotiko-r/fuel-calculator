let data = JSON.parse(localStorage.getItem('fuelData')) || [];
let editIndex = null;

function calculate() {
  const date = document.getElementById("date").value.trim();
  const startKm = parseFloat(document.getElementById("startKm").value);
  const endKm = parseFloat(document.getElementById("endKm").value);
  const gasUsage = parseFloat(document.getElementById("gasUsage").value);
  const gasPrice = parseFloat(document.getElementById("gasPrice").value);
  const petrolUsage = parseFloat(document.getElementById("petrolUsage").value);
  const petrolPrice = parseFloat(document.getElementById("petrolPrice").value);
  const personalKm = parseFloat(document.getElementById("personalKm").value) || 0;

  if (!date || isNaN(startKm) || isNaN(endKm) || isNaN(gasUsage) ||
    isNaN(gasPrice) || isNaN(petrolUsage) || isNaN(petrolPrice) || endKm <= startKm) {
    showError("შეავსეთ ყველა სავალდებულო ველი! საბოლოო კმ > საწყისი კმ.");
    return;
  }

  const totalKm = endKm - startKm;
  const workKm = totalKm - personalKm;
  const gasUsed = totalKm * gasUsage / 100;
  const petrolUsed = totalKm * petrolUsage / 100;
  const gasCost = gasUsed * gasPrice;
  const petrolCost = petrolUsed * petrolPrice;
  const profit = petrolCost - gasCost;

  const entry = { date, totalKm, workKm, personalKm, gasCost, petrolCost, profit };

  if (editIndex !== null) {
    data[editIndex] = entry;
    editIndex = null;
  } else {
    data.push(entry);
  }

  localStorage.setItem('fuelData', JSON.stringify(data));
  updateHistory();
  updateSummary();
  clearInputs();
  showResult(entry);
}

function showResult(entry) {
  document.getElementById("resultArea").innerHTML = `
    <h3>შედეგი (${entry.date}):</h3>
    სულ გავიარე: <strong>${entry.totalKm} კმ</strong><br>
    სამუშაოდ: <strong>${entry.workKm} კმ</strong><br>
    პირადად: <strong>${entry.personalKm} კმ</strong><br><br>
    გაზის ხარჯი: <strong>${(entry.totalKm * entry.gasCost / entry.gasUsed).toFixed(2)} ლ</strong><br>
    ბენზინის ხარჯი: <strong>${(entry.totalKm * entry.petrolCost / entry.petrolUsed).toFixed(2)} ლ</strong><br>
    გაზის ღირებულება: <strong>${entry.gasCost.toFixed(2)} ₾</strong><br>
    ბენზინის ღირებულება: <strong>${entry.petrolCost.toFixed(2)} ₾</strong><br>
    შენ დარჩი: <strong>${entry.profit.toFixed(2)} ₾</strong>
  `;
}

function updateHistory() {
  let html = `<h3>ისტორია</h3><table><tr>
    <th>თარიღი</th><th>სულ კმ</th><th>სამსახური</th><th>პირადი</th>
    <th>გაზი ₾</th><th>ბენზინი ₾</th><th>მოგება ₾</th><th>მოქმედება</th></tr>`;

  data.forEach((d, i) => {
    html += `<tr>
      <td>${d.date}</td>
      <td>${d.totalKm}</td>
      <td>${d.workKm}</td>
      <td>${d.personalKm}</td>
      <td>${d.gasCost.toFixed(2)}</td>
      <td>${d.petrolCost.toFixed(2)}</td>
      <td>${d.profit.toFixed(2)}</td>
      <td>
        <button onclick="editEntry(${i})">✏️</button>
        <button onclick="deleteEntry(${i})">🗑️</button>
      </td>
    </tr>`;
  });

  document.getElementById("historyArea").innerHTML = html + "</table>";
}

function updateSummary() {
  const totalWork = data.reduce((sum, d) => sum + d.workKm, 0);
  const totalPersonal = data.reduce((sum, d) => sum + d.personalKm, 0);
  const totalProfit = data.reduce((sum, d) => sum + d.profit, 0);

  document.getElementById("summaryArea").innerHTML = `
    <h3>შეჯამება</h3>
    საერთო სამსახურის მანძილი: <strong>${totalWork} კმ</strong><br>
    საერთო პირადი მანძილი: <strong>${totalPersonal} კმ</strong><br>
    საერთო დარჩენილი თანხა: <strong>${totalProfit.toFixed(2)} ₾</strong>
  `;
}

function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  document.body.prepend(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}

function clearHistory() {
  if (confirm("დარწმუნებული ხარ რომ გინდა წაშლა?")) {
    localStorage.removeItem('fuelData');
    data = [];
    updateHistory();
    updateSummary();
    document.getElementById("resultArea").innerHTML = "";
  }
}

function exportToCSV() {
  if (data.length === 0) {
    showError("ისტორია ცარიელია!");
    return;
  }

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" +
    "თარიღი,სულ კმ,სამსახური კმ,პირადი კმ,გაზი ₾,ბენზინი ₾,მოგება ₾\n" +
    data.map(d =>
      `${d.date},${d.totalKm},${d.workKm},${d.personalKm},${d.gasCost.toFixed(2)},${d.petrolCost.toFixed(2)},${d.profit.toFixed(2)}`
    ).join("\n");

  const link = document.createElement("a");
  link.href = encodeURI(csvContent);
  link.download = `sawavlo_xarjebi_${new Date().toLocaleDateString('ka-GE')}.csv`;
  link.click();
}

function editEntry(index) {
  const d = data[index];
  document.getElementById("date").value = d.date;
  document.getElementById("startKm").value = "";
  document.getElementById("endKm").value = "";
  document.getElementById("gasUsage").value = "";
  document.getElementById("gasPrice").value = "";
  document.getElementById("petrolUsage").value = "";
  document.getElementById("petrolPrice").value = "";
  document.getElementById("personalKm").value = d.personalKm;
  editIndex = index;
  showError("შეცვალე ველები და დააჭირე 'გამოთვლა'");
}

function deleteEntry(index) {
  if (confirm("ნამდვილად წავშალო ჩანაწერი?")) {
    data.splice(index, 1);
    localStorage.setItem('fuelData', JSON.stringify(data));
    updateHistory();
    updateSummary();
  }
}

function clearInputs() {
  document.getElementById("date").value = "";
  document.getElementById("startKm").value = "";
  document.getElementById("endKm").value = "";
  document.getElementById("gasUsage").value = "";
  document.getElementById("gasPrice").value = "";
  document.getElementById("petrolUsage").value = "";
  document.getElementById("petrolPrice").value = "";
  document.getElementById("personalKm").value = "";
}

document.addEventListener('DOMContentLoaded', () => {
  updateHistory();
  updateSummary();
});
