import { writable, derived } from 'svelte/store';

export interface SearchResult {
    title: string;
    content: string;
    url: string;
    module: string;
    section: string;
    matchScore: number;
}

export const searchQuery = writable('');
export const searchResults = writable<SearchResult[]>([]);
export const isSearching = writable(false);
export const showSearchModal = writable(false);

// Helper function to highlight search terms in text
export function highlightText(text: string, query: string): string {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.split(' ').filter(q => q).join('|')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Calculate match score based on query
function calculateMatchScore(text: string, query: string): number {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(' ').filter(w => w);

    let score = 0;

    // Exact phrase match gets highest score
    if (lowerText.includes(lowerQuery)) {
        score += 100;
    }

    // Individual word matches
    queryWords.forEach(word => {
        const wordCount = (lowerText.match(new RegExp(word, 'g')) || []).length;
        score += wordCount * 10;
    });

    // Bonus for match at beginning
    if (lowerText.startsWith(lowerQuery)) {
        score += 50;
    }

    return score;
}

// Search through content
export function performSearch(query: string, allContent: SearchResult[]): void {
    if (!query.trim()) {
        searchResults.set([]);
        return;
    }

    isSearching.set(true);

    const results = allContent
        .map(item => ({
            ...item,
            matchScore: calculateMatchScore(`${item.title} ${item.content}`, query)
        }))
        .filter(item => item.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 20); // Limit to top 20 results

    searchResults.set(results);
    isSearching.set(false);
}
