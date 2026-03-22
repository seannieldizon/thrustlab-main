/**
 * Client-side utility for handling activity scores
 */

export interface SaveScoreParams {
    activityType: string;
    score: number;
    metadata?: Record<string, any>;
}

export interface ActivityScoreResponse {
    success: boolean;
    data?: {
        id: number;
        score: number;
        completedAt: Date;
    };
    error?: string;
}

export interface GetScoresResponse {
    success: boolean;
    scores?: Array<{
        id: number;
        userId: string;
        activityType: string;
        score: number;
        completedAt: Date;
        metadata: Record<string, any> | null;
    }>;
    highScore?: number;
    totalAttempts?: number;
    error?: string;
}

/**
 * Save an activity score
 */
export async function saveActivityScore(params: SaveScoreParams): Promise<ActivityScoreResponse> {
    try {
        const response = await fetch('/api/activity-score/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to save score');
        }

        return data;
    } catch (error) {
        console.error('Error saving activity score:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Get activity scores for the current user
 */
export async function getActivityScores(
    activityType?: string,
    limit: number = 10
): Promise<GetScoresResponse> {
    try {
        const params = new URLSearchParams();
        if (activityType) params.set('activityType', activityType);
        params.set('limit', limit.toString());

        const response = await fetch(`/api/activity-score/get?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch scores');
        }

        return data;
    } catch (error) {
        console.error('Error fetching activity scores:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
