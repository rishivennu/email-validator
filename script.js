const typoFixes = {
  "gmial.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "outllok.com": "outlook.com"
};

let results = [];
let chartInstance = null;

function suggestFix(email) {
  const domain = email.split("@")[1];
  for (let typo in typoFixes) {
    if (domain && domain.includes(typo)) {
      document.getElementById("suggestionBox").innerText =
        `Did you mean: ${email.replace(typo, typoFixes[typo])}?`;
      return;
    }
  }
  document.getElementById("suggestionBox").innerText = "";
}

async function validateEmail(emailFromBulk = null) {
  const email = emailFromBulk || document.getElementById("emailInput").value;
  suggestFix(email);
  const API_KEY = "1a79d8bd310f46d2af5e272e051c912d";
  const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${encodeURIComponent(email)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    console.log("Validation data:", data);
    results.push(data);
    updateResult(data);
    updateChart();
  } catch (err) {
    console.error("Validation failed:", err);
    document.getElementById("resultBox").innerHTML = `<p style="color:red;">Failed to validate <strong>${email}</strong>. Try again later.</p>`;
  }
}

function updateResult(data) {
  const resultBox = document.getElementById("resultBox");
  resultBox.innerHTML = `
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Deliverability:</strong> ${data.deliverability}</p>
    <p><strong>Is Free:</strong> ${data.is_free_email}</p>
    <p><strong>Disposable:</strong> ${data.is_disposable_email}</p>
    <p><strong>Role Based:</strong> ${data.is_role_email}</p>
    <p><strong>Valid Format:</strong> ${data.is_valid_format.value}</p>
    <p><strong>Suggestion:</strong> ${data.autocorrect || 'None'}</p>
  `;
}

function copyResult() {
  const resultText = document.getElementById("resultBox").innerText;
  navigator.clipboard.writeText(resultText);
  alert("Result copied to clipboard!");
}

function handleCSV(event) {
  const file = event.target.files[0];
  Papa.parse(file, {
    header: true,
    complete: function (parsed) {
      const emails = parsed.data.map(row => row.email);
      emails.forEach(email => {
        if (email) validateEmail(email);
      });
    }
  });
}

function exportCSV() {
  const csv = Papa.unparse(results);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "validated_emails.csv");
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  results.forEach((r, i) => {
    doc.text(`Email ${i + 1}: ${r.email}`, 10, y);
    y += 10;
  });
  doc.save("validated_emails.pdf");
}

function updateChart() {
  const disposable = results.filter(r => r.is_disposable_email).length;
  const free = results.filter(r => r.is_free_email).length;
  const role = results.filter(r => r.is_role_email).length;

  const ctx = document.getElementById("emailChart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy(); // Remove old chart before drawing new
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Disposable", "Free", "Role-based"],
      datasets: [{
        label: "Email Type Count",
        data: [disposable, free, role],
        backgroundColor: ["#f44336", "#4caf50", "#ff9800"]
      }]
    }
  });
}
