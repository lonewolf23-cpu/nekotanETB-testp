import React, { useState, useEffect } from 'react';
import { Bot, MessageSquare, Users, Settings, Send, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const API_BASE = 'http://localhost:4000/api';

interface Message {
  id: number;
  tg_id: string;
  from_user: string;
  chat_id: string;
  text: string;
  received_at: string;
}

interface User {
  id: number;
  tg_id: string;
  username: string;
  first_name: string;
  last_name: string;
  last_seen: string;
}

interface Command {
  id: number;
  name: string;
  description: string;
  response: string;
}

interface Analytics {
  total_messages: number;
  total_users: number;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({ total_messages: 0, total_users: 0 });
  const [newCommand, setNewCommand] = useState({ name: '', description: '', response: '' });
  const [sendMessage, setSendMessage] = useState({ chat_id: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [messagesRes, usersRes, commandsRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/messages`),
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/commands`),
        fetch(`${API_BASE}/analytics`)
      ]);

      if (messagesRes.ok) setMessages(await messagesRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (commandsRes.ok) setCommands(await commandsRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreateCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCommand)
      });
      if (response.ok) {
        setNewCommand({ name: '', description: '', response: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating command:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendMessage)
      });
      if (response.ok) {
        setSendMessage({ chat_id: '', text: '' });
        alert('Message sent successfully!');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  const handleDeleteCommand = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/commands/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting command:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Telegram Bot Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage your Telegram bot, monitor messages, and configure commands</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_messages}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_users}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commands</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{commands.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="commands">Commands</TabsTrigger>
            <TabsTrigger value="send">Send Message</TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Latest messages received by your bot</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>Chat ID</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-medium">{message.from_user}</TableCell>
                        <TableCell>{message.chat_id}</TableCell>
                        <TableCell className="max-w-xs truncate">{message.text}</TableCell>
                        <TableCell>{new Date(message.received_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Bot Users</CardTitle>
                <CardDescription>Users who have interacted with your bot</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Telegram ID</TableHead>
                      <TableHead>Last Seen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">@{user.username || 'N/A'}</TableCell>
                        <TableCell>{`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}</TableCell>
                        <TableCell>{user.tg_id}</TableCell>
                        <TableCell>{new Date(user.last_seen).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commands">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Command</CardTitle>
                  <CardDescription>Add a new command for your bot to respond to</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCommand} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Command Name</label>
                        <Input
                          placeholder="/start"
                          value={newCommand.name}
                          onChange={(e) => setNewCommand({ ...newCommand, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Input
                          placeholder="Start command"
                          value={newCommand.description}
                          onChange={(e) => setNewCommand({ ...newCommand, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Response</label>
                      <Textarea
                        placeholder="Welcome to our bot!"
                        value={newCommand.response}
                        onChange={(e) => setNewCommand({ ...newCommand, response: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <Button type="submit">Create Command</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Commands</CardTitle>
                  <CardDescription>Manage your bot's commands</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Command</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Response</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commands.map((command) => (
                        <TableRow key={command.id}>
                          <TableCell className="font-medium">{command.name}</TableCell>
                          <TableCell>{command.description}</TableCell>
                          <TableCell className="max-w-xs truncate">{command.response}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCommand(command.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Send Message</CardTitle>
                <CardDescription>Send a message to a specific chat</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Chat ID</label>
                    <Input
                      placeholder="123456789"
                      value={sendMessage.chat_id}
                      onChange={(e) => setSendMessage({ ...sendMessage, chat_id: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      placeholder="Type your message here..."
                      value={sendMessage.text}
                      onChange={(e) => setSendMessage({ ...sendMessage, text: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;