/* ==============================
   CLEAN SIDEBAR ENGINE
============================== */

(function () {

  console.log("Sidebar script loaded");

  document.addEventListener("DOMContentLoaded", function () {

    const menuBtn = document.querySelector(".menu-btn");
    const sidebar = document.querySelector(".sidebar");
    const closeBtn = document.querySelector(".close-btn");
    const overlay = document.querySelector(".overlay");

    if (!menuBtn || !sidebar || !overlay) {
      console.error("Sidebar elements not found");
      return;
    }

    function openSidebar() {
      sidebar.classList.add("active");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }

    menuBtn.addEventListener("click", openSidebar);

    if (closeBtn) {
      closeBtn.addEventListener("click", closeSidebar);
    }

    overlay.addEventListener("click", closeSidebar);

  });

})();
