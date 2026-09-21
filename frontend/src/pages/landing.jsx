import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './landing.module.css';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className={styles.landingContainer}>
            <div className={styles.heroSection}>
                <div className={styles.heroLeft}>
                    <h1 className={styles.heroTitle}>
                        <span className={styles.accent}>Connect</span> with your loved ones.
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Crystal-clear video calls that bring people closer, no matter the distance. Anywhere. Anytime.
                    </p>
                    <div className={styles.heroActions}>
                        <button className={`${styles.btn} ${styles.primaryBtn}`} onClick={() => navigate('/login')}>
                            Start a Meeting
                        </button>
                        <button className={`${styles.btn} ${styles.secondaryBtn}`} onClick={() => navigate('/login')}>
                            Join a Meeting
                        </button>
                    </div>
                </div>
                
                <div className={styles.heroRight}>
                    <div className={styles.videoCardMockup1}>
                        <div className={styles.mockupHeader}>
                            <span className={styles.dot}></span>
                            <span className={styles.dot}></span>
                            <span className={styles.dot}></span>
                        </div>
                        <div className={styles.mockupBody}>
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=400&fit=crop" alt="User 1" />
                            <div className={styles.mockupLabel}>You</div>
                        </div>
                    </div>
                    <div className={styles.videoCardMockup2}>
                        <div className={styles.mockupHeader}>
                            <span className={styles.dot}></span>
                            <span className={styles.dot}></span>
                            <span className={styles.dot}></span>
                        </div>
                        <div className={styles.mockupBody}>
                            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=400&fit=crop" alt="User 2" />
                            <div className={styles.mockupLabel}>Alex</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.featuresSection}>
                <h2>Experience Premium Communication</h2>
                <div className={styles.featureGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>📹</div>
                        <h3>HD Video Calls</h3>
                        <p>High-quality real-time video communication with minimal latency.</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🎤</div>
                        <h3>Crystal Clear Audio</h3>
                        <p>Reliable audio communication with advanced noise suppression.</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🖥️</div>
                        <h3>Screen Sharing</h3>
                        <p>Share your screen seamlessly during meetings for collaboration.</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🔒</div>
                        <h3>Secure Meetings</h3>
                        <p>End-to-end encrypted rooms ensuring your privacy.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}