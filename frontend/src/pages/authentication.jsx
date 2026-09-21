import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import styles from './authentication.module.css';

export default function Authentication() {
    const location = useLocation();
    const navigate = useNavigate();
    const { handleRegister, handleLogin } = useContext(AuthContext);

    const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsLogin(location.pathname !== '/register');
    }, [location.pathname]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await handleLogin(username, password);
                // AuthContext handles redirect to /home on success
            } else {
                if (!name) {
                    setError('Full Name is required');
                    setLoading(false);
                    return;
                }
                await handleRegister(name, username, password);
                // If successful, switch to login
                setIsLogin(true);
                setPassword('');
                navigate('/login');
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError(`An error occurred: ${err.message || 'Please try again.'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authLeft}>
                <div className={styles.brandContainer} onClick={() => navigate('/')}>
                    <h2>EchoMeet</h2>
                </div>
                <div className={styles.visualContent}>
                    <h1>Your people are just one call away.</h1>
                    <p>Join the next generation of video communication.</p>
                </div>
            </div>
            
            <div className={styles.authRight}>
                <div className={styles.formCard}>
                    <h2>{isLogin ? 'Welcome back' : 'Create an account'}</h2>
                    <p className={styles.subtitle}>
                        {isLogin ? 'Please enter your details to sign in.' : 'Start your journey with EchoMeet.'}
                    </p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {!isLogin && (
                            <div className={styles.inputGroup}>
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="John Doe"
                                    required 
                                />
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label>Username</label>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                placeholder="johndoe123"
                                required 
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Password</label>
                            <div className={styles.passwordWrapper}>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="••••••••"
                                    required 
                                />
                                <button 
                                    type="button" 
                                    className={styles.eyeBtn}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {error && <div className={styles.errorMessage}>{error}</div>}

                        <button 
                            type="submit" 
                            className={styles.submitBtn} 
                            disabled={loading}
                        >
                            {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Create Account')}
                        </button>
                    </form>

                    <div className={styles.switchMode}>
                        {isLogin ? (
                            <p>Don't have an account? <span onClick={() => navigate('/register')}>Sign up</span></p>
                        ) : (
                            <p>Already have an account? <span onClick={() => navigate('/login')}>Log in</span></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}