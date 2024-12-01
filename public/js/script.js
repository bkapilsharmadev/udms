document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
    const menuItems = document.querySelectorAll(".menu-item");
  
    // Sidebar toggle functionality
    function toggleSidebar() {
      sidebar.classList.toggle("hidden");
      document.body.classList.toggle("sidebar-hidden");
    }
  
    toggleSidebarBtn.addEventListener("click", toggleSidebar);
  
    // Adjust sidebar on window resize
    function checkWindowSize() {
      if (window.innerWidth < 786) {
        sidebar.classList.add("hidden");
        document.body.classList.add("sidebar-hidden");
      } else {
        sidebar.classList.remove("hidden");
        document.body.classList.remove("sidebar-hidden");
      }
    }
  
    checkWindowSize();
    window.addEventListener("resize", checkWindowSize);
  
    // Submenu toggle functionality
    menuItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        // Ignore clicks within the sub-menu items
        if (e.target.closest(".sub-menu")) return;
  
        e.preventDefault();
  
        // Close other submenus
        menuItems.forEach((el) => {
          if (el !== item) {
            const submenu = el.querySelector(".sub-menu");
            if (submenu) submenu.classList.remove("show");
            el.classList.remove("active"); // Remove active from other menu items
          }
        });
  
        // Toggle current submenu
        const submenu = item.querySelector(".sub-menu");
        if (submenu) {
          submenu.classList.toggle("show");
        }
  
        // Add active class to the clicked menu item
        item.classList.toggle("active");
      });
    });
  
    // Sub-menu item click handler
    // document.querySelectorAll('.sub-menu-itam').forEach(subMenuItem => {
    //     subMenuItem.addEventListener('click', function (event) {
    //         event.preventDefault();
    //         document.querySelectorAll('.sub-menu-itam').forEach(i => i.classList.remove('active'));
    //         subMenuItem.classList.add('active');
    //     });
    // });
  });
  
  // Toggle Dropdown action menu item
  function toggleDropdown(index) {
    const dropdown = document.getElementById(`dropdown-${index}`);
    dropdown.classList.toggle("hidden");
  }
  
  // Close the dropdown if clicking outside of it
  document.addEventListener("click", function (event) {
    const dropdowns = document.querySelectorAll(".dropdown");
    dropdowns.forEach((dropdown) => {
      if (
        !dropdown.contains(event.target) &&
        !dropdown.previousElementSibling.contains(event.target)
      ) {
        dropdown.classList.add("hidden");
      }
    });
  });
  
  // Event delegation for delete button
  document.addEventListener("click", function (event) {
    if (event.target.closest(".delete-btn")) {
      const row = event.target.closest("tr");
      row.remove(); // Delete the table row
    }
  });
  
  // Input file Count in files
  function updateFileCount(event) {
    const fileCount = event.target.files.length;
    const fileCountText =
      fileCount === 1 ? "1 file selected" : `${fileCount} files selected`;
    document.getElementById("fileCount").textContent =
      fileCount > 0 ? fileCountText : "No files selected";
  }
  
  // profiel dropdown
  function toggleuserDropdown() {
    const profiledropdownMenu = document.getElementById("profiledropdownMenu");
    profiledropdownMenu.classList.toggle("hidden");
  }
  
  // Close dropdown when clicking outside
  window.addEventListener("click", function (e) {
    const dropdown = document.getElementById("profiledropdownMenu");
    const button = document.querySelector(".user-dropdown-btn");
    if (!button.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
  