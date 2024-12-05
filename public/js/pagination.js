// Table Filter
function initiateTableFilter() {
	$(".table-filter-wrapper .filter-btn").click(function () {
		$(".table-filter-wrapper .filter-options").slideToggle();
	});
}

function createPagination(totalPages, page) {
	totalPages = Number(totalPages);
	page = Number(page);

	let str = "<ul>";
	let active;
	let previousFlag;
	let pageCutLow = page - 1;
	let pageCutHigh = page + 1;

	// Disable "Previous" button if page number is less than 2
	if (page > 1) {
		str += `<li class="pagination-btn page-item pag-previous m-1"><a data-page-num=${
			page - 1
		} onclick="createPagination(${totalPages}, ${page - 1})">Previous</a></li>`;
	} else {
		str += `<li class="pagination-btn page-item m-1"><a style="color: grey; background:#e8e8e8">Previous</a></li>`;
	}

	if (totalPages <= 3) {
		for (let p = 1; p <= totalPages; p++) {
			active = page == p ? "active" : "";
			previousFlag = page < p ? "pag-next" : "pag-previous";
			str += `<li class="pagination-btn pag-num ${active} ${previousFlag} m-1"><a data-page-num=${p} class="aclasshere" onclick="createPagination(${totalPages}, ${p})">${p}</a></li>`;
		}
	} else {
		if (page > 2) {
			str += `<li class="pagination-btn no pag-num pag-previous m-1"><a data-page-num=${1} onclick="createPagination(${totalPages}, ${1})">1</a></li>`;

			if (page > 3 && totalPages >= 5) {
				str += '<li class="pagination-btn out-of-range m-1"><a>...</a></li>';
			}
		}
		if (page === 1) {
			pageCutHigh += 1;
		}

		if (page === totalPages) {
			pageCutLow -= 1;
		}

		for (let p = pageCutLow; p <= pageCutHigh; p++) {
			if (p === 0) {
				p += 1;
			}
			if (p > totalPages) {
				continue;
			}
			active = page == p ? "active" : "";
			previousFlag = page < p ? "pag-next" : "pag-previous"; // dividing totalPages into next and prev

			str += `<li class="pagination-btn page-item pag-num m-1 ${active} ${previousFlag}"><a data-page-num=${p} onclick="createPagination(${totalPages}, ${p})">${p}</a></li>`;
		}
		if (page < totalPages - 1) {
			if (page < totalPages - 2 && totalPages >= 5) {
				str += `<li class="pagination-btn out-of-range m-1"><a>...</a></li>`;
			}
			str += `<li class="pagination-btn page-item no m-1"><a>${totalPages}</a></li>`;
		}
	}

	// Enable "Next" button if page number is less than the total number of totalPages
	if (page < totalPages) {
		str += `<li class="pagination-btn page-item pag-next m-1"><a data-page-num=${
			page + 1
		} onclick="createPagination(${totalPages}, ${page + 1})">Next</a></li>`;
	} else {
		str +=
			'<li class="pagination-btn page-item m-1 disabled"><a style="color: grey; background:#e8e8e8">Next</a></li>';
	}

	str += "</ul>";
	if (document.getElementById("custom-pagination")) {
		document.getElementById("custom-pagination").innerHTML = str;
	}
	return str;
}

function createPaginationDynamic(totalPages, page, parentSelector) {
	totalPages = Number(totalPages);
	page = Number(page);

	let str = "<ul>";
	let active;
	let previousFlag;
	let pageCutLow = page - 1;
	let pageCutHigh = page + 1;

	// Disable "Previous" button if page number is less than 2
	if (page > 1) {
		str += `<li class="pagination-btn page-item pag-previous m-1"><a data-page-num=${
			page - 1
		} onclick="createPaginationDynamic(${totalPages}, ${
			page - 1
		}, '${parentSelector}')">Previous</a></li>`;
	} else {
		str += `<li class="pagination-btn page-item m-1"><a style="color: grey; background:#e8e8e8">Previous</a></li>`;
	}

	if (totalPages <= 3) {
		for (let p = 1; p <= totalPages; p++) {
			active = page == p ? "active" : "";
			previousFlag = page < p ? "pag-next" : "pag-previous";
			str += `<li class="pagination-btn pag-num ${active} ${previousFlag} m-1"><a data-page-num=${p} class="aclasshere" onclick="createPaginationDynamic(${totalPages}, ${p}, '${parentSelector}')">${p}</a></li>`;
		}
	} else {
		if (page > 2) {
			str += `<li class="pagination-btn no pag-num pag-previous m-1"><a data-page-num=${1} onclick="createPaginationDynamic(${totalPages}, ${1}, '${parentSelector}')">1</a></li>`;

			if (page > 3 && totalPages >= 5) {
				str += '<li class="pagination-btn out-of-range m-1"><a>...</a></li>';
			}
		}
		if (page === 1) {
			pageCutHigh += 1;
		}

		if (page === totalPages) {
			pageCutLow -= 1;
		}

		for (let p = pageCutLow; p <= pageCutHigh; p++) {
			if (p === 0) {
				p += 1;
			}
			if (p > totalPages) {
				continue;
			}
			active = page == p ? "active" : "";
			previousFlag = page < p ? "pag-next" : "pag-previous"; // dividing totalPages into next and prev

			str += `<li class="pagination-btn page-item pag-num m-1 ${active} ${previousFlag}"><a data-page-num=${p} onclick="createPaginationDynamic(${totalPages}, ${p}, '${parentSelector}')">${p}</a></li>`;
		}
		if (page < totalPages - 1) {
			if (page < totalPages - 2 && totalPages >= 5) {
				str += `<li class="pagination-btn out-of-range m-1"><a>...</a></li>`;
			}
			str += `<li class="pagination-btn page-item no m-1"><a>${totalPages}</a></li>`;
		}
	}

	// Enable "Next" button if page number is less than the total number of totalPages
	if (page < totalPages) {
		str += `<li class="pagination-btn page-item pag-next m-1"><a data-page-num=${
			page + 1
		} onclick="createPaginationDynamic(${totalPages}, ${
			page + 1
		}, '${parentSelector}')">Next</a></li>`;
	} else {
		str +=
			'<li class="pagination-btn page-item m-1 disabled"><a style="color: grey; background:#e8e8e8">Next</a></li>';
	}

	str += "</ul>";
	const customPaginationWrapper = document
		.querySelector(parentSelector)
		.querySelector(".custom-pagination");

	if (customPaginationWrapper) {
		customPaginationWrapper.innerHTML = str;
	}
	return str;
}

