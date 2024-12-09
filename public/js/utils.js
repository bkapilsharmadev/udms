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

  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    dropdown.classList.add("hidden");
  });

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

function isLoader(isLoad) {
  if (isLoad) {
    document.querySelector('.loader').style.display = "flex";
  } else {
    document.querySelector('.loader').style.display = "none";
  }
}

function showAlert(obj) {
  switch (obj.alert) {
    case "success":
      const successMessage = `<p class="text-sm text-gray-600">${obj.message}</p>`;
      document.getElementById("success-alert-content").innerHTML = successMessage;
      document.getElementById("success-alert").classList.remove("hidden");
      setTimeout(() => {
        document.getElementById("success-alert-content").innerHTML = '';
        document.getElementById("success-alert").classList.add("hidden");
      }, 5000);
      break;
    case "error":
      const errorMessage = `<p class="text-sm text-gray-600">${obj.message}</p>`;
      document.getElementById("error-alert-content").innerHTML = errorMessage;
      document.getElementById("error-alert").classList.remove("hidden");
      setTimeout(() => {
        document.getElementById("error-alert-content").innerHTML = '';
        document.getElementById("error-alert").classList.add("hidden");
      }, 5000);
      break;
    case "warning":
      const warningMessage = `<p class="text-sm text-gray-600">${obj.message}</p>`;
      document.getElementById("warning-alert-content").innerHTML = warningMessage;
      document.getElementById("warning-alert").classList.remove("hidden");
      setTimeout(() => {
        document.getElementById("warning-alert-content").innerHTML = '';
        document.getElementById("warning-alert").classList.add("hidden");
      }, 5000);
      break;
    case "info":
      const infoMessage = `<p class="text-sm text-gray-600">${obj.message}</p>`;
      document.getElementById("info-alert-content").innerHTML = infoMessage;
      document.getElementById("info-alert").classList.remove("hidden");
      setTimeout(() => {
        document.getElementById("info-alert-content").innerHTML = '';
        document.getElementById("info-alert").classList.add("hidden");
      }, 5000);
      break;
    default:
      break;
  }
}

const toggleDropdownSelect = () => {
  const dropdownContent = document.getElementById("dropdownContent");
  const arrowIcon = document.querySelector(".arrow-icon");

  dropdownContent.classList.toggle("active");
  arrowIcon.style.transform = dropdownContent.classList.contains("active")
      ? "rotate(180deg)"
      : "rotate(0deg)";
};

const filterOptionsSelect = (event) => {
  const query = event.target.value.toLowerCase();
  const options = document.querySelectorAll(".option");

  options.forEach((option) => {
      const text = option.textContent.toLowerCase();
      option.style.display = text.includes(query) ? "block" : "none";
  });
};

const selectOption = (value) => {
  const selectedOptions = document.getElementById("selectedOptions");
  const dropdownPlaceholder = document.getElementById("dropdownPlaceholder");

  dropdownPlaceholder.style.display = "none";
  selectedOptions.innerHTML = "";
  selectedOptions.innerHTML += `<span>${value}</span>`;
  document.getElementById("dropdownContent").classList.remove("active");
  document.querySelector(".arrow-icon").style.transform = "rotate(0deg)";
};