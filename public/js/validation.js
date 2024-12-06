function isRequired(fields) {
	for (const field of fields) {
		const { value, name } = field;
		console.log("value and name ", JSON.stringify({ value, name }));
		if (value == undefined || value == null || value == "") {
			showAlert({
				alert: 'error',
				message: `${name} Is Required`
			});
			return false;
		}
	}

	return true;
}

function areFilesValid(files, isUpdate) {
	if (!isUpdate) {
		return true;
	}

	if (!files || files.length === 0) {
		showAlert({
			alert: 'error',
			message: "At least one file is required"
		});
		return false;
	}

	const allowedExtensions = ["doc", "docx", "xls", "xlsx", "png", "jpg", "pdf"];

	for (const file of files) {
		const fileExtension = file.name.split(".").pop().toLowerCase();
		if (!allowedExtensions.includes(fileExtension)) {
			showAlert({
				alert: 'error',
				message: `Invalid file type: ${file.name}`
			});
			return false;
		}
	}

	return true;
}
