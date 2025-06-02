import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Calendar, User, CheckCircle2, Clock, AlertCircle, MoreVertical, LogOut } from 'lucide-react';

import { createUserWithEmailAndPassword, updateProfile,signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";





// Web3 Integration (Mock implementation)
const Web3Integration = () => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    // Mock Web3 connection
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // In a real app, you would use: await window.ethereum.request({ method: 'eth_requestAccounts' });
        const mockAccount = '0x' + Math.random().toString(16).substr(2, 40);
        setAccount(mockAccount);
        setIsConnected(true);
        return mockAccount;
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      // Mock connection for demo
      const mockAccount = '0x' + Math.random().toString(16).substr(2, 40);
      setAccount(mockAccount);
      setIsConnected(true);
      return mockAccount;
    }
  };

  return { account, isConnected, connectWallet };
};


// API Service for random profile images
const ProfileAPI = {
  getRandomProfile: async () => {
    const randomId = Math.floor(Math.random() * 1000);
    try {
      const response = await fetch(`https://picsum.photos/id/${randomId}/info`);
      const data = await response.json();
      return `https://picsum.photos/id/${randomId}/150/150`;
    } catch (error) {
      // Fallback to a default image if API fails
      return `https://picsum.photos/150/150?random=${randomId}`;
    }
  }
};

const saveUserToLocalStorage = (user) => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
};

const getUserFromLocalStorage = (email) => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  return users.find((user) => user.email === email);
};


// Login Component
const LoginPage = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const docSnap = await getDoc(doc(db, "users", user.uid));
    const userData = docSnap.exists() ? docSnap.data() : { name: user.email.split("@")[0] };

    onLogin({
      email: user.email,
      name: userData.name,
      profileImage: userData.profileImage
    });
  } catch (error) {
    alert("Invalid email or password");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Log in!</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2 text-center">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className="w-full px-4 py-3 bg-transparent border border-white/30 rounded text-white placeholder-white/70 focus:outline-none focus:border-white/50 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2 text-center">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full px-4 py-3 bg-transparent border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-colors"
                required
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-white text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/30"
              />
              <span>Remember me</span>
            </label>
            <button type="button" className="text-white/80 hover:text-white">
              Forgot Password?
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-blue-800 py-3 px-6 rounded font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-white/80 hover:text-white text-sm"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sign Up Component
const SignUpPage = ({ onSignUp, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!acceptTerms) {
    alert("Please accept the terms & conditions");
    return;
  }

  setIsLoading(true);

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const profileImage = await ProfileAPI.getRandomProfile();

    // Optional: update display name
    await updateProfile(user, { displayName: name });

    // Store user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      profileImage
    });

    onSignUp({ name, email, profileImage });
  } catch (error) {
    alert(error.message);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Sign up</h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2 text-center">
                Username
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
                className="w-full px-4 py-3 bg-transparent border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2 text-center">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className="w-full px-4 py-3 bg-transparent border border-white/30 rounded text-white placeholder-white/70 focus:outline-none focus:border-white/50 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2 text-center">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full px-4 py-3 bg-transparent border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-colors"
                required
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-white text-sm">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 rounded border-white/30"
            />
            <label htmlFor="terms" className="cursor-pointer">
              I accept the terms & conditions
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !acceptTerms}
            className="w-full bg-white text-blue-800 py-3 px-6 rounded font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Signing up...' : 'Sign up'}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-white/80 hover:text-white text-sm"
            >
              Already have an account? Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



// Task Item Component
const TaskItem = ({ task, onEdit, onDelete, onUpdateStatus }) => {
  const [showMenu, setShowMenu] = useState(false);

  

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex-1">{task.title}</h3>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 z-10 w-32">
              <button
                onClick={() => {
                  onEdit(task);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  onDelete(task.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          {getStatusIcon(task.status)}
          
        </div>
        
        <div className="flex items-center space-x-1 text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="mt-3">
        <select
          value={task.status}
          onChange={(e) => onUpdateStatus(task.id, e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
};

// Task Form Component
const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Task Board Component
const TaskBoard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { account, isConnected, connectWallet } = Web3Integration();



    useEffect(() => {
    if (!user?.email) return;

    const fetchTasks = async () => {
      try {
        const q = query(collection(db, "tasks"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        const userTasks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(userTasks);
      } catch (error) {
        console.error("Error fetching tasks: ", error);
      }
    };

    fetchTasks();
  }, [user.email]); // runs whenever user.email changes

  const addTask = async (taskData) => {
  // Remove the priority field
  const { priority, ...cleanedTaskData } = taskData;

  const newTask = {
    ...cleanedTaskData,
    createdAt: new Date().toISOString(),
    email: user.email
  };

  try {
    const docRef = await addDoc(collection(db, "tasks"), newTask);
    setTasks(prev => [...prev, { ...newTask, id: docRef.id }]);
    setShowTaskForm(false);
  } catch (error) {
    console.error("Error adding task: ", error);
  }
};


const updateTask = async (id, updates) => {
  try {
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, updates);

    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
    setEditingTask(null);
    setShowTaskForm(false);
  } catch (error) {
    console.error("Error updating task: ", error);
  }
};


const deleteTask = async (id) => {
  try {
    await deleteDoc(doc(db, "tasks", id));
    setTasks(prev => prev.filter(task => task.id !== id));
  } catch (error) {
    console.error("Error deleting task: ", error);
  }
};

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleTaskSubmit = (taskData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-800 rounded-sm flex items-center justify-center">
                <div className="text-white text-xs font-bold">TB</div>
              </div>
            </div>
            <h1 className="text-xl font-semibold">TasksBoard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isConnected && (
              <button
                onClick={connectWallet}
                className="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded text-sm transition-colors"
              >
                Connect Wallet
              </button>
            )}
            {isConnected && (
              <div className="text-xs text-blue-100">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </div>
            )}
            
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-600 hover:border-blue-400 transition-colors"
              >
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-lg py-2 z-10 w-48">
                  <div className="px-4 py-2 border-b">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Task List Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
                <div className="relative">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskForm(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Task</span>
              </button>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              Total: {tasks.length} tasks
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={deleteTask}
                onUpdateStatus={(id, status) => updateTask(id, { status })}
              />
            ))}
            
            {/* Add Task Card */}
            <div
              onClick={() => {
                setEditingTask(null);
                setShowTaskForm(true);
              }}
              className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 transition-colors cursor-pointer flex items-center justify-center min-h-[200px]"
            >
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-gray-500">Add New Task</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setEditingTask(null);
          setShowTaskForm(true);
        }}
        className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center md:hidden"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleSignUp = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  if (currentPage === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToSignup={() => setCurrentPage('signup')}
      />
    );
  }

  if (currentPage === 'signup') {
    return (
      <SignUpPage
        onSignUp={handleSignUp}
        onSwitchToLogin={() => setCurrentPage('login')}
      />
    );
  }

  return (
    <TaskBoard
      user={user}
      onLogout={handleLogout}
    />
  );
};

export default App;