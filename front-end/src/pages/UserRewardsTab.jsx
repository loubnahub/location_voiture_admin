// src/components/users/UserRewardsTab.jsx
import React, { useState, useEffect } from 'react';
import { Card, ProgressBar, Spinner, Alert, Button, Badge, ListGroup } from 'react-bootstrap';
import { LuAward, LuTicket, LuClipboard, LuClipboardCheck } from 'react-icons/lu';
import { fetchUserRewardsAdmin } from '../services/api'; // Adjust path if needed

const UserRewardsTab = ({ userId }) => {
    const [rewardsData, setRewardsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const loadRewards = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetchUserRewardsAdmin(userId);
                setRewardsData(response.data.data);
            } catch (err) {
                setError('Failed to load user rewards.');
                console.error(`Error fetching rewards for user ${userId}:`, err);
            } finally {
                setLoading(false);
            }
        };
        loadRewards();
    }, [userId]);

    const handleCopyCode = (codeString) => {
        navigator.clipboard.writeText(codeString);
        setCopiedCode(codeString);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (loading) return <div className="text-center p-4"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!rewardsData) return <Alert variant="light">No rewards data available for this user.</Alert>;

    const { loyalty_points, next_level_points, points_to_next_level, promotion_codes } = rewardsData;
    const progressPercent = next_level_points ? (loyalty_points / next_level_points) * 100 : 100;

    return (
        <div>
            <h5 className="mb-4"><LuAward className="me-2" />Loyalty Status</h5>
            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between">
                        <span>Current Points: <strong>{loyalty_points}</strong></span>
                        {next_level_points && <span>Next Reward: <strong>{next_level_points}</strong></span>}
                    </div>
                    <ProgressBar now={progressPercent} striped variant="success" className="my-2" />
                    {points_to_next_level ? (
                        <div className="text-center small">
                            {points_to_next_level} points away from the next reward.
                        </div>
                    ) : (
                         <div className="text-center small text-success">
                            Highest loyalty level reached!
                        </div>
                    )}
                </Card.Body>
            </Card>

            <h5 className="mb-3"><LuTicket className="me-2" />Promotion Codes</h5>
            {promotion_codes.length > 0 ? (
                <ListGroup>
                    {promotion_codes.map(code => (
                        <ListGroup.Item key={code.id} className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{code.code_string}</strong>
                                <small className="d-block text-muted">{code.campaign_name} ({code.reward_display})</small>
                                <small className="d-block text-muted">
                                    Status: <Badge bg={code.status.value === 'active' ? 'success' : 'secondary'}>{code.status_display}</Badge>
                                </small>
                            </div>
                            <Button size="sm" variant="outline-secondary" onClick={() => handleCopyCode(code.code_string)}>
                                {copiedCode === code.code_string ? <LuClipboardCheck /> : <LuClipboard />}
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <Alert variant="info">This user has no promotion codes.</Alert>
            )}
        </div>
    );
};

export default UserRewardsTab;