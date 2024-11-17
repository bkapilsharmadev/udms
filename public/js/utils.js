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

      // e.preventDefault();

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
// function toggleDropdown(index) {
//   const dropdown = document.getElementById(`dropdown-${index}`);
//   dropdown.classList.toggle("hidden");
// }

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

function openModal() {
  document.getElementById("modal-background").classList.remove("hidden");
}

// Close Modal Function
function closeModal() {
  document.getElementById("modal-background").classList.add("hidden");
}

function toggleDropdownProfile() {
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
