async function fetchAPI() {
    const res = await fetch('http://localhost:3000/api/v1/users');
    const data = await res.json();
    const usersList = document.getElementById('user-list');
    usersList.innerHTML = '';
    data.data.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `ID: ${user.id} - Name: ${user.name} - Email: ${user.email}`;
        usersList.appendChild(li);
    });
}