function initTablePagination(selector, totalPages, page) {
	totalPages = Number(totalPages);
	page = Number(page);

	let str = "<ul>";
	let active;
	let previousFlag;
	let pageCutLow = page - 1;
	let pageCutHigh = page + 1;

	// Disable "Previous" button if page number is less than 2
	if (page > 1) {
		str += `<li class="pagination-btn page-item pag-previous m-1"><a data-page-num=${
			page - 1
		} onclick="createPagination(${totalPages}, ${page - 1})">Previous</a></li>`;
	} else {
		str += `<li class="pagination-btn page-item m-1"><a style="color: grey; background:#e8e8e8">Previous</a></li>`;
	}

	if (totalPages <= 3) {
		for (let p = 1; p <= totalPages; p++) {
			active = page == p ? "active" : "";
			previousFlag = page < p ? "pag-next" : "pag-previous";
			str += `<li class="pagination-btn pag-num ${active} ${previousFlag} m-1"><a data-page-num=${p} class="aclasshere" onclick="createPagination(${totalPages}, ${p})">${p}</a></li>`;
		}
	} else {
		if (page > 2) {
			str += `<li class="pagination-btn no pag-num pag-previous m-1"><a data-page-num=${1} onclick="createPagination(${totalPages}, ${1})">1</a></li>`;

			if (page > 3 && totalPages >= 5) {
				str += '<li class="pagination-btn out-of-range m-1"><a>...</a></li>';
			}
		}
		if (page === 1) {
			pageCutHigh += 1;
		}

		if (page === totalPages) {
			pageCutLow -= 1;
		}

		for (let p = pageCutLow; p <= pageCutHigh; p++) {
			if (p === 0) {
				p += 1;
			}
			if (p > totalPages) {
				continue;
			}
			active = page == p ? "active" : "";
			previousFlag = page < p ? "pag-next" : "pag-previous"; // dividing totalPages into next and prev

			str += `<li class="pagination-btn page-item pag-num m-1 ${active} ${previousFlag}"><a data-page-num=${p} onclick="createPagination(${totalPages}, ${p})">${p}</a></li>`;
		}
		if (page < totalPages - 1) {
			if (page < totalPages - 2 && totalPages >= 5) {
				str += `<li class="pagination-btn out-of-range m-1"><a>...</a></li>`;
			}
			str += `<li class="pagination-btn page-item no m-1"><a>${totalPages}</a></li>`;
		}
	}

	// Enable "Next" button if page number is less than the total number of totalPages
	if (page < totalPages) {
		str += `<li class="pagination-btn page-item pag-next m-1"><a data-page-num=${
			page + 1
		} onclick="createPagination(${totalPages}, ${page + 1})">Next</a></li>`;
	} else {
		str +=
			'<li class="pagination-btn page-item m-1 disabled"><a style="color: grey; background:#e8e8e8">Next</a></li>';
	}

	str += "</ul>";

	let selectorElement = document.querySelector(selector);
	if (selectorElement) {
		selectorElement.innerHTML = str;
	}
}

function updateSerialNumbers(elemSelector) {
	var elements = document.querySelectorAll(elemSelector);

	elements.forEach(function (element, index) {
		var firstTd = element.querySelector("td:first-child");
		if (firstTd) {
			firstTd.textContent = index + 1;
		}
	});
}
