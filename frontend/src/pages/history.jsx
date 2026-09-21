import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './history.module.css';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [getHistoryOfUser]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.historyContainer}>
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/home')}>
                    ← Back to Dashboard
                </button>
                <h1>Meeting History</h1>
                <p>View all your past meetings and connections.</p>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading history...</div>
            ) : meetings.length > 0 ? (
                <div className={styles.grid}>
                    {meetings.map((meeting, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconWrapper}>📞</div>
                                <div>
                                    <h3>{meeting.meetingCode}</h3>
                                    <span className={styles.date}>{formatDate(meeting.date)}</span>
                                </div>
                            </div>
                            <div className={styles.cardActions}>
                                <button 
                                    className={styles.joinBtn}
                                    onClick={() => navigate(`/${meeting.meetingCode}`)}
                                >
                                    Rejoin Room
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <p>No meeting history found. Start a new meeting from the dashboard!</p>
                </div>
            )}
        </div>
    );
}