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
    console.log("response ", response);

    if (response.status === 401) {
      location.href = "/";
      return;
    }

    if (response.ok) {
      let data = await response.json();
      return { error: null, data };
    } else {
      return {
        error: { status: response.status, message: response.statusText },
        data: null,
      };
    }
  } catch (error) {
    return {
      error: { status: error.response.status, message: error.message },
      data: null,
    };
  }
}
