const icons = document.querySelectorAll(".nav-container i");

icons.forEach(icon => {
  icon.addEventListener("click", () => {
    icons.forEach(i => i.classList.remove("circled"));
    icon.classList.add("circled");
  });
});
 
 setTimeout(() => {
      document.querySelectorAll('.alert').forEach(el => el.style.display='none');
    }, 4000);