function isRequired(fields) {

    for (const field of fields) {
        const { value, name } = field;
        console.log('value and name ',JSON.stringify({value,name}));
        if (value == undefined || value == null || value == "") {
            alert(`${name} Is Required`);
            return false;
        }
    }

    return true;
}