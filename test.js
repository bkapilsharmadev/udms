class CustomError extends Error {
    constructor(message) {
      super(message); // Call the parent Error constructor
      this.name = this.constructor.name; // Set the error name to the class name
      Error.captureStackTrace(this); // Do NOT exclude the constructor
    }
  }
  
  function helperFunction() {
    throw new CustomError("Something went wrong");
  }
  
  try {
    helperFunction();
  } catch (error) {
    console.log(error.stack);
  }
  