// import the required dependencies
require("dotenv").config();
const OpenAI = require("openai");
const fsPromises = require("fs").promises;
const fs = require("fs");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Create a OpenAI connection
const secretKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: secretKey,
});

async function askQuestion(question) {
  return new Promise((resolve, reject) => {
    readline.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    const fileName = await askQuestion("Enter the filename to upload: ");

    // Upload the file
    const file = await openai.files.create({
      file: fs.createReadStream(fileName),
      purpose: "assistants",
    });


    console.log("File uploaded and successfully with below ID \n\"" + file.id+"\"");
    return;
  }
  catch (e) {
    console.log("File upload Failed with below Error " +  e);
  }

}


// Call the main function
main();
