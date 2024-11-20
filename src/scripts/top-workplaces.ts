import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL;

if (!API_BASE_URL) {
    console.error('Error: API_BASE_URL is not defined.');
    process.exit(1);
}

interface Workplace {
    id: number;
    name: string;
    status: number;
}

interface Shift {
    id: number;
    workplaceId: number;
}

interface WorkplaceWithShifts {
    name: string;
    shifts: number;
}

/**
 * Fetch all workplaces with proper pagination and sharding.
 */
async function fetchAllWorkplaces(): Promise<Workplace[]> {
    let allWorkplaces: Workplace[] = [];
    let shard = 0;
    const limit = 10; // Set based on PAGE_SIZE in pagination.ts

    while (true) {
        let page = 1;
        let hasNextPage = true;
        let shardWorkplacesFetched = false;

        while (hasNextPage) {
            try {
                const response = await axios.get(`${API_BASE_URL}/workplaces`, {
                    params: { page, limit, shard },
                });

                const workplaces: Workplace[] = Array.isArray(response.data.data)
                    ? response.data.data
                    : [];

                if (workplaces.length === 0) {
                    hasNextPage = false;
                    break;
                }

                allWorkplaces = allWorkplaces.concat(workplaces);
                shardWorkplacesFetched = true;

                // Check if 'links.next' exists
                hasNextPage = !!response.data.links.next;
                page++;
            } catch (error: any) {
                console.error('Failed to fetch workplaces:', error.message);
                process.exit(1);
            }
        }

        if (!shardWorkplacesFetched) {
            // No workplaces found for this shard, assuming no more shards
            break;
        }

        shard++;
    }

    return allWorkplaces;
}

/**
 * Fetch all shifts with proper pagination.
 */
async function fetchAllShifts(): Promise<Shift[]> {
    let page = 1;
    const limit = 10; // Based on observed pagination (10 shifts per page)
    let allShifts: Shift[] = [];
    let hasNextPage = true;

    while (hasNextPage) {
        try {
            const response = await axios.get(`${API_BASE_URL}/shifts`, {
                params: { page, limit },
            });

            const shifts: Shift[] = Array.isArray(response.data.data)
                ? response.data.data
                : [];

            if (shifts.length === 0) {
                hasNextPage = false;
                break;
            }

            allShifts = allShifts.concat(shifts);

            // Check if 'links.next' exists
            hasNextPage = !!response.data.links.next;
            page++;
        } catch (error: any) {
            console.error('Failed to fetch shifts:', error.message);
            process.exit(1);
        }
    }

    return allShifts;
}

/**
 * Get the top 3 active workplaces based on shift counts.
 */
async function getTopWorkplaces(): Promise<WorkplaceWithShifts[]> {
    const workplaces = await fetchAllWorkplaces();
    const shifts = await fetchAllShifts();

    // Filter active workplaces (status === 0)
    const activeWorkplaces = workplaces.filter(wp => wp.status === 0);

    // Count shifts per workplace
    const shiftCounts: Record<number, number> = {};
    shifts.forEach(shift => {
        if (shift.workplaceId) {
            shiftCounts[shift.workplaceId] = (shiftCounts[shift.workplaceId] || 0) + 1;
        }
    });

    // Map workplaces to their shift counts
    const workplacesWithShifts: WorkplaceWithShifts[] = activeWorkplaces.map(wp => ({
        name: wp.name,
        shifts: shiftCounts[wp.id] || 0,
    }));

    // Sort by shifts descending and take top 3
    workplacesWithShifts.sort((a, b) => b.shifts - a.shifts);

    return workplacesWithShifts.slice(0, 3);
}

/**
 * Main function to execute the script.
 */
async function main() {
    try {
        const topWorkplaces = await getTopWorkplaces();
        console.log(JSON.stringify(topWorkplaces, null, 2));
    } catch (error: any) {
        console.error('An unexpected error occurred:', error.message);
        process.exit(1);
    }
}

main();
