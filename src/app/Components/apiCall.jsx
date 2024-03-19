const OpenAI = require("openai");

const secretKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const openai = new OpenAI({
    apiKey: secretKey,
    dangerouslyAllowBrowser: true,
});

let assistantId ;

let assistantDetails;

let thread = null;


async function updateFileWithAssistant () {

    await openai.beta.assistants.update(assistantId, {
        file_ids: [ process.env.NEXT_PUBLIC_FILE_ID],
    });
}

export async function createAssistant(){
    const assistantConfig = {
        name: "Assistant",
        instructions: "act as a file reader",
        tools: [{ type: "retrieval" }],
        model: "gpt-3.5-turbo",
    };

    const assistant = await openai.beta.assistants.create(assistantConfig);
    assistantDetails = { assistantId: assistant.id, ...assistantConfig };

    assistantId = assistantDetails.assistantId;

    updateFileWithAssistant();
}



export async function askQuestions (question){
    try {
        
   
    if(thread == null){
        console.log("creating Thread");
        thread = await openai.beta.threads.create();
    }

    await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: question,
    });

    // Create a run
    const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId,
    });

    // Imediately fetch run-status, which will be "in_progress"
    let runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
    );


    // Polling mechanism to see if runStatus is completed
    while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(
            thread.id,
            run.id
        );

        // Check for failed, cancelled, or expired status
        if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
            console.log(
                `Run status is '${runStatus.status}'. Unable to complete the request.`
            );
            break; // Exit the loop if the status indicates a failure or cancellation
        }
    }

    // Get the last assistant message from the messages array
    const messages = await openai.beta.threads.messages.list(thread.id);

    // Find the last message for the current run
    const lastMessageForRun = messages.data
        .filter(
            (message) =>
                message.run_id === run.id && message.role === "assistant"
        )
        .pop();


    if (lastMessageForRun) {
        console.log(`${lastMessageForRun.content[0].text.value} \n`);
    } else if (
        !["failed", "cancelled", "expired"].includes(runStatus.status)
    ) {
        console.log("No response received from the assistant.");
    }
    console.log("fkk off")

    return lastMessageForRun.content[0].text.value;
    }
    catch (e) {

    }
}


