//Dynamic Fetch API
 async function dynamicFetch(url, method = 'GET', body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
  
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
  
    try {
      const response = await fetch(url, options);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      } else {
        return await response.json();
      }
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }