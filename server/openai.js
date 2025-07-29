const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

async function generateResponse(messages, roomContext = '') {
  try {
    const systemPrompt = `You are a helpful AI assistant in a multi-user chat room. 
    ${roomContext ? `Context: ${roomContext}` : ''}
    
    Guidelines:
    - Be helpful, friendly, and engaging
    - Keep responses concise but informative
    - Address users by their names when mentioned
    - Be aware you're in a group chat with multiple participants
    - Don't repeat information unnecessarily
    - If someone asks a question, provide a clear answer`;

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return 'Sorry, I encountered an error processing your request. Please try again.';
  }
}

async function generateRoomSummary(messages) {
  try {
    const systemPrompt = `You are an AI assistant tasked with creating a brief summary of a chat room conversation. 
    Create a concise summary (2-3 sentences) of the main topics discussed.`;

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please summarize this conversation:\n\n${messages.map(m => `${m.username}: ${m.content}`).join('\n')}` }
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Summary Error:', error);
    return 'Unable to generate summary at this time.';
  }
}

module.exports = {
  generateResponse,
  generateRoomSummary
}; 