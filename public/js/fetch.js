async function fetchApi(url, method = "GET", data = null) {
    const options = {
        method,
        headers: {
            Accept: "application/json",
        },
    };

    if (method === "POST" && data) {
        if (data instanceof FormData) {
            options.body = data;
        } else {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(data);
        }
    }

    try {
        const response = await fetch(url, options);
        console.log('response ',response);

        if (response.status === 401) {
            if (location.pathname === "/signin") {
                return { status: 401, message: 'Invalid Credentials!' };
            } else {
                location.href = "/signin";
            }
            return;
        }

        if (response.ok) {
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                return await response.json();
            } else {
                return await response.text();
            }
        }
    } catch (error) {
        console.error("Fetch API error:", error);
        throw error;
    }
}
