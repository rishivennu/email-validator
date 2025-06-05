async function validateEmail() {
  const email = document.getElementById("emailInput").value;
  const resultDiv = document.getElementById("result");

  if (!email) {
    resultDiv.innerHTML = "<p>Please enter an email.</p>";
    return;
  }

  const API_KEY = "1a79d8bd310f46d2af5e272e051c912d"; // 🔑 Replace with your Abstract API key
  const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${encodeURIComponent(email)}`;

  resultDiv.innerHTML = "Validating...";

  try {
    const res = await fetch(url);
    const data = await res.json();

    resultDiv.innerHTML = `
      <p><strong>Deliverability:</strong> ${data.deliverability}</p>
      <p><strong>Free Email:</strong> ${data.is_free_email ? 'Yes' : 'No'}</p>
      <p><strong>Disposable:</strong> ${data.is_disposable_email ? 'Yes' : 'No'}</p>
      <p><strong>Role-based:</strong> ${data.is_role_email ? 'Yes' : 'No'}</p>
      <p><strong>Valid Format:</strong> ${data.is_valid_format.value ? 'Yes' : 'No'}</p>
    `;
  } catch (err) {
    resultDiv.innerHTML = "<p>There was an error validating the email.</p>";
    console.error(err);
  }
}
