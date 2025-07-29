# Demo Guide

This guide will walk you through the key features of the Multi-User LLM Chatbot.

## Demo Scenario

Let's create a scenario where multiple users interact with the AI chatbot in a shared chat room.

## Step 1: Setup

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Open multiple browser windows/tabs** to simulate different users

## Step 2: User Registration

### User 1 (Alice)
1. Go to `http://localhost:3000`
2. Click "create a new account"
3. Register with:
   - Username: `alice`
   - Email: `alice@example.com`
   - Password: `password123`

### User 2 (Bob)
1. Open a new incognito window
2. Go to `http://localhost:3000`
3. Register with:
   - Username: `bob`
   - Email: `bob@example.com`
   - Password: `password123`

### User 3 (Charlie)
1. Open another incognito window
2. Go to `http://localhost:3000`
3. Register with:
   - Username: `charlie`
   - Email: `charlie@example.com`
   - Password: `password123`

## Step 3: Create a Chat Room

### Alice creates a room:
1. Login as Alice
2. Click "Create Room"
3. Enter:
   - Room Name: `Project Discussion`
   - Description: `Let's discuss our new project ideas`
4. Click "Create Room"

## Step 4: Invite Users

### Alice invites Bob and Charlie:
1. In the chat room, click "Invite"
2. Enter `bob` and click "Invite"
3. Click "Invite" again
4. Enter `charlie` and click "Invite"

## Step 5: Multi-User Chat Demo

### All users join the room:
1. **Bob:** Login and click on "Project Discussion" room
2. **Charlie:** Login and click on "Project Discussion" room

### Start the conversation:

**Alice types:**
```
Hi everyone! I have some ideas for our new project. What do you think about building a task management app?
```

**AI responds automatically** (you'll see this happen in real-time)

**Bob types:**
```
That sounds great! I think we should focus on simplicity and ease of use.
```

**AI responds again**

**Charlie types:**
```
I agree with Bob. Maybe we could add some AI features to help with task prioritization?
```

**AI responds with suggestions**

## Step 6: Test Features

### Typing Indicators:
- Have users start typing but don't send messages
- Other users will see "X is typing" indicators

### Real-time Updates:
- Messages appear instantly for all users
- No need to refresh the page

### AI Integration:
- Every user message triggers an AI response
- AI maintains context of the conversation
- AI can reference previous messages

### Room Management:
- Click the participants button to see who's in the room
- Try inviting another user
- Create additional rooms for different topics

### Conversation Summary:
- Click the "Summary" button
- AI will generate a summary of the conversation
- Useful for catching up on long discussions

## Step 7: Advanced Features

### Multiple Rooms:
1. Create a second room called "Technical Discussion"
2. Invite different users
3. Have parallel conversations

### AI Behavior:
- Ask the AI specific questions
- Request help with coding problems
- Ask for brainstorming ideas
- The AI will respond contextually

### User Experience:
- Test the responsive design on different screen sizes
- Try the mobile view
- Test the logout/login flow

## Expected Behaviors

✅ **Real-time messaging** - Messages appear instantly for all users
✅ **AI responses** - Every user message gets an AI response
✅ **User presence** - See who's online and typing
✅ **Room management** - Easy to create, join, and invite users
✅ **Persistent storage** - Messages are saved and reloaded
✅ **Modern UI** - Clean, responsive interface
✅ **Error handling** - Graceful handling of network issues

## Troubleshooting Demo Issues

### AI not responding:
- Check your OpenAI API key in `.env`
- Verify you have API credits
- Check server logs for errors

### Messages not appearing:
- Check if Socket.IO is connected
- Refresh the page
- Check browser console for errors

### Users can't join:
- Verify the room exists
- Check if users were properly invited
- Ensure users are logged in

## Demo Tips

1. **Prepare questions** - Have some interesting topics ready to discuss
2. **Test edge cases** - Try sending very long messages, special characters
3. **Show responsiveness** - Resize the browser window
4. **Demonstrate features** - Use all the buttons and features
5. **Explain the tech** - Mention the technologies used (React, Socket.IO, OpenAI)

This demo showcases a fully functional multi-user chatbot with AI integration, real-time communication, and modern web technologies! 