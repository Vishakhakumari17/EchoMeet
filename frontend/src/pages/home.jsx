import React, { useContext, useState, useEffect } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import styles from './home.module.css';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory, getHistoryOfUser } = useContext(AuthContext);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getHistoryOfUser();
                setHistory(data.slice(0, 3)); // Get top 3 recent
            } catch (e) {
                console.log(e);
            }
        };
        fetchHistory();
    }, [getHistoryOfUser]);

    let handleJoinVideoCall = async () => {
        if (!meetingCode) return;
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    let generateMeetingId = () => {
        return Math.random().toString(36).substring(2, 10);
    };

    let handleNewMeeting = async () => {
        const newCode = generateMeetingId();
        await addToUserHistory(newCode);
        navigate(`/${newCode}`);
    };

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1>Dashboard</h1>
                <p>Welcome back to EchoMeet. Ready for your next meeting?</p>
            </header>

            <div className={styles.mainGrid}>
                <div className={styles.actionsCard}>
                    <h2>Quick Actions</h2>
                    <div className={styles.actionButtons}>
                        <button className={`${styles.actionBtn} ${styles.primaryBtn}`} onClick={handleNewMeeting}>
                            <span className={styles.btnIcon}>+</span>
                            <div className={styles.btnText}>
                                <strong>New Meeting</strong>
                                <span>Create a new secure meeting</span>
                            </div>
                        </button>
                    </div>

                    <div className={styles.joinSection}>
                        <h3>Or join an existing meeting</h3>
                        <div className={styles.joinInputGroup}>
                            <input 
                                type="text" 
                                placeholder="Enter meeting code..." 
                                value={meetingCode}
                                onChange={(e) => setMeetingCode(e.target.value)}
                            />
                            <button className={styles.joinBtn} onClick={handleJoinVideoCall}>Join</button>
                        </div>
                    </div>
                </div>

                <div className={styles.historyCard}>
                    <div className={styles.historyHeader}>
                        <h2>Recent Meetings</h2>
                        <button className={styles.textBtn} onClick={() => navigate('/history')}>View All</button>
                    </div>
                    
                    {history.length > 0 ? (
                        <div className={styles.historyList}>
                            {history.map((item, index) => (
                                <div key={index} className={styles.historyItem}>
                                    <div className={styles.historyIcon}>📞</div>
                                    <div className={styles.historyDetails}>
                                        <strong>{item.meetingCode}</strong>
                                        <span>{new Date(item.date).toLocaleString()}</span>
                                    </div>
                                    <button 
                                        className={styles.joinAgainBtn}
                                        onClick={() => navigate(`/${item.meetingCode}`)}
                                    >
                                        Rejoin
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No recent meetings found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default withAuth(HomeComponent);