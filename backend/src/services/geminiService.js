const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();



// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateResponse = async (messages) => {
    try {
        console.log('Setting up Gemini model');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Format the conversation history for the model
        const systemPrompt = messages.find(msg => msg.role === 'system')?.content || 
          "انت مساعد طبي مصري ذكي, مبتتكلمش غير باللهجة العربية المصرية";
          
        // Filter out system messages for the conversation
        const conversationMessages = messages
          .filter(msg => msg.role !== 'system')
          .map(message => `${message.role}: ${message.content}`)
          .join("\n");
        
        const prompt = `${systemPrompt}\n\n${conversationMessages}`;
        console.log('Sending prompt to Gemini');
        
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800,
          },
        });

        console.log('Received response from Gemini');
        return result.response.text();
    } catch (error) {
        console.error('Error generating response:', error);
        throw new Error(`Failed to generate response: ${error.message}`);
    }
};

module.exports = {
    generateResponse
};
