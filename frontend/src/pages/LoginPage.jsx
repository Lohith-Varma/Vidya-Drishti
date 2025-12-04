import React, { useState, useEffect, useCallback } from 'react';

// --- Constants ---
// Theme Colors (Used only for logic and dynamic class names)
const THEMES = {
  student: {
    name: 'Student',
    roleClass: 'student',
    background: 'bg-white', // Base background is white for card
    colorHex: 'blue',
  },
  teacher: {
    name: 'Teacher',
    roleClass: 'teacher',
    background: 'bg-white',
    colorHex: 'purple',
  },
};

// Key for storing user data in localStorage
const USERS_KEY = 'mock_auth_users';
const CURRENT_USER_KEY = 'mock_auth_current_user';

// --- Mock Authentication Hook (Replaces Firebase) ---

function useMockAuth() {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error loading mock user from storage:", e);
      localStorage.removeItem(CURRENT_USER_KEY);
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  const signInUser = useCallback((userData) => {
    const userToStore = { 
      email: userData.email, 
      role: userData.role,
      id: userData.id || crypto.randomUUID(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
    setUser(userToStore);
  }, []);

  const signOutUser = useCallback(() => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  return { user, isAuthenticated, isAuthReady, signInUser, signOutUser };
}


// --- UI Components ---

const AuthSwitch = ({ mode, setMode, currentTheme }) => (
  <div className="auth-switch">
    <button
      onClick={() => setMode('signin')}
      className={`auth-btn ${
        mode === 'signin' ? `${currentTheme.roleClass}-switch-active` : 'auth-btn-inactive'
      }`}
    >
      Sign In
    </button>
    <button
      onClick={() => setMode('signup')}
      className={`auth-btn ${
        mode === 'signup' ? `${currentTheme.roleClass}-switch-active` : 'auth-btn-inactive'
      }`}
    >
      Sign Up
    </button>
  </div>
);

const RoleSwitch = ({ role, setRole }) => (
  <div className="role-switch">
    <button
      onClick={() => setRole('teacher')}
      className={`role-btn ${
        role === 'teacher' ? 'teacher-switch-active' : 'role-btn-inactive'
      }`}
    >
      Teacher Login
    </button>
    <button
      onClick={() => setRole('student')}
      className={`role-btn ${
        role === 'student' ? 'student-switch-active' : 'role-btn-inactive'
      }`}
    >
      Student Login
    </button>
  </div>
);

const InputField = ({ label, id, type = 'text', value, onChange, theme, isRequired = true }) => (
  <div className="input-group">
    <label htmlFor={id} className={`input-label ${theme.roleClass}-text`}>
      {label} {isRequired && <span className="required-star">*</span>}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      required={isRequired}
      className={`input-field ${theme.roleClass}-border ${theme.roleClass}-input-focus ${theme.roleClass}-text`}
    />
  </div>
);


// --- Mock Auth Logic Functions ---

const getUsers = () => {
    try {
        const stored = localStorage.getItem(USERS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Error retrieving user data from localStorage.", e);
        return [];
    }
};

const saveUsers = (users) => {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return true;
    } catch (e) {
        console.error("Error saving user data to localStorage.", e);
        return false;
    }
};

// --- Main Authentication Form Component ---
const AuthForm = ({ signInUser }) => {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [userRole, setUserRole] = useState('student'); // 'student' or 'teacher'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [regdNumber, setRegdNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const theme = userRole === 'student' ? THEMES.student : THEMES.teacher;

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const users = getUsers();
    
    if (authMode === 'signup') {
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        setError("Account already exists with this email.");
      } else {
        const newUser = {
          id: crypto.randomUUID(),
          email,
          password, // NOTE: Storing plain passwords in localStorage is INSECURE in a real app
          role: userRole,
          name,
          regdNumber,
        };
        users.push(newUser);
        if (saveUsers(users)) {
          signInUser(newUser);
        } else {
          setError("Failed to save user data.");
        }
      }
    } else { // signin
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        signInUser({ email: user.email, role: user.role, id: user.id });
      } else {
        setError("Invalid email or password.");
      }
    }

    setIsLoading(false);
  };

  return (
    <div className={`auth-card ${theme.background}`}>
      
      {/* Role Switch */}
      <RoleSwitch role={userRole} setRole={setUserRole} />

      {/* Auth Mode Switch */}
      <AuthSwitch mode={authMode} setMode={setAuthMode} currentTheme={theme} />

      <h2 className={`card-title ${theme.roleClass}-text`}>
        {authMode === 'signin' ? 'Welcome Back' : 'Create Account'} as a {theme.name}
      </h2>

      <form onSubmit={handleAuth} className="form-content">
        
        {authMode === 'signup' && (
          <>
            <InputField 
              label="Name" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              theme={theme} 
              isRequired={true}
            />
            <InputField 
              label="Regd number" 
              id="regdNumber" 
              value={regdNumber} 
              onChange={(e) => setRegdNumber(e.target.value)} 
              theme={theme} 
              isRequired={false}
            />
          </>
        )}

        <InputField 
          label="Email" 
          id="email" 
          type="email"
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          theme={theme} 
        />
        <InputField 
          label="Password" 
          id="password" 
          type="password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          theme={theme} 
        />

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`submit-btn ${theme.roleClass}-primary`}
        >
          {isLoading 
            ? <svg className="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 
            : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};


// 4. Simple Dashboard View (Placeholder)
const Dashboard = ({ user, handleSignOut }) => {
    // Use the role from the logged-in user object for theming
    const theme = user.role === 'student' ? THEMES.student : THEMES.teacher;

    return (
        <div className={`dashboard-card ${theme.roleClass}-dashboard-border`}>
            <h1 className={`dashboard-title ${theme.roleClass}-dashboard-title`}>
                Welcome, {theme.name}!
            </h1>
            <p className="dashboard-subtitle">
                You are successfully logged in.
            </p>
            <p className="dashboard-info">
                {user.email} (ID: {user.id.substring(0, 8)}...)
            </p>

            <button
                onClick={handleSignOut}
                className={`sign-out-btn ${theme.roleClass}-primary`}
            >
                Sign Out
            </button>
        </div>
    );
}

// 5. Main Application Component
function LoginPage() {
  const { user, isAuthenticated, isAuthReady, signInUser, signOutUser } = useMockAuth();

  const CSS_STYLES = `
    /* Base Styles */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
    
    .app-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f3f4f6; /* bg-gray-100 */
        padding: 1rem;
        font-family: 'Inter', sans-serif;
    }

    .auth-card, .dashboard-card {
        width: 100%;
        max-width: 448px; /* max-w-md */
        padding: 2rem; /* p-8 */
        border-radius: 0.75rem; /* rounded-xl */
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); /* shadow-2xl */
        transition: all 0.5s ease-in-out;
        box-sizing: border-box;
    }
    .dashboard-card { 
        max-width: 576px; /* max-w-lg */
        text-align: center;
    }
    .bg-white { background-color: #ffffff; }

    .card-title {
        font-size: 1.5rem; /* text-2xl */
        font-weight: 700; /* font-bold */
        text-align: center;
        margin-bottom: 1.5rem; /* mb-6 */
    }
    
    .form-content {
        display: flex;
        flex-direction: column;
        gap: 1rem; /* space-y-4 */
    }

    /* Role Switch & Auth Switch */
    .role-switch, .auth-switch {
        display: flex;
        background-color: #e5e7eb; /* bg-gray-200 */
        padding: 0.25rem; /* p-1 */
        border-radius: 9999px; /* rounded-full */
        box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); /* shadow-inner */
        width: 100%;
        max-width: 384px; /* max-w-sm */
        margin-left: auto;
        margin-right: auto;
    }
    .role-switch { margin-bottom: 2rem; } /* mb-8 */
    .auth-switch { margin-bottom: 1.5rem; } /* mb-6 */
    
    .role-btn, .auth-btn {
        flex: 1;
        padding: 0.5rem;
        font-size: 0.875rem; /* text-sm */
        font-weight: 600; /* font-semibold */
        border-radius: 9999px;
        transition: background-color 0.3s, color 0.3s;
        border: none;
        cursor: pointer;
    }

    /* Auth Switch Inactive state */
    .auth-btn-inactive { color: #4b5563; background-color: transparent; } /* text-gray-600 */
    .auth-btn-inactive:hover { background-color: #f3f4f6; } /* hover:bg-gray-100 */

    /* Role Button Inactive state (Slightly different hover for contrast) */
    .role-btn-inactive { color: #374151; background-color: transparent; } /* text-gray-700 */
    .role-btn-inactive:hover { background-color: #d1d5db; } /* hover:bg-gray-300 */


    /* Input Field */
    .input-group { margin-bottom: 1rem; }
    .input-label { display: block; font-size: 0.875rem; font-weight: 500; }
    .input-field {
        margin-top: 0.25rem;
        display: block;
        width: 100%;
        padding: 0.5rem 1rem;
        border: 2px solid;
        border-radius: 0.5rem;
        transition: all 0.15s;
        outline: none;
    }
    .required-star { color: #ef4444; } /* text-red-500 */

    /* Error Message */
    .error-message {
        padding: 0.75rem;
        background-color: #fef2f2; /* bg-red-100 */
        color: #b91c1c; /* text-red-700 */
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
    }

    /* Submit Button & Sign Out Button */
    .submit-btn {
        width: 100%;
        padding-top: 0.75rem;
        padding-bottom: 0.75rem;
        margin-top: 1.5rem; /* mt-6 */
        font-size: 1.125rem; /* text-lg */
        font-weight: 700; /* font-bold */
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); /* shadow-xl */
        transition: transform 0.2s, opacity 0.2s;
        border: none;
        cursor: pointer;
    }
    .submit-btn:hover:not(:disabled) {
        transform: scale(1.01);
    }
    .submit-btn:disabled {
        opacity: 0.5;
    }
    .sign-out-btn {
        padding: 0.75rem 2rem;
        color: white;
        font-weight: 700;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
        border: none;
        cursor: pointer;
    }
    .sign-out-btn:hover {
        transform: scale(1.03);
    }
    

    /* Dashboard Styles */
    .dashboard-card {
        border-top-width: 8px; /* border-t-8 */
        background-color: #ffffff;
    }

    .dashboard-title {
        font-size: 2.25rem; /* text-4xl */
        font-weight: 800; /* font-extrabold */
        margin-bottom: 1rem;
    }
    .dashboard-subtitle {
        font-size: 1.25rem;
        color: #4b5563;
        margin-bottom: 0.5rem;
    }
    .dashboard-info {
        font-size: 1.125rem;
        font-family: monospace;
        color: #6b7280;
        margin-bottom: 2rem;
        padding: 0.75rem;
        background-color: #f9fafb;
        border-radius: 0.5rem;
        word-break: break-all;
    }

    /* Theme-Specific Classes (Student: Blue) */
    .student-text { color: #2563eb; } /* text-blue-600 */
    .student-border { border-color: #93c5fd; } /* border-blue-300 */
    .student-primary { background-color: #2563eb; } /* bg-blue-600 */
    .student-primary:hover:not(:disabled) { background-color: #1d4ed8; } /* hover:bg-blue-700 */
    .student-switch-active { background-color: #2563eb; color: white; }
    .student-dashboard-border { border-color: #3b82f6; } /* border-blue-500 */
    .student-dashboard-title { color: #1d4ed8; } /* text-blue-700 */
    .student-input-focus:focus { box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.5); }
    .student-input-focus:focus { border-color: #2563eb; }


    /* Theme-Specific Classes (Teacher: Purple) */
    .teacher-text { color: #7c3aed; } /* text-purple-600 */
    .teacher-border { border-color: #d8b4fe; } /* border-purple-300 */
    .teacher-primary { background-color: #7c3aed; } /* bg-purple-600 */
    .teacher-primary:hover:not(:disabled) { background-color: #6d28d9; } /* hover:bg-purple-700 */
    .teacher-switch-active { background-color: #7c3aed; color: white; }
    .teacher-dashboard-border { border-color: #8b5cf6; } /* border-purple-500 */
    .teacher-dashboard-title { color: #6d28d9; } /* text-purple-700 */
    .teacher-input-focus:focus { box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.5); }
    .teacher-input-focus:focus { border-color: #7c3aed; }

    /* Animation (Spinning loader) */
    .animate-spin {
        animation: spin 1s linear infinite;
        vertical-align: middle;
        display: inline-block;
        margin-right: 0.5rem;
    }
    .animate-spin svg {
        width: 1.25rem; /* h-5 w-5 */
        height: 1.25rem;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
  `;

  // Loading State
  if (!isAuthReady) {
    return (
      <div className="app-container">
        <style>{CSS_STYLES}</style>
        <div className="p-8 text-xl font-semibold text-gray-600">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <style>{CSS_STYLES}</style>
      {isAuthenticated ? (
        <Dashboard 
          user={user} 
          handleSignOut={signOutUser}
        />
      ) : (
        <AuthForm 
          signInUser={signInUser} 
        />
      )}
    </div>
  );
}

export default LoginPage;
