const btnScrollToNext = document.querySelector(".btn_arrow");

btnScrollToNext.addEventListener("click", () => {
  window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
});
