function toggleMenu() {
    const topnav = document.getElementById("myTopnav");
    if (topnav.className === "topnav") {
      topnav.className += " responsive";
    } else {
      topnav.className = "topnav";
    }
  }

  function displayDateTime() {
    const now = new Date();
    const dateTime = now.toLocaleString();
    document.getElementById("date-time").textContent = dateTime;
  }
  displayDateTime();