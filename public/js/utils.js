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

  //Menu Items Hover
  menuItems.forEach((menu) => {
    const link = menu.querySelector("a");
    const path = link.getAttribute("href");

    if (location.pathname === path) {
      menu.classList.add("active");
    } else if (path === "#") {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        menu.classList.add("active");
        const subMenu = menu.querySelector(".sub-menu");
        if (subMenu) {
          subMenu.classList.add("show");
        }

        // Close other menus with href="#"
        menuItems.forEach((otherMenu) => {
          if (otherMenu !== menu) {
            otherMenu.classList.remove("active");
            const otherSubMenu = otherMenu.querySelector(".sub-menu");
            if (otherSubMenu) {
              otherSubMenu.classList.remove("show");
            }
          }
        });
      });
    } else {
      menu.classList.remove("active");
    }
  });

  const subMenuItems = document.querySelectorAll(".sub-menu a");

  //Sub Menu Items Active
  subMenuItems.forEach((subMenuItem) => {
    if (location.pathname === subMenuItem.getAttribute("href")) {

      const parentMenuItem = subMenuItem.closest(".menu-item");
      const menuList = subMenuItem.closest(".sub-menu-itam");
      console.log("parent menu item ", parentMenuItem);

      menuList.classList.add("active");
      parentMenuItem.classList.add("active");
    }
  });
});

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

// Input file Count in files
function updateFileCount(event) {
  const fileCount = event.target.files.length;
  const fileCountText =
    fileCount === 1 ? "1 file selected" : `${fileCount} files selected`;
  document.getElementById("fileCount").textContent =
    fileCount > 0 ? fileCountText : "No files selected";
}

// Close dropdown when clicking outside
window.addEventListener("click", function (e) {
  const dropdown = document.getElementById("profiledropdownMenu");
  const button = document.querySelector(".user-dropdown-btn");
  if (!button.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

function toggleDropdownProfile() {
  const profiledropdownMenu = document.getElementById("profiledropdownMenu");
  profiledropdownMenu.classList.toggle("hidden");
}

function toggleDropdown(event) {
  console.log("toggled ");
  // Close all other dropdowns
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    dropdown.classList.add("hidden");
  });

  // Toggle the dropdown next to the clicked button
  const button = event.currentTarget;
  const dropdown = button.nextElementSibling;

  if (dropdown && dropdown.classList.contains("dropdown")) {
    dropdown.classList.toggle("hidden");
  }
}

function openModal() {
  document.getElementById("modal-background").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal-background").classList.add("hidden");
}
