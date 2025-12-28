import { useState } from 'react';

export function Login({ onLogin, onRegister }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            if (isRegistering) {
                await onRegister(email, password, name);
            } else {
                await onLogin(email, password);
            }
        } catch (err) {
            // Backend sends { error: '...' }, handleResponse throws with wrong property
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="login-container">
            <div className="login-card">
                <h2>{isRegistering ? 'Create Account' : 'Sign In'}</h2>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    {isRegistering && (
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
                    </button>
                </form>
                
                <div className="toggle-mode">
                    {isRegistering ? (
                        <p>
                            Already have an account?{' '}
                            <button 
                                type="button"
                                onClick={() => setIsRegistering(false)}
                            >
                                Sign in
                            </button>
                        </p>
                    ) : (
                        <p>
                            Don't have an account?{' '}
                            <button 
                                type="button"
                                onClick={() => setIsRegistering(true)}
                            >
                                Create one
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
